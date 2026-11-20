package com.changeguard.service;

import com.changeguard.dto.history.*;
import com.changeguard.exception.ResourceNotFoundException;
import com.changeguard.exception.ValidationException;
import com.changeguard.model.RiskAnalysisHistory;
import com.changeguard.model.enums.Criticality;
import com.changeguard.model.enums.Severity;
import com.changeguard.repository.RiskAnalysisHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Phase 12 Service: Continuous Change Monitoring & Risk History Service.
 * Manages risk analysis history persistence, outcome tracking, prediction classification,
 * high-risk service rankings, trend metrics, and historical ML accuracy validation.
 */
@Service
@Transactional(readOnly = true)
public class RiskAnalysisHistoryService {

    private static final Logger log = LoggerFactory.getLogger(RiskAnalysisHistoryService.class);

    private final RiskAnalysisHistoryRepository historyRepository;

    @Value("${changeguard.risk.history.min-labeled-samples:10}")
    private long minLabeledSamples;

    @Value("${changeguard.ml.prediction-threshold:0.50}")
    private double mlPredictionThreshold;

    public RiskAnalysisHistoryService(RiskAnalysisHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    /**
     * Retrieves all historical risk analysis evaluations.
     */
    public List<RiskHistoryResponseDto> getAllHistory() {
        return historyRepository.findAllByOrderByAnalysisTimestampDesc()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single historical risk analysis record by ID.
     */
    public RiskHistoryResponseDto getHistoryById(Long id) {
        RiskAnalysisHistory history = historyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Risk analysis history record not found with id: " + id));
        return mapToDto(history);
    }

    /**
     * Retrieves risk history records for a specific microservice.
     */
    public List<RiskHistoryResponseDto> getHistoryByService(Long serviceId) {
        return historyRepository.findByServiceIdOrderByAnalysisTimestampDesc(serviceId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Records the actual observed production outcome (incident / no incident).
     */
    @Transactional
    public RiskHistoryResponseDto recordOutcome(Long id, OutcomeRecordRequest request) {
        if (request == null || request.getActualIncident() == null) {
            throw new ValidationException("actualIncident boolean field is required (true/false)");
        }

        RiskAnalysisHistory history = historyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Risk analysis history record not found with id: " + id));

        history.setActualIncident(request.getActualIncident());
        if (Boolean.TRUE.equals(request.getActualIncident())) {
            history.setActualIncidentSeverity(request.getActualIncidentSeverity() != null ?
                    request.getActualIncidentSeverity() : Severity.MEDIUM);
        } else {
            history.setActualIncidentSeverity(null);
        }
        history.setOutcomeUpdatedAt(LocalDateTime.now());

        RiskAnalysisHistory updated = historyRepository.save(history);
        log.info("Recorded deployment outcome for history id {}: incident={}, severity={}",
                id, updated.getActualIncident(), updated.getActualIncidentSeverity());

        return mapToDto(updated);
    }

    /**
     * Aggregates services that repeatedly appear in high-risk change operations.
     */
    public List<HighRiskServiceStatDto> getHighRiskServices() {
        List<Object[]> rows = historyRepository.findHighRiskServiceAggregates();
        List<HighRiskServiceStatDto> stats = new ArrayList<>();

        for (Object[] r : rows) {
            Long serviceId = ((Number) r[0]).longValue();
            String serviceName = (String) r[1];
            String critStr = r[2] != null ? r[2].toString() : "MEDIUM";
            Long analyzedCount = ((Number) r[3]).longValue();
            Long highRiskCount = ((Number) r[4]).longValue();
            Long incidentsCount = r[5] != null ? ((Number) r[5]).longValue() : 0L;
            Double avgScore = r[6] != null ? round(((Number) r[6]).doubleValue()) : 0.0;

            double incRate = analyzedCount > 0 ? round((double) incidentsCount / (double) analyzedCount) : 0.0;

            stats.add(new HighRiskServiceStatDto(
                    serviceId,
                    serviceName,
                    critStr,
                    analyzedCount,
                    highRiskCount,
                    incidentsCount,
                    avgScore,
                    incRate
            ));
        }

        return stats;
    }

    /**
     * Calculates historical risk score and incident trends grouped by calendar date.
     */
    public RiskTrendsResponseDto getRiskTrends() {
        List<RiskAnalysisHistory> all = historyRepository.findAllByOrderByAnalysisTimestampDesc();
        if (all.isEmpty()) {
            return new RiskTrendsResponseDto(Collections.emptyList(), 0L);
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, List<RiskAnalysisHistory>> groupedByDay = all.stream()
                .collect(Collectors.groupingBy(h -> h.getAnalysisTimestamp().format(fmt), LinkedHashMap::new, Collectors.toList()));

        List<RiskTrendsResponseDto.TrendPoint> points = new ArrayList<>();
        for (Map.Entry<String, List<RiskAnalysisHistory>> entry : groupedByDay.entrySet()) {
            String date = entry.getKey();
            List<RiskAnalysisHistory> list = entry.getValue();

            double avgRisk = list.stream().mapToDouble(RiskAnalysisHistory::getRiskScore).average().orElse(0.0);
            long highRisk = list.stream().filter(h -> "HIGH".equalsIgnoreCase(h.getRiskLevel()) || "CRITICAL".equalsIgnoreCase(h.getRiskLevel())).count();
            long incidents = list.stream().filter(h -> Boolean.TRUE.equals(h.getActualIncident())).count();

            points.add(new RiskTrendsResponseDto.TrendPoint(
                    date,
                    round(avgRisk),
                    (long) list.size(),
                    highRisk,
                    incidents
            ));
        }

        // Return chronological order
        Collections.reverse(points);
        return new RiskTrendsResponseDto(points, (long) all.size());
    }

    /**
     * Calculates historical ML prediction performance metrics based on verified labeled outcomes.
     */
    public HistoricalMLPerformanceDto getMLPerformanceMetrics() {
        List<RiskAnalysisHistory> labeled = historyRepository.findLabeledMLOutcomes();
        long sampleCount = labeled.size();

        if (sampleCount < minLabeledSamples) {
            return HistoricalMLPerformanceDto.notEnoughData(sampleCount, minLabeledSamples);
        }

        long tp = 0;
        long tn = 0;
        long fp = 0;
        long fn = 0;

        for (RiskAnalysisHistory h : labeled) {
            boolean actual = Boolean.TRUE.equals(h.getActualIncident());
            boolean pred = h.getMlPrediction() != null && h.getMlPrediction() == 1;

            if (pred && actual) {
                tp++;
            } else if (!pred && !actual) {
                tn++;
            } else if (pred && !actual) {
                fp++;
            } else if (!pred && actual) {
                fn++;
            }
        }

        long total = tp + tn + fp + fn;
        double accuracy = total > 0 ? (double) (tp + tn) / (double) total : 0.0;
        double precision = (tp + fp) > 0 ? (double) tp / (double) (tp + fp) : 0.0;
        double recall = (tp + fn) > 0 ? (double) tp / (double) (tp + fn) : 0.0;
        double f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0.0;

        HistoricalMLPerformanceDto dto = new HistoricalMLPerformanceDto();
        dto.setStatus("OK");
        dto.setLabeledSamples(sampleCount);
        dto.setMinRequiredSamples(minLabeledSamples);
        dto.setThreshold(mlPredictionThreshold);
        dto.setAccuracy(round(accuracy));
        dto.setPrecision(round(precision));
        dto.setRecall(round(recall));
        dto.setF1(round(f1));
        dto.setTruePositives(tp);
        dto.setTrueNegatives(tn);
        dto.setFalsePositives(fp);
        dto.setFalseNegatives(fn);
        dto.setMessage("Metrics computed successfully from verified production deployment changelogs.");

        return dto;
    }

    /**
     * Classifies ML prediction vs actual outcome.
     */
    public String classifyOutcome(Integer mlPrediction, Boolean actualIncident) {
        if (mlPrediction == null || actualIncident == null) {
            return "UNKNOWN";
        }
        boolean predFailure = (mlPrediction == 1);
        boolean hadIncident = Boolean.TRUE.equals(actualIncident);

        if (predFailure && hadIncident) {
            return "TRUE_POSITIVE";
        } else if (!predFailure && !hadIncident) {
            return "TRUE_NEGATIVE";
        } else if (predFailure && !hadIncident) {
            return "FALSE_POSITIVE";
        } else {
            return "FALSE_NEGATIVE";
        }
    }

    private RiskHistoryResponseDto mapToDto(RiskAnalysisHistory h) {
        RiskHistoryResponseDto dto = new RiskHistoryResponseDto();
        dto.setId(h.getId());
        dto.setChangeId(h.getChange() != null ? h.getChange().getId() : null);
        dto.setServiceId(h.getService().getId());
        dto.setServiceName(h.getService().getName());
        dto.setServiceCriticality(h.getService().getCriticality() != null ? h.getService().getCriticality().name() : "MEDIUM");
        dto.setRiskScore(h.getRiskScore());
        dto.setRiskPercentage((int) Math.round(h.getRiskScore() * 100));
        dto.setRiskLevel(h.getRiskLevel());
        dto.setBlastRadiusScore(h.getBlastRadiusScore());
        dto.setAffectedServicesCount(h.getAffectedServicesCount());
        dto.setCriticalServicesAffected(h.getCriticalServicesAffected());
        dto.setDependencyDepth(h.getDependencyDepth());
        dto.setMlFailureProbability(h.getMlFailureProbability());
        dto.setMlPrediction(h.getMlPrediction());
        dto.setMlModelVersion(h.getMlModelVersion());
        dto.setAnalysisTimestamp(h.getAnalysisTimestamp());
        dto.setActualIncident(h.getActualIncident());
        dto.setActualIncidentSeverity(h.getActualIncidentSeverity());
        dto.setOutcomeClassification(classifyOutcome(h.getMlPrediction(), h.getActualIncident()));
        dto.setOutcomeUpdatedAt(h.getOutcomeUpdatedAt());
        return dto;
    }

    private static double round(double val) {
        return Math.round(val * 10000.0) / 10000.0;
    }
}
