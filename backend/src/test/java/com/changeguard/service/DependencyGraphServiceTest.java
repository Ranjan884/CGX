package com.changeguard.service;

import com.changeguard.dto.*;
import com.changeguard.exception.ResourceNotFoundException;
import com.changeguard.model.Dependency;
import com.changeguard.model.ServiceEntity;
import com.changeguard.model.enums.Criticality;
import com.changeguard.model.enums.ServiceStatus;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DependencyGraphServiceTest {

    @Mock
    private DependencyRepository dependencyRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @InjectMocks
    private DependencyGraphService graphService;

    private List<ServiceEntity> mockServices;
    private List<Dependency> mockDependencies;

    @BeforeEach
    void setUp() {
        // Build 11 standard Phase 2 Banking Services
        ServiceEntity customerApp = new ServiceEntity(1L, "Customer App", "FRONTEND", Criticality.HIGH, "3.4.1", ServiceStatus.ACTIVE);
        ServiceEntity apiGateway = new ServiceEntity(2L, "API Gateway", "GATEWAY", Criticality.CRITICAL, "2.8.0", ServiceStatus.ACTIVE);
        ServiceEntity authService = new ServiceEntity(3L, "Authentication Service", "SECURITY", Criticality.CRITICAL, "1.9.4", ServiceStatus.ACTIVE);
        ServiceEntity accountService = new ServiceEntity(4L, "Account Service", "CORE", Criticality.HIGH, "2.1.0", ServiceStatus.ACTIVE);
        ServiceEntity paymentService = new ServiceEntity(5L, "Payment Service", "PAYMENT", Criticality.CRITICAL, "2.0.0", ServiceStatus.ACTIVE);
        ServiceEntity fraudService = new ServiceEntity(6L, "Fraud Detection Service", "SECURITY_ML", Criticality.HIGH, "1.5.2", ServiceStatus.ACTIVE);
        ServiceEntity coreBanking = new ServiceEntity(7L, "Core Banking Service", "CORE", Criticality.CRITICAL, "4.2.0", ServiceStatus.ACTIVE);
        ServiceEntity transactionDb = new ServiceEntity(8L, "Transaction Database", "DATABASE", Criticality.CRITICAL, "15.4", ServiceStatus.ACTIVE);
        ServiceEntity notificationService = new ServiceEntity(9L, "Notification Service", "MESSAGING", Criticality.MEDIUM, "2.3.1", ServiceStatus.ACTIVE);
        ServiceEntity reconciliationService = new ServiceEntity(10L, "Reconciliation Service", "BATCH", Criticality.HIGH, "1.8.0", ServiceStatus.ACTIVE);
        ServiceEntity reportingService = new ServiceEntity(11L, "Reporting Service", "ANALYTICS", Criticality.LOW, "3.0.2", ServiceStatus.ACTIVE);

        mockServices = Arrays.asList(
                customerApp, apiGateway, authService, accountService, paymentService,
                fraudService, coreBanking, transactionDb, notificationService,
                reconciliationService, reportingService
        );

        // Build 13 standard Phase 2 Dependencies
        mockDependencies = Arrays.asList(
                new Dependency(1L, customerApp, apiGateway, "REST_API", Criticality.CRITICAL),
                new Dependency(2L, apiGateway, authService, "gRPC", Criticality.CRITICAL),
                new Dependency(3L, apiGateway, accountService, "REST_API", Criticality.HIGH),
                new Dependency(4L, apiGateway, paymentService, "REST_API", Criticality.CRITICAL),
                new Dependency(5L, accountService, coreBanking, "gRPC", Criticality.CRITICAL),
                new Dependency(6L, paymentService, fraudService, "REST_API", Criticality.HIGH),
                new Dependency(7L, paymentService, coreBanking, "gRPC", Criticality.CRITICAL),
                new Dependency(8L, fraudService, coreBanking, "gRPC", Criticality.CRITICAL),
                new Dependency(9L, coreBanking, transactionDb, "JDBC_POOL", Criticality.CRITICAL),
                new Dependency(10L, paymentService, notificationService, "KAFKA_TOPIC", Criticality.MEDIUM),
                new Dependency(11L, coreBanking, reconciliationService, "EVENT_STREAM", Criticality.HIGH),
                new Dependency(12L, reconciliationService, reportingService, "BATCH_FILE", Criticality.LOW),
                new Dependency(13L, reportingService, transactionDb, "JDBC_READONLY", Criticality.LOW)
        );
    }

    private void mockStandardGraph() {
        when(serviceRepository.findAll()).thenReturn(mockServices);
        when(dependencyRepository.findAll()).thenReturn(mockDependencies);
    }

    @Test
    @DisplayName("Test 1: BFS Traversal starting from Payment Service (ID 5)")
    void testBFS() {
        mockStandardGraph();
        when(serviceRepository.findById(5L)).thenReturn(Optional.of(mockServices.get(4)));

        TraversalResultDto result = graphService.runBFS(5L);

        assertEquals("BFS", result.getAlgorithm());
        assertEquals("Payment Service", result.getStartingService());
        assertTrue(result.getVisitedServices().contains("Payment Service"));
        assertTrue(result.getVisitedServices().contains("Fraud Detection Service"));
        assertTrue(result.getVisitedServices().contains("Core Banking Service"));
        assertTrue(result.getVisitedServices().contains("Transaction Database"));
        assertTrue(result.getVisitedServices().contains("Notification Service"));
        assertTrue(result.getVisitedServices().contains("Reconciliation Service"));
        assertTrue(result.getVisitedServices().contains("Reporting Service"));

        // Level 1: Payment -> Fraud, Core Banking, Notification should precede Level 2
        int fraudIndex = result.getVisitedServices().indexOf("Fraud Detection Service");
        int coreIndex = result.getVisitedServices().indexOf("Core Banking Service");
        int dbIndex = result.getVisitedServices().indexOf("Transaction Database");

        assertTrue(fraudIndex < dbIndex);
        assertTrue(coreIndex < dbIndex);
    }

    @Test
    @DisplayName("Test 2: DFS Traversal visits all reachable nodes")
    void testDFS() {
        mockStandardGraph();
        when(serviceRepository.findById(5L)).thenReturn(Optional.of(mockServices.get(4)));

        TraversalResultDto result = graphService.runDFS(5L);

        assertEquals("DFS", result.getAlgorithm());
        assertEquals(7, result.getTotalVisited()); // Payment + 6 reachable systems
        assertTrue(result.getVisitedServices().contains("Transaction Database"));
    }

    @Test
    @DisplayName("Test 3 & 4: Direct vs Indirect Dependency Detection")
    void testDirectAndIndirectDetection() {
        mockStandardGraph();
        when(serviceRepository.findById(5L)).thenReturn(Optional.of(mockServices.get(4)));

        ServiceImpactDto impact = graphService.findDirectAndIndirectAffected(5L);

        assertEquals("Payment Service", impact.getStartingService().getName());

        // Payment directly calls: Fraud Detection, Core Banking, Notification Service
        assertEquals(3, impact.getDirectlyAffectedServices().size());
        List<String> directNames = impact.getDirectlyAffectedServices().stream().map(ServiceRefDto::getName).toList();
        assertTrue(directNames.contains("Fraud Detection Service"));
        assertTrue(directNames.contains("Core Banking Service"));
        assertTrue(directNames.contains("Notification Service"));

        // Indirectly affected: Transaction Database, Reconciliation Service, Reporting Service
        assertEquals(3, impact.getIndirectlyAffectedServices().size());
        List<String> indirectNames = impact.getIndirectlyAffectedServices().stream().map(ServiceRefDto::getName).toList();
        assertTrue(indirectNames.contains("Transaction Database"));
        assertTrue(indirectNames.contains("Reconciliation Service"));
        assertTrue(indirectNames.contains("Reporting Service"));

        assertEquals(6, impact.getTotalAffectedServices());
    }

    @Test
    @DisplayName("Test 5: Cycle Detection handles circular loops without infinite recursion")
    void testCycleDetection() {
        // Create cyclic dependency: Service A (1) -> B (2) -> C (3) -> A (1)
        ServiceEntity a = new ServiceEntity(1L, "Service A", "CORE", Criticality.HIGH, "1.0", ServiceStatus.ACTIVE);
        ServiceEntity b = new ServiceEntity(2L, "Service B", "CORE", Criticality.HIGH, "1.0", ServiceStatus.ACTIVE);
        ServiceEntity c = new ServiceEntity(3L, "Service C", "CORE", Criticality.HIGH, "1.0", ServiceStatus.ACTIVE);

        List<ServiceEntity> cycleServices = Arrays.asList(a, b, c);
        List<Dependency> cycleDeps = Arrays.asList(
                new Dependency(1L, a, b, "REST", Criticality.HIGH),
                new Dependency(2L, b, c, "REST", Criticality.HIGH),
                new Dependency(3L, c, a, "REST", Criticality.HIGH)
        );

        when(serviceRepository.findAll()).thenReturn(cycleServices);
        when(dependencyRepository.findAll()).thenReturn(cycleDeps);
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(a));

        // BFS should safely terminate with 3 visited nodes
        TraversalResultDto bfs = graphService.runBFS(1L);
        assertEquals(3, bfs.getTotalVisited());

        // DFS should safely terminate with 3 visited nodes
        TraversalResultDto dfs = graphService.runDFS(1L);
        assertEquals(3, dfs.getTotalVisited());

        // Path finding should terminate without loop
        PathsResultDto paths = graphService.findDependencyPaths(1L);
        assertNotNull(paths);
        assertTrue(paths.getTotalPaths() > 0);
    }

    @Test
    @DisplayName("Test 6: Path Finding discovers distinct paths from Payment Service")
    void testPathFinding() {
        mockStandardGraph();
        when(serviceRepository.findById(5L)).thenReturn(Optional.of(mockServices.get(4)));

        PathsResultDto result = graphService.findDependencyPaths(5L);

        assertEquals("Payment Service", result.getStartingService());
        assertTrue(result.getTotalPaths() >= 3);

        boolean foundNotificationPath = result.getPaths().stream()
                .anyMatch(p -> p.size() == 2 && p.get(0).equals("Payment Service") && p.get(1).equals("Notification Service"));
        assertTrue(foundNotificationPath, "Must discover direct path Payment -> Notification");
    }

    @Test
    @DisplayName("Test 7: Critical-Service Analysis identifies affected Tier-1 services")
    void testCriticalImpact() {
        mockStandardGraph();
        when(serviceRepository.findById(5L)).thenReturn(Optional.of(mockServices.get(4)));

        CriticalImpactDto impact = graphService.getCriticalImpact(5L);

        assertEquals("Payment Service", impact.getStartingService());
        assertEquals(6, impact.getAffectedServices());
        assertEquals(2, impact.getCriticalServicesAffected()); // Core Banking & Transaction DB
        assertTrue(impact.getCriticalServices().contains("Core Banking Service"));
        assertTrue(impact.getCriticalServices().contains("Transaction Database"));
    }

    @Test
    @DisplayName("Test 8: Empty Graph handling")
    void testEmptyGraph() {
        when(serviceRepository.findAll()).thenReturn(Collections.emptyList());
        when(dependencyRepository.findAll()).thenReturn(Collections.emptyList());

        GraphResponseDto graph = graphService.getCompleteGraph();
        assertEquals(0, graph.getTotalNodes());
        assertEquals(0, graph.getTotalEdges());
    }

    @Test
    @DisplayName("Test 9: Leaf Service with no outgoing dependencies (Transaction Database ID 8)")
    void testServiceWithNoDependencies() {
        mockStandardGraph();
        when(serviceRepository.findById(8L)).thenReturn(Optional.of(mockServices.get(7)));

        ServiceImpactDto impact = graphService.findDirectAndIndirectAffected(8L);

        assertEquals(0, impact.getDirectlyAffectedServices().size());
        assertEquals(0, impact.getIndirectlyAffectedServices().size());
        assertEquals(0, impact.getTotalAffectedServices());
    }

    @Test
    @DisplayName("Test 10: Invalid Service ID throws ResourceNotFoundException")
    void testInvalidServiceIdThrows() {
        when(serviceRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> graphService.runBFS(999L));
        assertThrows(ResourceNotFoundException.class, () -> graphService.runDFS(999L));
        assertThrows(ResourceNotFoundException.class, () -> graphService.findDirectAndIndirectAffected(999L));
    }
}
