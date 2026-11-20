package com.changeguard.service;

import com.changeguard.dto.BlastRadiusResultDto;
import com.changeguard.dto.RiskAnalysisRequest;
import com.changeguard.dto.ServiceRefDto;
import com.changeguard.dto.ml.MLPredictionRequest;
import com.changeguard.model.ServiceEntity;
import com.changeguard.model.enums.Criticality;
import com.changeguard.model.enums.ServiceStatus;
import com.changeguard.service.ml.MLFeatureBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class MLFeatureBuilderTest {

    private MLFeatureBuilder featureBuilder;
    private ServiceEntity paymentService;

    @BeforeEach
    void setUp() {
        featureBuilder = new MLFeatureBuilder();
        paymentService = new ServiceEntity(5L, "Payment Service", "PAYMENT", Criticality.CRITICAL, "2.0.0", ServiceStatus.ACTIVE);
    }

    @Test
    @DisplayName("Test Version Delta Calculation for Semver updates")
    void testVersionDeltaCalculation() {
        // Major update
        assertEquals(1.0, featureBuilder.calculateVersionDelta("2.0.0", "3.0.0", "VERSION_UPDATE"), 0.001);
        assertEquals(2.0, featureBuilder.calculateVersionDelta("1.0.0", "3.0.0", "VERSION_UPDATE"), 0.001);

        // Minor update
        assertEquals(0.10, featureBuilder.calculateVersionDelta("2.1.0", "2.2.0", "VERSION_UPDATE"), 0.001);
        assertEquals(0.30, featureBuilder.calculateVersionDelta("2.1.0", "2.4.0", "VERSION_UPDATE"), 0.001);

        // Patch update
        assertEquals(0.02, featureBuilder.calculateVersionDelta("2.1.0", "2.1.1", "VERSION_UPDATE"), 0.001);

        // Identical versions
        assertEquals(0.01, featureBuilder.calculateVersionDelta("2.1.0", "2.1.0", "VERSION_UPDATE"), 0.001);
    }

    @Test
    @DisplayName("Test ML Feature Vector generation from backend domain entities")
    void testBuildFeatures() {
        RiskAnalysisRequest request = new RiskAnalysisRequest(
                5L, "VERSION_UPDATE", "2.0.0", "3.0.0", "HIGH", "Upgrade Payment API"
        );

        BlastRadiusResultDto blast = new BlastRadiusResultDto(
                new ServiceRefDto(5L, "Payment Service", "PAYMENT", Criticality.CRITICAL, "2.0.0"),
                List.of("Fraud", "Core", "Notification"),
                List.of("DB", "Reconciliation", "Reporting"),
                List.of("Fraud", "Core", "Notification", "DB", "Reconciliation", "Reporting"),
                List.of("Core", "DB"),
                2, 6, 3,
                Collections.emptyMap(), Collections.emptyList(), 80.8
        );

        MLPredictionRequest mlReq = featureBuilder.buildFeatures(
                request,
                paymentService,
                blast,
                0.75, // normalized complexity
                0.20, // historical failure rate
                3     // previous incidents count
        );

        assertNotNull(mlReq);
        assertEquals(0.75, mlReq.getChangeComplexity());
        assertEquals(6, mlReq.getDependencyCount());
        assertEquals(3, mlReq.getDependencyDepth());
        assertEquals(1.00, mlReq.getCriticalityScore());
        assertEquals(0.20, mlReq.getHistoricalFailureRate());
        assertEquals("VERSION_UPDATE", mlReq.getChangeType());
        assertEquals(80.8, mlReq.getBlastRadiusScore());
        assertEquals(2, mlReq.getCriticalServicesAffected());
        assertEquals(3, mlReq.getPreviousIncidents());
        assertEquals(48, mlReq.getServiceAge());
        assertEquals(1.0, mlReq.getVersionChangeSize());
    }
}
