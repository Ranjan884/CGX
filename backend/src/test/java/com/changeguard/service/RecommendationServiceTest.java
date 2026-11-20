package com.changeguard.service;

import com.changeguard.dto.BlastRadiusResultDto;
import com.changeguard.dto.RiskAnalysisRequest;
import com.changeguard.dto.RiskAnalysisResult;
import com.changeguard.dto.ml.MLPredictionResponse;
import com.changeguard.dto.ml.MLStatus;
import com.changeguard.dto.recommendation.*;
import com.changeguard.exception.ResourceNotFoundException;
import com.changeguard.exception.ValidationException;
import com.changeguard.model.Change;
import com.changeguard.model.Incident;
import com.changeguard.model.ServiceEntity;
import com.changeguard.model.enums.ChangeType;
import com.changeguard.model.enums.Criticality;
import com.changeguard.model.enums.RecommendationType;
import com.changeguard.model.enums.ServiceStatus;
import com.changeguard.model.enums.Severity;
import com.changeguard.repository.ChangeRepository;
import com.changeguard.repository.IncidentRepository;
import com.changeguard.repository.RiskAnalysisHistoryRepository;
import com.changeguard.repository.ServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RecommendationServiceTest {

    @Mock
    private RiskAnalysisService riskAnalysisService;

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private ChangeRepository changeRepository;

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private RiskAnalysisHistoryRepository historyRepository;

    @Mock
    private WhatIfSimulationService whatIfSimulationService;

    @InjectMocks
    private RecommendationService recommendationService;

    private ServiceEntity paymentService;
    private ServiceEntity reportingService;

    @BeforeEach
    void setUp() {
        paymentService = new ServiceEntity(5L, "Payment Service", "PAYMENT", Criticality.CRITICAL, "2.0.0", ServiceStatus.ACTIVE);
        reportingService = new ServiceEntity(11L, "Reporting Service", "ANALYTICS", Criticality.LOW, "3.0.0", ServiceStatus.ACTIVE);
    }

    @Test
    @DisplayName("Test 1: Critical Risk & Critical Service recommends Staged Blue-Green Deployment")
    void testCriticalRiskRecommendations() {
        when(serviceRepository.findById(5L)).thenReturn(Optional.of(paymentService));

        BlastRadiusResultDto blast = new BlastRadiusResultDto();
        blast.setBlastRadiusScore(80.8);
        blast.setTotalAffectedServices(6);
        blast.setCriticalServicesAffectedCount(2);
        blast.setMaxDependencyDepth(3);
        blast.setAllAffectedServices(List.of("Core Banking Service", "Transaction Database"));
        blast.setCriticalAffectedServices(List.of("Core Banking Service", "Transaction Database"));

        RiskAnalysisResult riskResult = new RiskAnalysisResult(
                null, 5L, "Payment Service", 0.81, 81, "CRITICAL",
                80.8, 6, 2, 3, Collections.emptyMap(), "Explanation", blast
        );
        MLPredictionResponse ml = new MLPredictionResponse(0.85, 1, "HIGH", "RandomForest", "1.0.0");
        riskResult.setMlPrediction(ml);
        riskResult.setMlStatus(MLStatus.AVAILABLE);

        when(riskAnalysisService.analyzeRisk(any())).thenReturn(riskResult);
        when(changeRepository.findByService(paymentService)).thenReturn(Collections.emptyList());

        RecommendationRequestDto req = new RecommendationRequestDto(5L, "VERSION_UPDATE", "2.0.0", "3.0.0", "HIGH", "Payment Upgrade");
        RecommendationResponseDto res = recommendationService.analyzeRecommendations(req);

        assertNotNull(res);
        assertEquals("CRITICAL", res.getRiskLevel());
        assertNotNull(res.getRecommendations());
        assertFalse(res.getRecommendations().isEmpty());

        // Check Staged Rollout is recommended with CRITICAL priority
        boolean hasStagedRollout = res.getRecommendations().stream()
                .anyMatch(a -> a.getType() == RecommendationType.STAGED_ROLLOUT && "CRITICAL".equals(a.getPriority()));
        assertTrue(hasStagedRollout, "Expected STAGED_ROLLOUT with CRITICAL priority");

        // Check Critical Service Monitoring is recommended
        boolean hasMonitoring = res.getRecommendations().stream()
                .anyMatch(a -> a.getType() == RecommendationType.CRITICAL_SERVICE_MONITORING);
        assertTrue(hasMonitoring, "Expected CRITICAL_SERVICE_MONITORING");

        // Verify decision support notice exists
        assertNotNull(res.getDecisionSupportNotice());
        assertTrue(res.getDecisionSupportNotice().contains("decision-support recommendations only"));
    }

    @Test
    @DisplayName("Test 2: Low Risk recommends Standard CI/CD Deployment")
    void testLowRiskRecommendations() {
        when(serviceRepository.findById(11L)).thenReturn(Optional.of(reportingService));

        BlastRadiusResultDto blast = new BlastRadiusResultDto();
        blast.setBlastRadiusScore(10.0);
        blast.setTotalAffectedServices(1);
        blast.setCriticalServicesAffectedCount(0);
        blast.setMaxDependencyDepth(1);
        blast.setAllAffectedServices(List.of("Reporting Database"));
        blast.setCriticalAffectedServices(Collections.emptyList());

        RiskAnalysisResult riskResult = new RiskAnalysisResult(
                null, 11L, "Reporting Service", 0.22, 22, "LOW",
                10.0, 1, 0, 1, Collections.emptyMap(), "Low risk", blast
        );
        MLPredictionResponse ml = new MLPredictionResponse(0.12, 0, "LOW", "RandomForest", "1.0.0");
        riskResult.setMlPrediction(ml);
        riskResult.setMlStatus(MLStatus.AVAILABLE);

        when(riskAnalysisService.analyzeRisk(any())).thenReturn(riskResult);
        when(changeRepository.findByService(reportingService)).thenReturn(Collections.emptyList());

        RecommendationRequestDto req = new RecommendationRequestDto(11L, "CONFIG_CHANGE", "1.0.0", "1.0.1", "LOW", "Minor timeout tweak");
        RecommendationResponseDto res = recommendationService.analyzeRecommendations(req);

        boolean hasStandard = res.getRecommendations().stream()
                .anyMatch(a -> a.getType() == RecommendationType.STANDARD_DEPLOYMENT && "LOW".equals(a.getPriority()));
        assertTrue(hasStandard, "Expected STANDARD_DEPLOYMENT with LOW priority");
    }

    @Test
    @DisplayName("Test 3: Database Change triggers Database Review recommendation")
    void testDatabaseChangeRecommendation() {
        when(serviceRepository.findById(5L)).thenReturn(Optional.of(paymentService));

        BlastRadiusResultDto blast = new BlastRadiusResultDto();
        blast.setBlastRadiusScore(45.0);
        blast.setTotalAffectedServices(2);
        blast.setCriticalServicesAffectedCount(1);
        blast.setMaxDependencyDepth(2);
        blast.setAllAffectedServices(List.of("Core Banking Service"));
        blast.setCriticalAffectedServices(List.of("Core Banking Service"));

        RiskAnalysisResult riskResult = new RiskAnalysisResult(
                null, 5L, "Payment Service", 0.55, 55, "MEDIUM",
                45.0, 2, 1, 2, Collections.emptyMap(), "Med risk", blast
        );

        when(riskAnalysisService.analyzeRisk(any())).thenReturn(riskResult);
        when(changeRepository.findByService(paymentService)).thenReturn(Collections.emptyList());

        RecommendationRequestDto req = new RecommendationRequestDto(5L, "DATABASE_CHANGE", "2.0.0", "2.1.0", "MEDIUM", "Add payment ledger index");
        RecommendationResponseDto res = recommendationService.analyzeRecommendations(req);

        boolean hasDbReview = res.getRecommendations().stream()
                .anyMatch(a -> a.getType() == RecommendationType.DATABASE_REVIEW);
        assertTrue(hasDbReview, "Expected DATABASE_REVIEW recommendation for DATABASE_CHANGE");
    }

    @Test
    @DisplayName("Test 4: Historical incidents on service triggers Historical Review recommendation")
    void testHistoricalIncidentEvidence() {
        when(serviceRepository.findById(5L)).thenReturn(Optional.of(paymentService));

        BlastRadiusResultDto blast = new BlastRadiusResultDto();
        blast.setBlastRadiusScore(45.0);
        blast.setTotalAffectedServices(2);
        blast.setCriticalServicesAffectedCount(0);
        blast.setMaxDependencyDepth(2);
        blast.setAllAffectedServices(List.of("Reporting Service"));
        blast.setCriticalAffectedServices(Collections.emptyList());

        RiskAnalysisResult riskResult = new RiskAnalysisResult(
                null, 5L, "Payment Service", 0.45, 45, "MEDIUM",
                45.0, 2, 0, 2, Collections.emptyMap(), "Med risk", blast
        );

        when(riskAnalysisService.analyzeRisk(any())).thenReturn(riskResult);

        Change pastChange = new Change(paymentService, ChangeType.VERSION_UPDATE, "Past upgrade", "1.0", "2.0", 5);
        Incident pastInc = new Incident(pastChange, Severity.HIGH, true, "Core Banking", "Deadlock on settlement table");

        when(changeRepository.findByService(paymentService)).thenReturn(List.of(pastChange));
        when(incidentRepository.findByChange(pastChange)).thenReturn(List.of(pastInc));

        RecommendationRequestDto req = new RecommendationRequestDto(5L, "VERSION_UPDATE", "2.0.0", "3.0.0", "HIGH", "Upgrade Payment");
        RecommendationResponseDto res = recommendationService.analyzeRecommendations(req);

        assertEquals("AVAILABLE", res.getHistoricalEvidence().getStatus());
        assertEquals(1, res.getHistoricalEvidence().getIncidentChangesCount());
        assertEquals(1.0, res.getHistoricalEvidence().getHistoricalIncidentRate());

        boolean hasHistReview = res.getRecommendations().stream()
                .anyMatch(a -> a.getType() == RecommendationType.HISTORICAL_REVIEW);
        assertTrue(hasHistReview, "Expected HISTORICAL_REVIEW when past incidents exist");
    }

    @Test
    @DisplayName("Test 5: ML Service Offline gracefully provides recommendations without fabricated ML scores")
    void testMLServiceOfflineBehavior() {
        when(serviceRepository.findById(5L)).thenReturn(Optional.of(paymentService));

        BlastRadiusResultDto blast = new BlastRadiusResultDto();
        blast.setBlastRadiusScore(50.0);
        blast.setTotalAffectedServices(3);
        blast.setCriticalServicesAffectedCount(1);
        blast.setMaxDependencyDepth(2);
        blast.setAllAffectedServices(List.of("Core Banking Service"));
        blast.setCriticalAffectedServices(List.of("Core Banking Service"));

        RiskAnalysisResult riskResult = new RiskAnalysisResult(
                null, 5L, "Payment Service", 0.65, 65, "HIGH",
                50.0, 3, 1, 2, Collections.emptyMap(), "High rule risk", blast
        );
        riskResult.setMlPrediction(null);
        riskResult.setMlStatus(MLStatus.UNAVAILABLE);

        when(riskAnalysisService.analyzeRisk(any())).thenReturn(riskResult);
        when(changeRepository.findByService(paymentService)).thenReturn(Collections.emptyList());

        RecommendationRequestDto req = new RecommendationRequestDto(5L, "VERSION_UPDATE", "2.0.0", "3.0.0", "HIGH", "Upgrade Payment");
        RecommendationResponseDto res = recommendationService.analyzeRecommendations(req);

        assertNull(res.getMlFailureProbability(), "ML probability must remain null when service offline");
        assertEquals("UNAVAILABLE", res.getMlStatus());
        assertFalse(res.getRecommendations().isEmpty(), "Recommendations must still be generated from rule-based risk");
    }

    @Test
    @DisplayName("Test 6: Missing serviceId throws ValidationException")
    void testMissingServiceIdThrows() {
        RecommendationRequestDto req = new RecommendationRequestDto(null, "VERSION_UPDATE", "1.0", "2.0", "LOW", "Test");
        assertThrows(ValidationException.class, () -> recommendationService.analyzeRecommendations(req));
    }

    @Test
    @DisplayName("Test 7: Non-existent service throws ResourceNotFoundException")
    void testNonExistentServiceThrows() {
        when(serviceRepository.findById(999L)).thenReturn(Optional.empty());
        RecommendationRequestDto req = new RecommendationRequestDto(999L, "VERSION_UPDATE", "1.0", "2.0", "LOW", "Test");
        assertThrows(ResourceNotFoundException.class, () -> recommendationService.analyzeRecommendations(req));
    }
}
