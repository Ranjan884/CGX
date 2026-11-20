package com.changeguard.service;

import com.changeguard.dto.BlastRadiusResultDto;
import com.changeguard.dto.ChangeBlastRadiusDto;
import com.changeguard.dto.PathsResultDto;
import com.changeguard.exception.ResourceNotFoundException;
import com.changeguard.model.Change;
import com.changeguard.model.Dependency;
import com.changeguard.model.ServiceEntity;
import com.changeguard.model.enums.ChangeType;
import com.changeguard.model.enums.Criticality;
import com.changeguard.model.enums.ServiceStatus;
import com.changeguard.repository.ChangeRepository;
import com.changeguard.repository.DependencyRepository;
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
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BlastRadiusServiceTest {

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private DependencyRepository dependencyRepository;

    @Mock
    private ChangeRepository changeRepository;

    @Mock
    private DependencyGraphService dependencyGraphService;

    @InjectMocks
    private BlastRadiusService blastRadiusService;

    private ServiceEntity serviceA;
    private ServiceEntity serviceB;
    private ServiceEntity serviceC;
    private ServiceEntity serviceD;

    @BeforeEach
    void setUp() {
        serviceA = new ServiceEntity(1L, "Service A", "GATEWAY", Criticality.HIGH, "1.0", ServiceStatus.ACTIVE);
        serviceB = new ServiceEntity(2L, "Service B", "CORE", Criticality.HIGH, "1.0", ServiceStatus.ACTIVE);
        serviceC = new ServiceEntity(3L, "Service C", "DATABASE", Criticality.CRITICAL, "1.0", ServiceStatus.ACTIVE);
        serviceD = new ServiceEntity(4L, "Service D", "ANALYTICS", Criticality.LOW, "1.0", ServiceStatus.ACTIVE);
    }

    @Test
    @DisplayName("Test 1: No dependencies - Service with no outgoing dependencies")
    void testNoDependencies() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(serviceA));
        when(serviceRepository.findAll()).thenReturn(List.of(serviceA));
        when(dependencyRepository.findAll()).thenReturn(Collections.emptyList());
        when(dependencyGraphService.findDependencyPaths(eq(1L), anyInt(), anyInt()))
                .thenReturn(new PathsResultDto("Service A", 1L, Collections.emptyList()));

        BlastRadiusResultDto result = blastRadiusService.analyzeBlastRadius(1L);

        assertEquals("Service A", result.getStartingService().getName());
        assertEquals(0, result.getTotalAffectedServices());
        assertEquals(0, result.getDirectlyAffectedServices().size());
        assertEquals(0, result.getIndirectlyAffectedServices().size());
        assertEquals(0, result.getMaxDependencyDepth());
        assertEquals(0.0, result.getBlastRadiusScore());
    }

    @Test
    @DisplayName("Test 2: One direct dependency (A -> B)")
    void testOneDirectDependency() {
        List<ServiceEntity> services = List.of(serviceA, serviceB);
        List<Dependency> dependencies = List.of(
                new Dependency(1L, serviceA, serviceB, "REST_API", Criticality.HIGH)
        );

        when(serviceRepository.findById(1L)).thenReturn(Optional.of(serviceA));
        when(serviceRepository.findAll()).thenReturn(services);
        when(dependencyRepository.findAll()).thenReturn(dependencies);
        when(dependencyGraphService.findDependencyPaths(eq(1L), anyInt(), anyInt()))
                .thenReturn(new PathsResultDto("Service A", 1L, List.of(List.of("Service A", "Service B"))));

        BlastRadiusResultDto result = blastRadiusService.analyzeBlastRadius(1L);

        assertEquals(1, result.getTotalAffectedServices());
        assertEquals(List.of("Service B"), result.getDirectlyAffectedServices());
        assertEquals(0, result.getIndirectlyAffectedServices().size());
        assertEquals(1, result.getMaxDependencyDepth());
        assertEquals(1, result.getServiceDepths().get("Service B"));
        assertTrue(result.getBlastRadiusScore() > 0.0);
    }

    @Test
    @DisplayName("Test 3: Multiple direct dependencies (A -> B, A -> C, A -> D)")
    void testMultipleDirectDependencies() {
        List<ServiceEntity> services = List.of(serviceA, serviceB, serviceC, serviceD);
        List<Dependency> dependencies = List.of(
                new Dependency(1L, serviceA, serviceB, "REST_API", Criticality.HIGH),
                new Dependency(2L, serviceA, serviceC, "JDBC", Criticality.CRITICAL),
                new Dependency(3L, serviceA, serviceD, "ASYNC", Criticality.LOW)
        );

        when(serviceRepository.findById(1L)).thenReturn(Optional.of(serviceA));
        when(serviceRepository.findAll()).thenReturn(services);
        when(dependencyRepository.findAll()).thenReturn(dependencies);
        when(dependencyGraphService.findDependencyPaths(eq(1L), anyInt(), anyInt()))
                .thenReturn(new PathsResultDto("Service A", 1L, List.of(
                        List.of("Service A", "Service B"),
                        List.of("Service A", "Service C"),
                        List.of("Service A", "Service D")
                )));

        BlastRadiusResultDto result = blastRadiusService.analyzeBlastRadius(1L);

        assertEquals(3, result.getTotalAffectedServices());
        assertEquals(3, result.getDirectlyAffectedServices().size());
        assertTrue(result.getDirectlyAffectedServices().containsAll(List.of("Service B", "Service C", "Service D")));
        assertEquals(0, result.getIndirectlyAffectedServices().size());
        assertEquals(1, result.getMaxDependencyDepth());
    }

    @Test
    @DisplayName("Test 4: Indirect dependency (A -> B -> C)")
    void testIndirectDependency() {
        List<ServiceEntity> services = List.of(serviceA, serviceB, serviceC);
        List<Dependency> dependencies = List.of(
                new Dependency(1L, serviceA, serviceB, "REST_API", Criticality.HIGH),
                new Dependency(2L, serviceB, serviceC, "JDBC", Criticality.CRITICAL)
        );

        when(serviceRepository.findById(1L)).thenReturn(Optional.of(serviceA));
        when(serviceRepository.findAll()).thenReturn(services);
        when(dependencyRepository.findAll()).thenReturn(dependencies);
        when(dependencyGraphService.findDependencyPaths(eq(1L), anyInt(), anyInt()))
                .thenReturn(new PathsResultDto("Service A", 1L, List.of(List.of("Service A", "Service B", "Service C"))));

        BlastRadiusResultDto result = blastRadiusService.analyzeBlastRadius(1L);

        assertEquals(2, result.getTotalAffectedServices());
        assertEquals(List.of("Service B"), result.getDirectlyAffectedServices());
        assertEquals(List.of("Service C"), result.getIndirectlyAffectedServices());
        assertEquals(1, result.getServiceDepths().get("Service B"));
        assertEquals(2, result.getServiceDepths().get("Service C"));
        assertEquals(2, result.getMaxDependencyDepth());
    }

    @Test
    @DisplayName("Test 5: Multiple levels (A -> B -> C -> D) - Max depth = 3")
    void testMultipleLevelsDepth() {
        List<ServiceEntity> services = List.of(serviceA, serviceB, serviceC, serviceD);
        List<Dependency> dependencies = List.of(
                new Dependency(1L, serviceA, serviceB, "REST_API", Criticality.HIGH),
                new Dependency(2L, serviceB, serviceC, "JDBC", Criticality.CRITICAL),
                new Dependency(3L, serviceC, serviceD, "BATCH", Criticality.LOW)
        );

        when(serviceRepository.findById(1L)).thenReturn(Optional.of(serviceA));
        when(serviceRepository.findAll()).thenReturn(services);
        when(dependencyRepository.findAll()).thenReturn(dependencies);
        when(dependencyGraphService.findDependencyPaths(eq(1L), anyInt(), anyInt()))
                .thenReturn(new PathsResultDto("Service A", 1L, List.of(List.of("Service A", "Service B", "Service C", "Service D"))));

        BlastRadiusResultDto result = blastRadiusService.analyzeBlastRadius(1L);

        assertEquals(3, result.getTotalAffectedServices());
        assertEquals(3, result.getMaxDependencyDepth());
        assertEquals(1, result.getServiceDepths().get("Service B"));
        assertEquals(2, result.getServiceDepths().get("Service C"));
        assertEquals(3, result.getServiceDepths().get("Service D"));
    }

    @Test
    @DisplayName("Test 6: Critical services detection (B = HIGH, C = CRITICAL)")
    void testCriticalServicesDetection() {
        List<ServiceEntity> services = List.of(serviceA, serviceB, serviceC);
        List<Dependency> dependencies = List.of(
                new Dependency(1L, serviceA, serviceB, "REST_API", Criticality.HIGH),
                new Dependency(2L, serviceB, serviceC, "JDBC", Criticality.CRITICAL)
        );

        when(serviceRepository.findById(1L)).thenReturn(Optional.of(serviceA));
        when(serviceRepository.findAll()).thenReturn(services);
        when(dependencyRepository.findAll()).thenReturn(dependencies);
        when(dependencyGraphService.findDependencyPaths(eq(1L), anyInt(), anyInt()))
                .thenReturn(new PathsResultDto("Service A", 1L, List.of(List.of("Service A", "Service B", "Service C"))));

        BlastRadiusResultDto result = blastRadiusService.analyzeBlastRadius(1L);

        assertEquals(1, result.getCriticalServicesAffectedCount());
        assertEquals(List.of("Service C"), result.getCriticalAffectedServices());
    }

    @Test
    @DisplayName("Test 7: Cycle handling (A -> B -> C -> A) terminates safely without infinite loop")
    void testCycleHandling() {
        List<ServiceEntity> services = List.of(serviceA, serviceB, serviceC);
        List<Dependency> dependencies = List.of(
                new Dependency(1L, serviceA, serviceB, "REST", Criticality.HIGH),
                new Dependency(2L, serviceB, serviceC, "REST", Criticality.HIGH),
                new Dependency(3L, serviceC, serviceA, "REST", Criticality.HIGH)
        );

        when(serviceRepository.findById(1L)).thenReturn(Optional.of(serviceA));
        when(serviceRepository.findAll()).thenReturn(services);
        when(dependencyRepository.findAll()).thenReturn(dependencies);
        when(dependencyGraphService.findDependencyPaths(eq(1L), anyInt(), anyInt()))
                .thenReturn(new PathsResultDto("Service A", 1L, List.of(List.of("Service A", "Service B", "Service C"))));

        // BFS depth calculation must terminate and visit only 2 distinct downstream nodes
        BlastRadiusResultDto result = blastRadiusService.analyzeBlastRadius(1L);

        assertEquals(2, result.getTotalAffectedServices());
        assertTrue(result.getAllAffectedServices().contains("Service B"));
        assertTrue(result.getAllAffectedServices().contains("Service C"));
        assertFalse(result.getAllAffectedServices().contains("Service A")); // Starting service excluded
    }

    @Test
    @DisplayName("Test 8: No graph / Empty dependencies")
    void testEmptyGraph() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(serviceA));
        when(serviceRepository.findAll()).thenReturn(List.of(serviceA));
        when(dependencyRepository.findAll()).thenReturn(Collections.emptyList());
        when(dependencyGraphService.findDependencyPaths(eq(1L), anyInt(), anyInt()))
                .thenReturn(new PathsResultDto("Service A", 1L, Collections.emptyList()));

        BlastRadiusResultDto result = blastRadiusService.analyzeBlastRadius(1L);

        assertNotNull(result);
        assertEquals(0, result.getTotalAffectedServices());
        assertEquals(0.0, result.getBlastRadiusScore());
    }

    @Test
    @DisplayName("Test 9: Invalid service ID throws ResourceNotFoundException (404)")
    void testInvalidServiceThrows() {
        when(serviceRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> blastRadiusService.analyzeBlastRadius(999L));
    }

    @Test
    @DisplayName("Test 10: Blast-radius score bounds and monotonicity")
    void testBlastRadiusScore() {
        // 1. Zero affected must be 0.0
        double score0 = blastRadiusService.calculateBlastRadiusScore(0, 11, 0, 0, 0);
        assertEquals(0.0, score0);

        // 2. Increasing affected services increases score
        double score1 = blastRadiusService.calculateBlastRadiusScore(2, 11, 0, 1, 1);
        double score2 = blastRadiusService.calculateBlastRadiusScore(6, 11, 0, 1, 1);
        assertTrue(score2 > score1, "More affected services must increase the score");

        // 3. Adding critical services increases score
        double scoreCrit = blastRadiusService.calculateBlastRadiusScore(6, 11, 2, 1, 1);
        assertTrue(scoreCrit > score2, "More critical services must increase the score");

        // 4. Greater depth increases score
        double scoreDepth = blastRadiusService.calculateBlastRadiusScore(6, 11, 2, 3, 1);
        assertTrue(scoreDepth > scoreCrit, "Greater dependency depth must increase the score");

        // 5. Score must always remain bounded between 0 and 100
        double maxScore = blastRadiusService.calculateBlastRadiusScore(11, 11, 5, 10, 20);
        assertTrue(maxScore <= 100.0 && maxScore >= 0.0, "Score must stay <= 100.0");
    }

    @Test
    @DisplayName("Test 11: Change-based Blast Radius Analysis")
    void testAnalyzeBlastRadiusForChange() {
        Change change = new Change(10L, serviceA, ChangeType.API_CHANGE, "Update API contract", "1.0", "2.0", 8);
        when(changeRepository.findById(10L)).thenReturn(Optional.of(change));

        when(serviceRepository.findById(1L)).thenReturn(Optional.of(serviceA));
        when(serviceRepository.findAll()).thenReturn(List.of(serviceA, serviceB));
        when(dependencyRepository.findAll()).thenReturn(List.of(
                new Dependency(1L, serviceA, serviceB, "REST", Criticality.HIGH)
        ));
        when(dependencyGraphService.findDependencyPaths(eq(1L), anyInt(), anyInt()))
                .thenReturn(new PathsResultDto("Service A", 1L, List.of(List.of("Service A", "Service B"))));

        ChangeBlastRadiusDto changeResult = blastRadiusService.analyzeBlastRadiusForChange(10L);

        assertEquals(10L, changeResult.getChangeId());
        assertEquals("Service A", changeResult.getChangedService());
        assertEquals(ChangeType.API_CHANGE, changeResult.getChangeType());
        assertNotNull(changeResult.getBlastRadius());
        assertEquals(1, changeResult.getBlastRadius().getTotalAffectedServices());
    }
}
