package com.changeguard.service;

import com.changeguard.config.RiskConfiguration;
import com.changeguard.dto.DependencyChangeDto;
import com.changeguard.dto.WhatIfSimulationRequest;
import com.changeguard.dto.WhatIfSimulationResponse;
import com.changeguard.dto.ml.MLPredictionResponse;
import com.changeguard.dto.ml.MLStatus;
import com.changeguard.exception.ResourceNotFoundException;
import com.changeguard.model.Dependency;
import com.changeguard.model.ServiceEntity;
import com.changeguard.model.enums.Criticality;
import com.changeguard.model.enums.ServiceStatus;
import com.changeguard.repository.ChangeRepository;
import com.changeguard.repository.DependencyRepository;
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
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WhatIfSimulationServiceTest {

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private DependencyRepository dependencyRepository;

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

    @InjectMocks
    private WhatIfSimulationService whatIfSimulationService;

    private ServiceEntity paymentService;
    private ServiceEntity fraudService;
    private ServiceEntity coreBankingService;
    private ServiceEntity reportingService;
    private List<ServiceEntity> allServices;
    private List<Dependency> allDependencies;

    @BeforeEach
    void setUp() {
        paymentService = new ServiceEntity("Payment Service", "PAYMENTS", Criticality.CRITICAL, "2.0.0", ServiceStatus.ACTIVE);
        paymentService.setId(5L);

        fraudService = new ServiceEntity("Fraud Detection Service", "SECURITY", Criticality.HIGH, "1.4.0", ServiceStatus.ACTIVE);
        fraudService.setId(6L);

        coreBankingService = new ServiceEntity("Core Banking Service", "CORE", Criticality.CRITICAL, "4.1.0", ServiceStatus.ACTIVE);
        coreBankingService.setId(7L);

        reportingService = new ServiceEntity("Reporting Service", "ANALYTICS", Criticality.LOW, "1.0.0", ServiceStatus.ACTIVE);
        reportingService.setId(10L);

        allServices = List.of(paymentService, fraudService, coreBankingService, reportingService);

        // Baseline: Payment -> Fraud -> Core Banking
        Dependency dep1 = new Dependency(paymentService, fraudService, "REST_DIRECT", "HIGH");
        dep1.setId(101L);
        Dependency dep2 = new Dependency(fraudService, coreBankingService, "RPC_SYNC", "CRITICAL");
        dep2.setId(102L);

        allDependencies = List.of(dep1, dep2);

        // Setup mock default behavior for BlastRadius calculation
        lenient().when(blastRadiusService.calculateBlastRadiusScore(anyInt(), anyInt(), anyInt(), anyInt(), anyInt()))
                .thenAnswer(inv -> {
                    int affected = inv.getArgument(0);
                    int critical = inv.getArgument(2);
                    return (affected * 10.0) + (critical * 15.0);
                });

        lenient().when(mlServiceClient.predict(any()))
                .thenReturn(new MLServiceClient.MLResult(
                        new MLPredictionResponse(0.42, "SUCCESS", "Random Forest Classifier", 0.85),
                        MLStatus.ONLINE
                ));
    }

    @Test
    @DisplayName("Safety Rule: Simulation must NEVER mutate the real database repositories")
    void testSimulationIsolated_DoesNotMutateDatabase() {
        when(serviceRepository.findById(5L)).thenReturn(Optional.of(paymentService));
        when(serviceRepository.findAll()).thenReturn(allServices);
        when(dependencyRepository.findAll()).thenReturn(allDependencies);

        WhatIfSimulationRequest request = new WhatIfSimulationRequest(
                5L, "VERSION_UPDATE", "2.0.0", "3.0.0", "HIGH", "Upgrade Payment to v3"
        );

        WhatIfSimulationResponse response = whatIfSimulationService.simulate(request);

        assertNotNull(response);
        assertNotNull(response.getCurrentState());
        assertNotNull(response.getSimulatedState());
        assertNotNull(response.getComparison());

        // Verify zero save/delete/update repository operations were executed
        verify(serviceRepository, never()).save(any());
        verify(serviceRepository, never()).delete(any());
        verify(serviceRepository, never()).deleteAll();
        verify(dependencyRepository, never()).save(any());
        verify(dependencyRepository, never()).delete(any());
        verify(dependencyRepository, never()).deleteAll();
        verify(changeRepository, never()).save(any());
    }

    @Test
    @DisplayName("Simulation: Adding a dependency expands blast radius and reveals newly affected services")
    void testAddDependencySimulation_ExpandsBlastRadius() {
        when(serviceRepository.findById(5L)).thenReturn(Optional.of(paymentService));
        when(serviceRepository.findAll()).thenReturn(allServices);
        when(dependencyRepository.findAll()).thenReturn(allDependencies);

        // Hypothetically add: Payment Service -> Reporting Service
        WhatIfSimulationRequest request = new WhatIfSimulationRequest(
                5L, "DEPENDENCY_CHANGE", "2.0.0", "2.0.0", "MEDIUM", "Connect to Reporting"
        );
        request.setDependencyChanges(List.of(
                new DependencyChangeDto("ADD", 5L, 10L)
        ));

        WhatIfSimulationResponse response = whatIfSimulationService.simulate(request);

        // Current state affected: Fraud, Core Banking (2 total)
        assertEquals(2, response.getCurrentState().getTotalAffectedServices());
        assertTrue(response.getCurrentState().getAllAffectedServices().contains("Fraud Detection Service"));
        assertTrue(response.getCurrentState().getAllAffectedServices().contains("Core Banking Service"));
        assertFalse(response.getCurrentState().getAllAffectedServices().contains("Reporting Service"));

        // Simulated state affected: Fraud, Core Banking, Reporting (3 total)
        assertEquals(3, response.getSimulatedState().getTotalAffectedServices());
        assertTrue(response.getSimulatedState().getAllAffectedServices().contains("Reporting Service"));

        // Comparison Diff
        assertEquals(1, response.getComparison().getNewlyAffectedServices().size());
        assertEquals("Reporting Service", response.getComparison().getNewlyAffectedServices().get(0));
        assertEquals(0, response.getComparison().getNoLongerAffectedServices().size());
        assertEquals(1, response.getComparison().getAffectedCountDelta());
    }

    @Test
    @DisplayName("Simulation: Removing a dependency decouples downstream services")
    void testRemoveDependencySimulation_DecouplesServices() {
        when(serviceRepository.findById(5L)).thenReturn(Optional.of(paymentService));
        when(serviceRepository.findAll()).thenReturn(allServices);
        when(dependencyRepository.findAll()).thenReturn(allDependencies);

        // Hypothetically remove edge: Payment Service -> Fraud Detection Service
        WhatIfSimulationRequest request = new WhatIfSimulationRequest(
                5L, "DEPENDENCY_CHANGE", "2.0.0", "2.0.0", "LOW", "Decouple Fraud Service"
        );
        request.setDependencyChanges(List.of(
                new DependencyChangeDto("REMOVE", 5L, 6L)
        ));

        WhatIfSimulationResponse response = whatIfSimulationService.simulate(request);

        // Current state affected: 2 services
        assertEquals(2, response.getCurrentState().getTotalAffectedServices());

        // Simulated state affected: 0 services (isolated)
        assertEquals(0, response.getSimulatedState().getTotalAffectedServices());

        // Comparison Diff
        assertEquals(2, response.getComparison().getNoLongerAffectedServices().size());
        assertTrue(response.getComparison().getNoLongerAffectedServices().contains("Fraud Detection Service"));
        assertTrue(response.getComparison().getNoLongerAffectedServices().contains("Core Banking Service"));
        assertEquals(-2, response.getComparison().getAffectedCountDelta());
    }

    @Test
    @DisplayName("Simulation: Complexity increase shifts qualitative risk level and generates executive verdict")
    void testComplexityIncrease_ShiftsRiskLevel() {
        when(serviceRepository.findById(5L)).thenReturn(Optional.of(paymentService));
        when(serviceRepository.findAll()).thenReturn(allServices);
        when(dependencyRepository.findAll()).thenReturn(allDependencies);

        WhatIfSimulationRequest request = new WhatIfSimulationRequest(
                5L, "DATABASE_CHANGE", "2.0.0", "3.0.0", "VERY_HIGH", "Critical Schema Migration"
        );

        WhatIfSimulationResponse response = whatIfSimulationService.simulate(request);

        assertNotNull(response.getComparison().getSimulationVerdict());
        assertTrue(response.getComparison().getSimulationVerdict().contains("Payment Service"));
        assertTrue(response.getSimulatedState().getRuleBasedRiskPercentage() >= response.getCurrentState().getRuleBasedRiskPercentage());
    }

    @Test
    @DisplayName("Simulation: Non-existent service throws ResourceNotFoundException")
    void testMissingService_ThrowsResourceNotFoundException() {
        when(serviceRepository.findById(999L)).thenReturn(Optional.empty());

        WhatIfSimulationRequest request = new WhatIfSimulationRequest(
                999L, "VERSION_UPDATE", "1.0", "2.0", "LOW", "Unknown"
        );

        assertThrows(ResourceNotFoundException.class, () -> whatIfSimulationService.simulate(request));
    }
}
