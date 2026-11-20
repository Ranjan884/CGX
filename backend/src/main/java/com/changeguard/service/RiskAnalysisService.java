package com.changeguard.service;

import com.changeguard.config.RiskConfiguration;
import com.changeguard.dto.BlastRadiusResultDto;
import com.changeguard.dto.RiskAnalysisRequest;
import com.changeguard.dto.RiskAnalysisResult;
import com.changeguard.dto.RiskFactorDetailDto;
import com.changeguard.dto.ml.MLPredictionRequest;
import com.changeguard.dto.ml.MLStatus;
import com.changeguard.exception.ResourceNotFoundException;
import com.changeguard.exception.ValidationException;
import com.changeguard.model.Change;
import com.changeguard.model.Incident;
import com.changeguard.model.RiskAnalysisHistory;
import com.changeguard.model.ServiceEntity;
import com.changeguard.model.enums.ChangeType;
import com.changeguard.model.enums.Criticality;
import com.changeguard.repository.ChangeRepository;
import com.changeguard.repository.IncidentRepository;
import com.changeguard.repository.RiskAnalysisHistoryRepository;
import com.changeguard.repository.ServiceRepository;
import com.changeguard.service.ml.MLFeatureBuilder;
import com.changeguard.service.ml.MLServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Phase 5, 7 & 12: Combined Rule-Based Risk Engine, ML Service Integration, and Risk History.
 * 
 * Computes deterministic, explainable, and configurable pre-deployment change risk,
 * connects with external Python FastAPI Random Forest inference service,
 * and maintains continuous historical change evaluations for outcome monitoring.
 */
@Service
@Transactional
public class RiskAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(RiskAnalysisService.class);

    private final ServiceRepository serviceRepository;
    private final ChangeRepository changeRepository;
    private final IncidentRepository incidentRepository;
    private final BlastRadiusService blastRadiusService;
    private final RiskConfiguration riskConfig;
    private final MLFeatureBuilder mlFeatureBuilder;
    private final MLServiceClient mlServiceClient;
    private final RiskAnalysisHistoryRepository historyRepository;

    private static final Map<ChangeType, Double> DEFAULT_CHANGE_TYPE_WEIGHTS = new EnumMap<>(ChangeType.class);

    static {
        DEFAULT_CHANGE_TYPE_WEIGHTS.put(ChangeType.CONFIG_CHANGE, 0.40);
        DEFAULT_CHANGE_TYPE_WEIGHTS.put(ChangeType.VERSION_UPDATE, 0.50);
        DEFAULT_CHANGE_TYPE_WEIGHTS.put(ChangeType.LIBRARY_UPDATE, 0.50);
        DEFAULT_CHANGE_TYPE_WEIGHTS.put(ChangeType.API_CHANGE, 0.60);
        DEFAULT_CHANGE_TYPE_WEIGHTS.put(ChangeType.SECURITY_CHANGE, 0.65);
        DEFAULT_CHANGE_TYPE_WEIGHTS.put(ChangeType.ML_MODEL_CHANGE, 0.65);
        DEFAULT_CHANGE_TYPE_WEIGHTS.put(ChangeType.DEPENDENCY_CHANGE, 0.70);
        DEFAULT_CHANGE_TYPE_WEIGHTS.put(ChangeType.INFRASTRUCTURE_CHANGE, 0.75);
        DEFAULT_CHANGE_TYPE_WEIGHTS.put(ChangeType.DATABASE_CHANGE, 0.80);
    }

    public RiskAnalysisService(ServiceRepository serviceRepository,
                               ChangeRepository changeRepository,
                               IncidentRepository incidentRepository,
                               BlastRadiusService blastRadiusService,
                               RiskConfiguration riskConfig,
                               MLFeatureBuilder mlFeatureBuilder,
                               MLServiceClient mlServiceClient,
                               RiskAnalysisHistoryRepository historyRepository) {
        this.serviceRepository = serviceRepository;
        this.changeRepository = changeRepository;
        this.incidentRepository = incidentRepository;
        this.blastRadiusService = blastRadiusService;
        this.riskConfig = riskConfig;
        this.mlFeatureBuilder = mlFeatureBuilder;
        this.mlServiceClient = mlServiceClient;
        this.historyRepository = historyRepository;
    }

    /**
     * Evaluates the risk of a proposed technical change.
     */
    public RiskAnalysisResult analyzeRisk(RiskAnalysisRequest request) {
        if (request == null) {
            throw new ValidationException("Risk analysis request body is required");
        }
        if (request.getServiceId() == null) {
            throw new ValidationException("serviceId is required");
        }

        // 1. Identify changed service
        ServiceEntity service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + request.getServiceId()));

        // 2. Validate and parse Change Type
        ChangeType changeType = parseChangeType(request.getChangeType());

        // 3. Validate and normalize Complexity (0.0 to 1.0)
        double normalizedComplexity = parseComplexity(request.getComplexity());

        // 4. Run Phase 4 Blast-Radius Engine
        BlastRadiusResultDto blast = blastRadiusService.analyzeBlastRadius(service.getId());

        // 5. Calculate Individual Risk Factors & Details
        Map<String, RiskFactorDetailDto> factorMap = new LinkedHashMap<>();
        RiskConfiguration.Weights weights = riskConfig.getWeights();

        // Factor 1: Complexity
        double complexityContrib = normalizedComplexity * weights.getComplexity();
        factorMap.put("complexity", new RiskFactorDetailDto(
                "Change Complexity",
                request.getComplexity(),
                round(normalizedComplexity),
                weights.getComplexity(),
                round(complexityContrib),
                describeComplexity(normalizedComplexity)
        ));

        // Factor 2: Dependency Count
        int maxDeps = Math.max(1, riskConfig.getDefaults().getMaxRelevantDependencies());
        double normalizedDeps = Math.min(1.0, (double) blast.getTotalAffectedServices() / (double) maxDeps);
        double depsContrib = normalizedDeps * weights.getDependency();
        factorMap.put("dependencyCount", new RiskFactorDetailDto(
                "Dependency Count",
                blast.getTotalAffectedServices(),
                round(normalizedDeps),
                weights.getDependency(),
                round(depsContrib),
                String.format("%d downstream service(s) affected (normalized against baseline of %d)", blast.getTotalAffectedServices(), maxDeps)
        ));

        // Factor 3: Dependency Depth
        int maxDepthConfig = Math.max(1, riskConfig.getDefaults().getMaxDepth());
        double normalizedDepth = Math.min(1.0, (double) blast.getMaxDependencyDepth() / (double) maxDepthConfig);
        double depthContrib = normalizedDepth * weights.getDepth();
        factorMap.put("dependencyDepth", new RiskFactorDetailDto(
                "Dependency Depth",
                blast.getMaxDependencyDepth(),
                round(normalizedDepth),
                weights.getDepth(),
                round(depthContrib),
                String.format("Impact propagates %d dependency layer(s) deep (capped at %d)", blast.getMaxDependencyDepth(), maxDepthConfig)
        ));

        // Factor 4: Service Criticality
        double normalizedCriticality = mapCriticalityToFactor(service.getCriticality());
        double critContrib = normalizedCriticality * weights.getCriticality();
        factorMap.put("serviceCriticality", new RiskFactorDetailDto(
                "Service Criticality",
                service.getCriticality().name(),
                round(normalizedCriticality),
                weights.getCriticality(),
                round(critContrib),
                String.format("Target service %s is tier-%s infrastructure", service.getName(), service.getCriticality().name())
        ));

        // Factor 5: Historical Incident Rate
        HistoricalDataResult history = calculateHistoricalIncidentRate(service);
        double incidentContrib = history.failureRate * weights.getIncident();
        factorMap.put("historicalIncidents", new RiskFactorDetailDto(
                "Historical Failure Rate",
                history.hasSufficientData ? String.format("%d/%d failures", history.failedChanges, history.totalChanges) : "INSUFFICIENT_DATA",
                round(history.failureRate),
                weights.getIncident(),
                round(incidentContrib),
                history.description
        ));

        // Factor 6: Change Type
        double normalizedChangeType = DEFAULT_CHANGE_TYPE_WEIGHTS.getOrDefault(changeType, 0.50);
        double changeTypeContrib = normalizedChangeType * weights.getChangeType();
        factorMap.put("changeType", new RiskFactorDetailDto(
                "Change Type Impact",
                changeType.name(),
                round(normalizedChangeType),
                weights.getChangeType(),
                round(changeTypeContrib),
                String.format("%s carries technical modification weight of %.2f", changeType.name(), normalizedChangeType)
        ));

        // Factor 7: Critical Services Affected
        double normalizedCritAffected = Math.min(1.0, blast.getCriticalServicesAffectedCount() * 0.50);
        double critAffectedContrib = normalizedCritAffected * weights.getCriticalService();
        factorMap.put("criticalServicesAffected", new RiskFactorDetailDto(
                "Critical Services Affected",
                blast.getCriticalServicesAffectedCount(),
                round(normalizedCritAffected),
                weights.getCriticalService(),
                round(critAffectedContrib),
                String.format("%d Tier-1 critical service(s) impacted in blast radius", blast.getCriticalServicesAffectedCount())
        ));

        // Factor 8: Blast-Radius Score
        double normalizedBlastScore = Math.min(1.0, Math.max(0.0, blast.getBlastRadiusScore() / 100.0));
        double blastScoreContrib = normalizedBlastScore * weights.getBlastRadius();
        factorMap.put("blastRadiusScore", new RiskFactorDetailDto(
                "Blast-Radius Score",
                blast.getBlastRadiusScore(),
                round(normalizedBlastScore),
                weights.getBlastRadius(),
                round(blastScoreContrib),
                String.format("Phase 4 normalized blast-radius rating of %.1f/100", blast.getBlastRadiusScore())
        ));

        // 6. Calculate Final Weighted Risk Score
        double totalScore = complexityContrib + depsContrib + depthContrib + critContrib +
                            incidentContrib + changeTypeContrib + critAffectedContrib + blastScoreContrib;

        double finalRiskScore = Math.min(1.0, Math.max(0.0, totalScore));
        finalRiskScore = round(finalRiskScore);
        int riskPercentage = (int) Math.round(finalRiskScore * 100);

        // 7. Determine Risk Level
        String riskLevel = determineRiskLevel(finalRiskScore);

        // 8. Generate Natural Dynamic Explanation
        String explanation = generateExplanation(service, changeType, finalRiskScore, riskLevel, factorMap, blast, history);

        RiskAnalysisResult result = new RiskAnalysisResult(
                null,
                service.getId(),
                service.getName(),
                finalRiskScore,
                riskPercentage,
                riskLevel,
                blast.getBlastRadiusScore(),
                blast.getTotalAffectedServices(),
                blast.getCriticalServicesAffectedCount(),
                blast.getMaxDependencyDepth(),
                factorMap,
                explanation,
                blast
        );

        // 9. Phase 7: Derive ML feature vector and invoke Python FastAPI service
        try {
            MLPredictionRequest mlRequest = mlFeatureBuilder.buildFeatures(
                    request,
                    service,
                    blast,
                    normalizedComplexity,
                    history.failureRate,
                    history.failedChanges
            );
            MLServiceClient.MLResult mlResult = mlServiceClient.predict(mlRequest);
            result.setMlPrediction(mlResult.getResponse());
            result.setMlStatus(mlResult.getStatus());
        } catch (Exception ex) {
            log.warn("ML prediction invocation failed gracefully: {}", ex.getMessage());
            result.setMlPrediction(null);
            result.setMlStatus(MLStatus.ERROR);
        }

        // 10. Phase 12: Record Risk Analysis in History
        try {
            Double mlProb = result.getMlPrediction() != null ? result.getMlPrediction().getFailureProbability() : null;
            Integer mlPred = result.getMlPrediction() != null ? result.getMlPrediction().getPrediction() : null;
            String mlVer = result.getMlPrediction() != null ? result.getMlPrediction().getModelVersion() : null;

            RiskAnalysisHistory historyEntity = new RiskAnalysisHistory(
                    null, // Will be linked if invoked via analyzeRiskForChange
                    service,
                    result.getRiskScore(),
                    result.getRiskLevel(),
                    result.getBlastRadiusScore(),
                    result.getTotalAffectedServices(),
                    result.getCriticalServicesAffectedCount(),
                    result.getMaxDependencyDepth(),
                    mlProb,
                    mlPred,
                    mlVer
            );
            RiskAnalysisHistory saved = historyRepository.save(historyEntity);
            log.info("Persisted RiskAnalysisHistory with id {}", saved.getId());
        } catch (Exception ex) {
            log.error("Failed to persist RiskAnalysisHistory record: {}", ex.getMessage());
        }

        return result;
    }

    /**
     * Evaluates risk for an existing recorded Change in the database.
     */
    public RiskAnalysisResult analyzeRiskForChange(Long changeId) {
        Change change = changeRepository.findById(changeId)
                .orElseThrow(() -> new ResourceNotFoundException("Change record not found with id: " + changeId));

        RiskAnalysisRequest request = new RiskAnalysisRequest(
                change.getService().getId(),
                change.getChangeType().name(),
                change.getOldVersion(),
                change.getNewVersion(),
                change.getComplexity(),
                change.getDescription()
        );

        RiskAnalysisResult result = analyzeRisk(request);
        result.setChangeId(change.getId());

        // Update change reference on the most recent history record if appropriate
        try {
            List<RiskAnalysisHistory> recent = historyRepository.findByServiceIdOrderByAnalysisTimestampDesc(change.getService().getId());
            if (!recent.isEmpty() && recent.get(0).getChange() == null) {
                recent.get(0).setChange(change);
                historyRepository.save(recent.get(0));
            }
        } catch (Exception ex) {
            log.warn("Failed to link Change record to RiskAnalysisHistory: {}", ex.getMessage());
        }

        return result;
    }

    /**
     * Categorizes a numeric risk score into a qualitative risk tier based on configurable thresholds.
     */
    public String determineRiskLevel(double score) {
        RiskConfiguration.Thresholds t = riskConfig.getThresholds();
        if (score < t.getLow()) {
            return "LOW";
        } else if (score < t.getMedium()) {
            return "MEDIUM";
        } else if (score < t.getHigh()) {
            return "HIGH";
        } else {
            return "CRITICAL";
        }
    }

    // --- Helper Calculations & Parsing ---

    private ChangeType parseChangeType(String input) {
        if (input == null || input.trim().isEmpty()) {
            throw new ValidationException("changeType is required");
        }
        try {
            return ChangeType.valueOf(input.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ValidationException(String.format("Unknown change type '%s'. Valid types are: %s",
                    input, Arrays.toString(ChangeType.values())));
        }
    }

    private double parseComplexity(Object complexity) {
        if (complexity == null) {
            throw new ValidationException("complexity is required");
        }
        if (complexity instanceof Number) {
            double val = ((Number) complexity).doubleValue();
            if (val < 0) {
                throw new ValidationException("Complexity cannot be negative");
            }
            if (val <= 1.0) {
                return val; // Already normalized
            } else if (val <= 10.0) {
                return val / 10.0; // 1 to 10 scale
            } else {
                throw new ValidationException("Numeric complexity must be between 1 and 10 (or 0.0 and 1.0)");
            }
        }

        String str = complexity.toString().trim().toUpperCase();
        switch (str) {
            case "LOW":
                return 0.25;
            case "MEDIUM":
            case "MED":
                return 0.50;
            case "HIGH":
                return 0.75;
            case "VERY_HIGH":
            case "CRITICAL":
                return 1.00;
            default:
                try {
                    double num = Double.parseDouble(str);
                    return parseComplexity(num);
                } catch (NumberFormatException ex) {
                    throw new ValidationException(String.format("Invalid complexity '%s'. Expected LOW, MEDIUM, HIGH, VERY_HIGH, or numeric 1-10", str));
                }
        }
    }

    private double mapCriticalityToFactor(Criticality criticality) {
        if (criticality == null) return 0.50;
        switch (criticality) {
            case CRITICAL:
                return 1.00;
            case HIGH:
                return 0.75;
            case MEDIUM:
                return 0.50;
            case LOW:
            default:
                return 0.25;
        }
    }

    private String describeComplexity(double normalized) {
        if (normalized >= 0.90) return "Very High / Maximum technical complexity rating";
        if (normalized >= 0.70) return "High technical complexity rating";
        if (normalized >= 0.40) return "Moderate complexity rating";
        return "Low complexity routine change";
    }

    private static class HistoricalDataResult {
        boolean hasSufficientData;
        int totalChanges;
        int failedChanges;
        double failureRate;
        String description;
    }

    private HistoricalDataResult calculateHistoricalIncidentRate(ServiceEntity service) {
        HistoricalDataResult result = new HistoricalDataResult();
        List<Change> changes = changeRepository.findByService(service);

        if (changes == null || changes.isEmpty()) {
            result.hasSufficientData = false;
            result.totalChanges = 0;
            result.failedChanges = 0;
            result.failureRate = riskConfig.getDefaults().getHistoricalFailureRate();
            result.description = String.format("Insufficient historical change records for %s; applying default baseline failure rate (%.2f)",
                    service.getName(), result.failureRate);
            return result;
        }

        int failedCount = 0;
        for (Change c : changes) {
            List<Incident> incidents = incidentRepository.findByChange(c);
            if (incidents != null && incidents.stream().anyMatch(i -> Boolean.TRUE.equals(i.getFailure()))) {
                failedCount++;
            }
        }

        result.hasSufficientData = true;
        result.totalChanges = changes.size();
        result.failedChanges = failedCount;
        result.failureRate = (double) failedCount / (double) changes.size();
        result.description = String.format("%d failure(s) observed out of %d historical change(s) (%.0f%% failure rate)",
                failedCount, changes.size(), result.failureRate * 100);
        return result;
    }

    private String generateExplanation(ServiceEntity service, ChangeType changeType, double riskScore,
                                       String riskLevel, Map<String, RiskFactorDetailDto> factors,
                                       BlastRadiusResultDto blast, HistoricalDataResult history) {
        List<String> keyReasons = new ArrayList<>();

        if (service.getCriticality() == Criticality.CRITICAL) {
            keyReasons.add(String.format("%s is classified as tier-1 CRITICAL banking infrastructure", service.getName()));
        } else if (service.getCriticality() == Criticality.HIGH) {
            keyReasons.add(String.format("%s is classified as HIGH criticality banking service", service.getName()));
        }

        if (blast.getTotalAffectedServices() >= 4) {
            keyReasons.add(String.format("the change impacts %d downstream services", blast.getTotalAffectedServices()));
        }

        if (blast.getCriticalServicesAffectedCount() > 0) {
            keyReasons.add(String.format("%d Tier-1 critical system(s) (%s) lie within the direct blast radius",
                    blast.getCriticalServicesAffectedCount(), String.join(", ", blast.getCriticalAffectedServices())));
        }

        if (blast.getMaxDependencyDepth() >= 3) {
            keyReasons.add(String.format("downstream propagation travels deeply across %d dependency tiers", blast.getMaxDependencyDepth()));
        }

        if (factors.get("complexity").getNormalizedValue() >= 0.70) {
            keyReasons.add("elevated change complexity rating");
        }

        if (changeType == ChangeType.DATABASE_CHANGE || changeType == ChangeType.INFRASTRUCTURE_CHANGE || changeType == ChangeType.API_CHANGE) {
            keyReasons.add(String.format("%s carries contract incompatibility and schema lock risks", changeType.name()));
        }

        if (history.hasSufficientData && history.failureRate >= 0.30) {
            keyReasons.add(String.format("historical failure rate on this service is elevated (%.0f%%)", history.failureRate * 100));
        }

        if (keyReasons.isEmpty()) {
            return String.format("The proposed %s on %s is evaluated as %s risk (score: %.2f) because dependencies are localized, complexity is manageable, and no critical downstream systems are exposed.",
                    changeType.name(), service.getName(), riskLevel, riskScore);
        }

        return String.format("The proposed %s on %s is evaluated as %s risk (score: %.2f / %d%%) because %s.",
                changeType.name(), service.getName(), riskLevel, riskScore, (int) Math.round(riskScore * 100),
                String.join(", ", keyReasons));
    }

    private double round(double val) {
        return Math.round(val * 10000.0) / 10000.0;
    }
}
