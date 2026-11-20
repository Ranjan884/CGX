package com.changeguard.service;

import com.changeguard.config.RiskConfiguration;
import com.changeguard.dto.BlastRadiusResultDto;
import com.changeguard.dto.RiskAnalysisRequest;
import com.changeguard.dto.RiskAnalysisResult;
import com.changeguard.dto.ServiceRefDto;
import com.changeguard.dto.ml.MLPredictionResponse;
import com.changeguard.dto.ml.MLStatus;
import com.changeguard.exception.ResourceNotFoundException;
import com.changeguard.exception.ValidationException;
import com.changeguard.model.Change;
import com.changeguard.model.Incident;
import com.changeguard.model.ServiceEntity;
import com.changeguard.model.enums.ChangeType;
import com.changeguard.model.enums.Criticality;
import com.changeguard.model.enums.ServiceStatus;
import com.changeguard.model.enums.Severity;
import com.changeguard.repository.ChangeRepository;
import com.changeguard.repository.IncidentRepository;
import com.changeguard.repository.ServiceRepository;
import com.changeguard.service.ml.MLFeatureBuilder;
import com.changeguard.service.ml.MLServiceClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RiskAnalysisServiceTest {

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private ChangeRepository changeRepository;

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private BlastRadiusService blastRadiusService;

    @Spy
    private RiskConfiguration riskConfig = new RiskConfiguration();

    @Spy
    private MLFeatureBuilder mlFeatureBuilder = new MLFeatureBuilder();

    @Mock
    private MLServiceClient mlServiceClient;

    @Mock
    private com.changeguard.repository.RiskAnalysisHistoryRepository historyRepository;

    @InjectMocks
    private RiskAnalysisService riskAnalysisService;

    private ServiceEntity lowService;
    private ServiceEntity mediumService;
    private ServiceEntity highService;
    private ServiceEntity criticalService;

    @BeforeEach
    void setUp() {
        lowService = new ServiceEntity(1L, "Reporting Service", "ANALYTICS", Criticality.LOW, "1.0", ServiceStatus.ACTIVE);
        mediumService = new ServiceEntity(2L, "Notification Service", "MESSAGING", Criticality.MEDIUM, "1.0", ServiceStatus.ACTIVE);
        highService = new ServiceEntity(3L, "Account Service", "CORE", Criticality.HIGH, "1.0", ServiceStatus.ACTIVE);
        criticalService = new ServiceEntity(4L, "Payment Service", "PAYMENT", Criticality.CRITICAL, "1.0", ServiceStatus.ACTIVE);
    }

    @Test
    @DisplayName("Test 1: Low Risk Scenario - Low complexity, low criticality, small blast radius")
    void testLowRiskScenario() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(lowService));
        when(changeRepository.findByService(lowService)).thenReturn(Collections.emptyList());

        BlastRadiusResultDto blast = new BlastRadiusResultDto(
                new ServiceRefDto(1L, "Reporting Service", "ANALYTICS", Criticality.LOW, "1.0"),
                Collections.emptyList(), Collections.emptyList(), Collections.emptyList(),
                Collections.emptyList(), 0, 0, 0,
                Collections.emptyMap(), Collections.emptyList(), 0.0
        );
        when(blastRadiusService.analyzeBlastRadius(1L)).thenReturn(blast);

        RiskAnalysisRequest request = new RiskAnalysisRequest(1L, "CONFIG_CHANGE", "1.0", "1.1", "LOW", "Minor config update");
        RiskAnalysisResult result = riskAnalysisService.analyzeRisk(request);

        assertEquals("LOW", result.getRiskLevel());
        assertTrue(result.getRiskScore() < 0.30);
        assertTrue(result.getFactors().containsKey("complexity"));
        assertEquals(0.25, result.getFactors().get("complexity").getNormalizedValue());
    }

    @Test
    @DisplayName("Test 2: Medium Risk Scenario - Moderate complexity, moderate dependencies")
    void testMediumRiskScenario() {
        when(serviceRepository.findById(2L)).thenReturn(Optional.of(mediumService));
        when(changeRepository.findByService(mediumService)).thenReturn(Collections.emptyList());

        BlastRadiusResultDto blast = new BlastRadiusResultDto(
                new ServiceRefDto(2L, "Notification Service", "MESSAGING", Criticality.MEDIUM, "1.0"),
                List.of("Reporting Service"), Collections.emptyList(), List.of("Reporting Service"),
                Collections.emptyList(), 0, 1, 1,
                Map.of("Reporting Service", 1), List.of(List.of("Notification", "Reporting")), 25.0
        );
        when(blastRadiusService.analyzeBlastRadius(2L)).thenReturn(blast);

        RiskAnalysisRequest request = new RiskAnalysisRequest(2L, "VERSION_UPDATE", "1.0", "1.1", "MEDIUM", "Routine version update");
        RiskAnalysisResult result = riskAnalysisService.analyzeRisk(request);

        assertEquals("MEDIUM", result.getRiskLevel());
        assertTrue(result.getRiskScore() >= 0.30 && result.getRiskScore() < 0.60);
    }

    @Test
    @DisplayName("Test 3: High Risk Scenario - High complexity, high criticality, multiple dependencies")
    void testHighRiskScenario() {
        when(serviceRepository.findById(3L)).thenReturn(Optional.of(highService));
        when(changeRepository.findByService(highService)).thenReturn(Collections.emptyList());

        BlastRadiusResultDto blast = new BlastRadiusResultDto(
                new ServiceRefDto(3L, "Account Service", "CORE", Criticality.HIGH, "1.0"),
                List.of("Core Banking"), List.of("Transaction DB", "Reconciliation"),
                List.of("Core Banking", "Transaction DB", "Reconciliation"),
                List.of("Core Banking"), 1, 3, 2,
                Map.of("Core Banking", 1, "Transaction DB", 2, "Reconciliation", 2),
                List.of(List.of("Account", "Core Banking", "Transaction DB")), 60.0
        );
        when(blastRadiusService.analyzeBlastRadius(3L)).thenReturn(blast);

        RiskAnalysisRequest request = new RiskAnalysisRequest(3L, "API_CHANGE", "1.0", "2.0", "HIGH", "API contract change");
        RiskAnalysisResult result = riskAnalysisService.analyzeRisk(request);

        assertEquals("HIGH", result.getRiskLevel());
        assertTrue(result.getRiskScore() >= 0.60 && result.getRiskScore() < 0.80);
        assertTrue(result.getExplanation().contains("HIGH"));
    }

    @Test
    @DisplayName("Test 4: Critical Risk Scenario - Very high complexity, critical service, multiple critical downstream")
    void testCriticalRiskScenario() {
        when(serviceRepository.findById(4L)).thenReturn(Optional.of(criticalService));

        // Create 2 historical changes, both failed
        Change chg1 = new Change(10L, criticalService, ChangeType.DATABASE_CHANGE, "Old schema change", "1.0", "2.0", 9);
        Incident inc1 = new Incident(1L, chg1, Severity.CRITICAL, true, "Core Banking", "Lock timeout");
        when(changeRepository.findByService(criticalService)).thenReturn(List.of(chg1));
        when(incidentRepository.findByChange(chg1)).thenReturn(List.of(inc1));

        BlastRadiusResultDto blast = new BlastRadiusResultDto(
                new ServiceRefDto(4L, "Payment Service", "PAYMENT", Criticality.CRITICAL, "2.0"),
                List.of("Fraud Detection", "Core Banking"),
                List.of("Transaction DB", "Reconciliation", "Reporting"),
                List.of("Fraud Detection", "Core Banking", "Transaction DB", "Reconciliation", "Reporting"),
                List.of("Core Banking", "Transaction DB"), 2, 5, 3,
                Map.of("Fraud Detection", 1, "Core Banking", 1, "Transaction DB", 2),
                List.of(List.of("Payment", "Core Banking", "Transaction DB")), 88.0
        );
        when(blastRadiusService.analyzeBlastRadius(4L)).thenReturn(blast);

        RiskAnalysisRequest request = new RiskAnalysisRequest(4L, "DATABASE_CHANGE", "2.0", "3.0", "VERY_HIGH", "Critical schema migration");
        RiskAnalysisResult result = riskAnalysisService.analyzeRisk(request);

        assertEquals("CRITICAL", result.getRiskLevel());
        assertTrue(result.getRiskScore() >= 0.80);
        assertTrue(result.getFactors().get("criticalServicesAffected").getNormalizedValue() >= 1.0);
    }

    @Test
    @DisplayName("Test 5: Historical Incident Rate Calculation (2 failures / 10 changes = 0.20)")
    void testHistoricalIncidentRate() {
        when(serviceRepository.findById(4L)).thenReturn(Optional.of(criticalService));

        List<Change> changes = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            Change c = new Change((long) i, criticalService, ChangeType.API_CHANGE, "Desc " + i, "1.0", "1.1", 5);
            changes.add(c);
            if (i <= 2) {
                // First 2 failed
                Incident inc = new Incident((long) i, c, Severity.HIGH, true, "Core", "Failure");
                when(incidentRepository.findByChange(c)).thenReturn(List.of(inc));
            } else {
                when(incidentRepository.findByChange(c)).thenReturn(Collections.emptyList());
            }
        }
        when(changeRepository.findByService(criticalService)).thenReturn(changes);

        BlastRadiusResultDto blast = new BlastRadiusResultDto(
                new ServiceRefDto(4L, "Payment Service", "PAYMENT", Criticality.CRITICAL, "1.0"),
                Collections.emptyList(), Collections.emptyList(), Collections.emptyList(),
                Collections.emptyList(), 0, 0, 0,
                Collections.emptyMap(), Collections.emptyList(), 10.0
        );
        when(blastRadiusService.analyzeBlastRadius(4L)).thenReturn(blast);

        RiskAnalysisRequest request = new RiskAnalysisRequest(4L, "API_CHANGE", "1.0", "2.0", 5, "Test");
        RiskAnalysisResult result = riskAnalysisService.analyzeRisk(request);

        assertEquals(0.20, result.getFactors().get("historicalIncidents").getNormalizedValue(), 0.001);
    }

    @Test
    @DisplayName("Test 6: Score Range bounds - Score must strictly remain between 0.0 and 1.0")
    void testScoreRange() {
        when(serviceRepository.findById(anyLong())).thenReturn(Optional.of(criticalService));
        when(changeRepository.findByService(any())).thenReturn(Collections.emptyList());

        BlastRadiusResultDto blastMax = new BlastRadiusResultDto(
                new ServiceRefDto(4L, "Payment Service", "PAYMENT", Criticality.CRITICAL, "1.0"),
                List.of("A", "B", "C"), List.of("D", "E"), List.of("A", "B", "C", "D", "E"),
                List.of("A", "B"), 2, 5, 4,
                Collections.emptyMap(), Collections.emptyList(), 100.0
        );
        when(blastRadiusService.analyzeBlastRadius(anyLong())).thenReturn(blastMax);

        RiskAnalysisRequest maxReq = new RiskAnalysisRequest(4L, "DATABASE_CHANGE", "1.0", "2.0", 10, "Max test");
        RiskAnalysisResult maxResult = riskAnalysisService.analyzeRisk(maxReq);

        assertTrue(maxResult.getRiskScore() <= 1.0 && maxResult.getRiskScore() >= 0.0);
        assertTrue(maxResult.getRiskPercentage() <= 100 && maxResult.getRiskPercentage() >= 0);
    }

    @Test
    @DisplayName("Test 7: Weight Validation - Default weights sum to 1.00")
    void testWeightValidation() {
        RiskConfiguration.Weights weights = riskConfig.getWeights();
        double sum = weights.getTotalWeight();
        assertEquals(1.00, sum, 0.001, "Risk weights must sum to 1.00");
        assertTrue(weights.isValid());
    }

    @Test
    @DisplayName("Test 8: Unknown Change Type throws ValidationException (400)")
    void testUnknownChangeTypeThrows() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(lowService));

        RiskAnalysisRequest request = new RiskAnalysisRequest(1L, "NON_EXISTENT_TYPE", "1.0", "2.0", "LOW", "Test");
        assertThrows(ValidationException.class, () -> riskAnalysisService.analyzeRisk(request));
    }

    @Test
    @DisplayName("Test 9: Invalid Service ID throws ResourceNotFoundException (404)")
    void testInvalidServiceThrows() {
        when(serviceRepository.findById(999L)).thenReturn(Optional.empty());

        RiskAnalysisRequest request = new RiskAnalysisRequest(999L, "API_CHANGE", "1.0", "2.0", "LOW", "Test");
        assertThrows(ResourceNotFoundException.class, () -> riskAnalysisService.analyzeRisk(request));
    }

    @Test
    @DisplayName("Test 10: No Historical Data does not crash and documents fallback")
    void testNoHistoricalDataFallback() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(lowService));
        when(changeRepository.findByService(lowService)).thenReturn(Collections.emptyList());

        BlastRadiusResultDto blast = new BlastRadiusResultDto(
                new ServiceRefDto(1L, "Reporting Service", "ANALYTICS", Criticality.LOW, "1.0"),
                Collections.emptyList(), Collections.emptyList(), Collections.emptyList(),
                Collections.emptyList(), 0, 0, 0,
                Collections.emptyMap(), Collections.emptyList(), 0.0
        );
        when(blastRadiusService.analyzeBlastRadius(1L)).thenReturn(blast);

        RiskAnalysisRequest request = new RiskAnalysisRequest(1L, "CONFIG_CHANGE", "1.0", "1.1", "LOW", "Test");
        RiskAnalysisResult result = riskAnalysisService.analyzeRisk(request);

        assertNotNull(result);
        assertEquals(0.20, result.getFactors().get("historicalIncidents").getNormalizedValue(), 0.001);
        assertTrue(result.getFactors().get("historicalIncidents").getDescription().contains("default baseline"));
    }

    @Test
    @DisplayName("Test 11 (Integration scenario): Payment Service with VERSION_UPDATE and HIGH complexity")
    void testPaymentServiceVersionUpdateScenario() {
        when(serviceRepository.findById(4L)).thenReturn(Optional.of(criticalService));
        when(changeRepository.findByService(criticalService)).thenReturn(Collections.emptyList());

        BlastRadiusResultDto blast = new BlastRadiusResultDto(
                new ServiceRefDto(4L, "Payment Service", "PAYMENT", Criticality.CRITICAL, "2.0"),
                List.of("Fraud Detection", "Core Banking", "Notification"),
                List.of("Transaction DB", "Reconciliation", "Reporting"),
                List.of("Fraud Detection", "Core Banking", "Notification", "Transaction DB", "Reconciliation", "Reporting"),
                List.of("Core Banking", "Transaction DB"), 2, 6, 3,
                Map.of("Fraud Detection", 1, "Core Banking", 1, "Notification", 1, "Transaction DB", 2, "Reconciliation", 2, "Reporting", 3),
                List.of(List.of("Payment", "Core Banking", "Transaction DB")), 80.8
        );
        when(blastRadiusService.analyzeBlastRadius(4L)).thenReturn(blast);

        RiskAnalysisRequest request = new RiskAnalysisRequest(4L, "VERSION_UPDATE", "2.0", "3.0", "HIGH", "Upgrade Payment Service");
        RiskAnalysisResult result = riskAnalysisService.analyzeRisk(request);

        assertNotNull(result);
        assertEquals(4L, result.getServiceId());
        assertEquals("Payment Service", result.getServiceName());
        assertTrue(result.getRiskScore() > 0.0);
        assertTrue(result.getRiskPercentage() > 0);
        assertNotNull(result.getRiskLevel());
        assertEquals(80.8, result.getBlastRadiusScore());
        assertEquals(6, result.getTotalAffectedServices());
        assertEquals(2, result.getCriticalServicesAffected());
        assertEquals(3, result.getMaxDependencyDepth());
        assertNotNull(result.getFactors());
        assertEquals(8, result.getFactors().size());
        assertNotNull(result.getExplanation());
        assertFalse(result.getExplanation().isBlank());
    }

    @Test
    @DisplayName("Test 12 (Phase 7): Successful ML prediction integration")
    void testSuccessfulMLPredictionIntegration() {
        when(serviceRepository.findById(4L)).thenReturn(Optional.of(criticalService));
        when(changeRepository.findByService(criticalService)).thenReturn(Collections.emptyList());

        BlastRadiusResultDto blast = new BlastRadiusResultDto(
                new ServiceRefDto(4L, "Payment Service", "PAYMENT", Criticality.CRITICAL, "2.0"),
                List.of("Core Banking"), Collections.emptyList(), List.of("Core Banking"),
                List.of("Core Banking"), 1, 1, 1,
                Map.of("Core Banking", 1), List.of(List.of("Payment", "Core Banking")), 50.0
        );
        when(blastRadiusService.analyzeBlastRadius(4L)).thenReturn(blast);

        MLPredictionResponse mockResponse = new MLPredictionResponse(0.88, 1, "CRITICAL", "RandomForest", "1.0");
        when(mlServiceClient.predict(any())).thenReturn(new MLServiceClient.MLResult(mockResponse, MLStatus.AVAILABLE, "OK"));

        RiskAnalysisRequest request = new RiskAnalysisRequest(4L, "VERSION_UPDATE", "2.0", "3.0", "HIGH", "Upgrade Payment");
        RiskAnalysisResult result = riskAnalysisService.analyzeRisk(request);

        assertNotNull(result);
        assertEquals(MLStatus.AVAILABLE, result.getMlStatus());
        assertNotNull(result.getMlPrediction());
        assertEquals(0.88, result.getMlPrediction().getFailureProbability());
        assertEquals(1, result.getMlPrediction().getPrediction());
        assertEquals("CRITICAL", result.getMlPrediction().getRiskLevel());

        // Verify rule-based risk is also present
        assertNotNull(result.getRuleBasedRisk());
        assertTrue(result.getRiskScore() > 0.0);
    }

    @Test
    @DisplayName("Test 13 (Phase 7): ML Service Unavailable - Graceful degradation without failure")
    void testMLServiceUnavailableFallback() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(lowService));
        when(changeRepository.findByService(lowService)).thenReturn(Collections.emptyList());

        BlastRadiusResultDto blast = new BlastRadiusResultDto(
                new ServiceRefDto(1L, "Reporting Service", "ANALYTICS", Criticality.LOW, "1.0"),
                Collections.emptyList(), Collections.emptyList(), Collections.emptyList(),
                Collections.emptyList(), 0, 0, 0,
                Collections.emptyMap(), Collections.emptyList(), 0.0
        );
        when(blastRadiusService.analyzeBlastRadius(1L)).thenReturn(blast);

        // Simulate Python service offline
        when(mlServiceClient.predict(any())).thenReturn(new MLServiceClient.MLResult(null, MLStatus.UNAVAILABLE, "Offline"));

        RiskAnalysisRequest request = new RiskAnalysisRequest(1L, "CONFIG_CHANGE", "1.0", "1.1", "LOW", "Config update");
        RiskAnalysisResult result = riskAnalysisService.analyzeRisk(request);

        assertNotNull(result);
        // Rule based risk continues to work 100%
        assertEquals("LOW", result.getRiskLevel());
        assertTrue(result.getRiskScore() < 0.30);
        // ML status is gracefully flagged as UNAVAILABLE with null prediction
        assertEquals(MLStatus.UNAVAILABLE, result.getMlStatus());
        assertNull(result.getMlPrediction());
    }

    @Test
    @DisplayName("Test 14 (Phase 7): ML Service Timeout - Graceful fallback")
    void testMLServiceTimeoutFallback() {
        when(serviceRepository.findById(2L)).thenReturn(Optional.of(mediumService));
        when(changeRepository.findByService(mediumService)).thenReturn(Collections.emptyList());

        BlastRadiusResultDto blast = new BlastRadiusResultDto(
                new ServiceRefDto(2L, "Notification Service", "MESSAGING", Criticality.MEDIUM, "1.0"),
                Collections.emptyList(), Collections.emptyList(), Collections.emptyList(),
                Collections.emptyList(), 0, 0, 0,
                Collections.emptyMap(), Collections.emptyList(), 15.0
        );
        when(blastRadiusService.analyzeBlastRadius(2L)).thenReturn(blast);

        // Simulate timeout
        when(mlServiceClient.predict(any())).thenReturn(new MLServiceClient.MLResult(null, MLStatus.TIMEOUT, "Timeout after 3000ms"));

        RiskAnalysisRequest request = new RiskAnalysisRequest(2L, "VERSION_UPDATE", "1.0", "1.1", "MEDIUM", "Routine update");
        RiskAnalysisResult result = riskAnalysisService.analyzeRisk(request);

        assertNotNull(result);
        assertEquals(MLStatus.TIMEOUT, result.getMlStatus());
        assertNull(result.getMlPrediction());
        assertNotNull(result.getRuleBasedRisk());
    }
}
