package com.changeguard.service;

import com.changeguard.dto.history.*;
import com.changeguard.exception.ResourceNotFoundException;
import com.changeguard.exception.ValidationException;
import com.changeguard.model.RiskAnalysisHistory;
import com.changeguard.model.ServiceEntity;
import com.changeguard.model.enums.Criticality;
import com.changeguard.model.enums.ServiceStatus;
import com.changeguard.model.enums.Severity;
import com.changeguard.repository.RiskAnalysisHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RiskAnalysisHistoryServiceTest {

    @Mock
    private RiskAnalysisHistoryRepository historyRepository;

    @InjectMocks
    private RiskAnalysisHistoryService historyService;

    private ServiceEntity paymentService;
    private RiskAnalysisHistory sampleHistory;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(historyService, "minLabeledSamples", 5L);
        ReflectionTestUtils.setField(historyService, "mlPredictionThreshold", 0.50);

        paymentService = new ServiceEntity(5L, "Payment Service", "PAYMENT", Criticality.CRITICAL, "2.0.0", ServiceStatus.ACTIVE);

        sampleHistory = new RiskAnalysisHistory(
                null,
                paymentService,
                0.78,
                "HIGH",
                64.0,
                6,
                2,
                3,
                0.72,
                1,
                "1.0.0"
        );
        sampleHistory.setId(101L);
    }

    @Test
    @DisplayName("Test 1: Retrieve All History")
    void testGetAllHistory() {
        when(historyRepository.findAllByOrderByAnalysisTimestampDesc()).thenReturn(List.of(sampleHistory));

        List<RiskHistoryResponseDto> list = historyService.getAllHistory();

        assertEquals(1, list.size());
        assertEquals(101L, list.get(0).getId());
        assertEquals("Payment Service", list.get(0).getServiceName());
        assertEquals("HIGH", list.get(0).getRiskLevel());
        assertEquals("UNKNOWN", list.get(0).getOutcomeClassification());
    }

    @Test
    @DisplayName("Test 2: Retrieve History by ID")
    void testGetHistoryById() {
        when(historyRepository.findById(101L)).thenReturn(Optional.of(sampleHistory));

        RiskHistoryResponseDto dto = historyService.getHistoryById(101L);

        assertNotNull(dto);
        assertEquals(101L, dto.getId());
        assertEquals(0.78, dto.getRiskScore());
        assertEquals(1, dto.getMlPrediction());
    }

    @Test
    @DisplayName("Test 3: Retrieve History by Non-existent ID throws 404")
    void testGetHistoryNotFound() {
        when(historyRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> historyService.getHistoryById(999L));
    }

    @Test
    @DisplayName("Test 4: Record Incident Outcome (True Positive)")
    void testRecordIncidentOutcomeTruePositive() {
        when(historyRepository.findById(101L)).thenReturn(Optional.of(sampleHistory));
        when(historyRepository.save(any(RiskAnalysisHistory.class))).thenAnswer(inv -> inv.getArgument(0));

        OutcomeRecordRequest req = new OutcomeRecordRequest(true, Severity.HIGH);
        RiskHistoryResponseDto updated = historyService.recordOutcome(101L, req);

        assertTrue(updated.getActualIncident());
        assertEquals(Severity.HIGH, updated.getActualIncidentSeverity());
        assertEquals("TRUE_POSITIVE", updated.getOutcomeClassification());
        assertNotNull(updated.getOutcomeUpdatedAt());
    }

    @Test
    @DisplayName("Test 5: Record No-Incident Outcome (False Positive)")
    void testRecordNoIncidentOutcomeFalsePositive() {
        when(historyRepository.findById(101L)).thenReturn(Optional.of(sampleHistory));
        when(historyRepository.save(any(RiskAnalysisHistory.class))).thenAnswer(inv -> inv.getArgument(0));

        OutcomeRecordRequest req = new OutcomeRecordRequest(false, null);
        RiskHistoryResponseDto updated = historyService.recordOutcome(101L, req);

        assertFalse(updated.getActualIncident());
        assertNull(updated.getActualIncidentSeverity());
        assertEquals("FALSE_POSITIVE", updated.getOutcomeClassification());
    }

    @Test
    @DisplayName("Test 6: True Negative and False Negative Classification Logic")
    void testOutcomeClassificationLogic() {
        // True Negative: ML predicted 0, actual is false
        assertEquals("TRUE_NEGATIVE", historyService.classifyOutcome(0, false));

        // False Negative: ML predicted 0, actual is true
        assertEquals("FALSE_NEGATIVE", historyService.classifyOutcome(0, true));

        // Unknown: ML or actual is null
        assertEquals("UNKNOWN", historyService.classifyOutcome(null, true));
        assertEquals("UNKNOWN", historyService.classifyOutcome(1, null));
    }

    @Test
    @DisplayName("Test 7: Record Outcome with Missing actualIncident Throws ValidationException")
    void testRecordOutcomeInvalidRequest() {
        assertThrows(ValidationException.class, () -> historyService.recordOutcome(101L, new OutcomeRecordRequest(null, null)));
    }

    @Test
    @DisplayName("Test 8: Historical ML Performance with Insufficient Data")
    void testMLPerformanceInsufficientData() {
        when(historyRepository.findLabeledMLOutcomes()).thenReturn(List.of(sampleHistory)); // 1 sample < min (5)

        HistoricalMLPerformanceDto metrics = historyService.getMLPerformanceMetrics();

        assertEquals("NOT_ENOUGH_DATA", metrics.getStatus());
        assertEquals(1L, metrics.getLabeledSamples());
        assertEquals(5L, metrics.getMinRequiredSamples());
        assertNull(metrics.getAccuracy());
    }

    @Test
    @DisplayName("Test 9: Historical ML Performance with Sufficient Labeled Data")
    void testMLPerformanceSufficientData() {
        List<RiskAnalysisHistory> samples = new ArrayList<>();
        // 4 True Positives (pred 1, actual true)
        for (int i = 0; i < 4; i++) {
            RiskAnalysisHistory h = new RiskAnalysisHistory(null, paymentService, 0.8, "HIGH", 50.0, 5, 2, 2, 0.8, 1, "1.0.0");
            h.setActualIncident(true);
            samples.add(h);
        }
        // 4 True Negatives (pred 0, actual false)
        for (int i = 0; i < 4; i++) {
            RiskAnalysisHistory h = new RiskAnalysisHistory(null, paymentService, 0.2, "LOW", 10.0, 1, 0, 1, 0.1, 0, "1.0.0");
            h.setActualIncident(false);
            samples.add(h);
        }
        // 1 False Positive (pred 1, actual false)
        RiskAnalysisHistory fp = new RiskAnalysisHistory(null, paymentService, 0.7, "HIGH", 40.0, 3, 1, 2, 0.7, 1, "1.0.0");
        fp.setActualIncident(false);
        samples.add(fp);

        // 1 False Negative (pred 0, actual true)
        RiskAnalysisHistory fn = new RiskAnalysisHistory(null, paymentService, 0.3, "LOW", 20.0, 2, 0, 1, 0.2, 0, "1.0.0");
        fn.setActualIncident(true);
        samples.add(fn);

        when(historyRepository.findLabeledMLOutcomes()).thenReturn(samples); // Total 10 >= min (5)

        HistoricalMLPerformanceDto metrics = historyService.getMLPerformanceMetrics();

        assertEquals("OK", metrics.getStatus());
        assertEquals(10L, metrics.getLabeledSamples());
        assertEquals(4L, metrics.getTruePositives());
        assertEquals(4L, metrics.getTrueNegatives());
        assertEquals(1L, metrics.getFalsePositives());
        assertEquals(1L, metrics.getFalseNegatives());
        assertEquals(0.80, metrics.getAccuracy()); // 8/10
        assertEquals(0.80, metrics.getPrecision()); // 4/5
        assertEquals(0.80, metrics.getRecall()); // 4/5
        assertEquals(0.80, metrics.getF1());
    }

    @Test
    @DisplayName("Test 10: High-Risk Service Aggregates")
    void testGetHighRiskServices() {
        Object[] row = new Object[] { 5L, "Payment Service", "CRITICAL", 10L, 7L, 3L, 0.76 };
        when(historyRepository.findHighRiskServiceAggregates()).thenReturn(List.<Object[]>of(row));

        List<HighRiskServiceStatDto> stats = historyService.getHighRiskServices();

        assertEquals(1, stats.size());
        HighRiskServiceStatDto stat = stats.get(0);
        assertEquals(5L, stat.getServiceId());
        assertEquals("Payment Service", stat.getServiceName());
        assertEquals(10L, stat.getAnalyzedChanges());
        assertEquals(7L, stat.getHighRiskChanges());
        assertEquals(3L, stat.getActualIncidents());
        assertEquals(0.76, stat.getAverageRiskScore());
        assertEquals(0.3, stat.getIncidentRate()); // 3/10
    }

    @Test
    @DisplayName("Test 11: Risk Trends Calculation")
    void testGetRiskTrends() {
        when(historyRepository.findAllByOrderByAnalysisTimestampDesc()).thenReturn(List.of(sampleHistory));

        RiskTrendsResponseDto trends = historyService.getRiskTrends();

        assertEquals(1L, trends.getTotalHistoricalRecords());
        assertFalse(trends.getPoints().isEmpty());
        assertEquals(0.78, trends.getPoints().get(0).getAverageRiskScore());
    }
}
