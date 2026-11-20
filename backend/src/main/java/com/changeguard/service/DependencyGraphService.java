package com.changeguard.service;

import com.changeguard.dto.*;
import com.changeguard.exception.ResourceNotFoundException;
import com.changeguard.model.Dependency;
import com.changeguard.model.ServiceEntity;
import com.changeguard.model.enums.Criticality;
import com.changeguard.repository.DependencyRepository;
import com.changeguard.repository.ServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Dedicated Graph Service for Banking Microservice Dependencies.
 * Provides in-memory directed graph construction, BFS, DFS,
 * direct vs indirect impact categorization, path finding, and cycle handling.
 * 
 * Time Complexity: O(V + E) for BFS/DFS traversal.
 * Space Complexity: O(V + E) for adjacency list representation.
 */
@Service
@Transactional(readOnly = true)
public class DependencyGraphService {

    private final DependencyRepository dependencyRepository;
    private final ServiceRepository serviceRepository;

    public DependencyGraphService(DependencyRepository dependencyRepository, ServiceRepository serviceRepository) {
        this.dependencyRepository = dependencyRepository;
        this.serviceRepository = serviceRepository;
    }

    /**
     * Builds and returns the complete directed dependency graph (nodes & edges)
     * dynamically queried from PostgreSQL.
     */
    public GraphResponseDto getCompleteGraph() {
        List<ServiceEntity> services = serviceRepository.findAll();
        List<Dependency> dependencies = dependencyRepository.findAll();

        List<GraphNodeDto> nodes = services.stream()
                .map(s -> new GraphNodeDto(s.getId(), s.getName(), s.getType(), s.getCriticality(), s.getVersion(), s.getStatus()))
                .collect(Collectors.toList());

        List<GraphEdgeDto> edges = dependencies.stream()
                .map(d -> new GraphEdgeDto(
                        d.getId(),
                        d.getSourceService().getId(),
                        d.getTargetService().getId(),
                        d.getSourceService().getName(),
                        d.getTargetService().getName(),
                        d.getDependencyType(),
                        d.getCriticality()
                ))
                .collect(Collectors.toList());

        return new GraphResponseDto(nodes, edges);
    }

    /**
     * Categorizes downstream affected systems into DIRECT and INDIRECT dependencies.
     * Direct: immediate downstream targets connected by an outgoing edge.
     * Indirect: reachable downstream systems via 2 or more hops.
     */
    public ServiceImpactDto findDirectAndIndirectAffected(Long serviceId) {
        ServiceEntity startService = findServiceOrThrow(serviceId);

        Map<Long, ServiceEntity> serviceMap = loadServiceMap();
        Map<Long, List<Long>> adjacencyList = buildAdjacencyList();

        // 1. Direct Dependencies (Immediate neighbors)
        List<Long> directNeighborIds = adjacencyList.getOrDefault(serviceId, Collections.emptyList());
        Set<Long> directSet = new LinkedHashSet<>(directNeighborIds);

        // 2. BFS Traversal to collect all reachable downstream services
        Set<Long> allReachable = new LinkedHashSet<>();
        Queue<Long> queue = new LinkedList<>(directNeighborIds);
        allReachable.addAll(directNeighborIds);

        while (!queue.isEmpty()) {
            Long currentId = queue.poll();
            List<Long> neighbors = adjacencyList.getOrDefault(currentId, Collections.emptyList());

            for (Long neighborId : neighbors) {
                // Avoid cycles and self-reference to the starting service
                if (!neighborId.equals(serviceId) && !allReachable.contains(neighborId)) {
                    allReachable.add(neighborId);
                    queue.add(neighborId);
                }
            }
        }

        // 3. Indirect Dependencies = All Reachable minus Direct Neighbors
        Set<Long> indirectSet = new LinkedHashSet<>(allReachable);
        indirectSet.removeAll(directSet);

        // Map IDs to DTO representations
        ServiceRefDto startingDto = toRefDto(startService);
        List<ServiceRefDto> directDtos = directSet.stream()
                .map(serviceMap::get)
                .filter(Objects::nonNull)
                .map(this::toRefDto)
                .collect(Collectors.toList());

        List<ServiceRefDto> indirectDtos = indirectSet.stream()
                .map(serviceMap::get)
                .filter(Objects::nonNull)
                .map(this::toRefDto)
                .collect(Collectors.toList());

        return new ServiceImpactDto(startingDto, directDtos, indirectDtos);
    }

    /**
     * Breadth-First Search (BFS) Traversal.
     * Traverses downstream microservices level by level using Queue & visited Set.
     * Time Complexity: O(V + E)
     */
    public TraversalResultDto runBFS(Long serviceId) {
        ServiceEntity startService = findServiceOrThrow(serviceId);

        Map<Long, ServiceEntity> serviceMap = loadServiceMap();
        Map<Long, List<Long>> adjacencyList = buildAdjacencyList();

        Queue<Long> queue = new LinkedList<>();
        Set<Long> visited = new HashSet<>();
        List<String> visitedOrder = new ArrayList<>();

        queue.add(serviceId);
        visited.add(serviceId);
        visitedOrder.add(startService.getName());

        while (!queue.isEmpty()) {
            Long currentId = queue.poll();
            List<Long> neighbors = adjacencyList.getOrDefault(currentId, Collections.emptyList());

            for (Long neighborId : neighbors) {
                if (!visited.contains(neighborId)) {
                    visited.add(neighborId);
                    queue.add(neighborId);
                    ServiceEntity neighbor = serviceMap.get(neighborId);
                    if (neighbor != null) {
                        visitedOrder.add(neighbor.getName());
                    }
                }
            }
        }

        return new TraversalResultDto("BFS", startService.getName(), serviceId, visitedOrder);
    }

    /**
     * Depth-First Search (DFS) Traversal.
     * Traverses downstream microservices branch by branch recursively with cycle detection.
     * Time Complexity: O(V + E)
     */
    public TraversalResultDto runDFS(Long serviceId) {
        ServiceEntity startService = findServiceOrThrow(serviceId);

        Map<Long, ServiceEntity> serviceMap = loadServiceMap();
        Map<Long, List<Long>> adjacencyList = buildAdjacencyList();

        Set<Long> visited = new HashSet<>();
        List<String> visitedOrder = new ArrayList<>();

        dfsRecursive(serviceId, adjacencyList, serviceMap, visited, visitedOrder);

        return new TraversalResultDto("DFS", startService.getName(), serviceId, visitedOrder);
    }

    private void dfsRecursive(Long currentId, Map<Long, List<Long>> adj, Map<Long, ServiceEntity> serviceMap,
                              Set<Long> visited, List<String> visitedOrder) {
        visited.add(currentId);
        ServiceEntity current = serviceMap.get(currentId);
        if (current != null) {
            visitedOrder.add(current.getName());
        }

        List<Long> neighbors = adj.getOrDefault(currentId, Collections.emptyList());
        for (Long neighborId : neighbors) {
            if (!visited.contains(neighborId)) {
                dfsRecursive(neighborId, adj, serviceMap, visited, visitedOrder);
            }
        }
    }

    /**
     * Computes all unique dependency paths starting from serviceId.
     * Uses backtracking with a path-visited set to prevent infinite loops in cyclic graphs.
     * Includes configurable limits (maxDepth=15, maxPaths=50) to prevent combinatorial explosion.
     */
    public PathsResultDto findDependencyPaths(Long serviceId) {
        return findDependencyPaths(serviceId, 15, 50);
    }

    public PathsResultDto findDependencyPaths(Long serviceId, int maxDepth, int maxPaths) {
        ServiceEntity startService = findServiceOrThrow(serviceId);

        Map<Long, ServiceEntity> serviceMap = loadServiceMap();
        Map<Long, List<Long>> adjacencyList = buildAdjacencyList();

        List<List<String>> allPaths = new ArrayList<>();
        List<String> currentPath = new ArrayList<>();
        Set<Long> pathVisited = new HashSet<>();

        currentPath.add(startService.getName());
        pathVisited.add(serviceId);

        dfsPathBacktracking(serviceId, adjacencyList, serviceMap, pathVisited, currentPath, allPaths, maxDepth, maxPaths);

        return new PathsResultDto(startService.getName(), serviceId, allPaths);
    }

    private void dfsPathBacktracking(Long currentId, Map<Long, List<Long>> adj, Map<Long, ServiceEntity> serviceMap,
                                     Set<Long> pathVisited, List<String> currentPath, List<List<String>> allPaths,
                                     int maxDepth, int maxPaths) {
        if (allPaths.size() >= maxPaths || currentPath.size() >= maxDepth) {
            return;
        }

        List<Long> neighbors = adj.getOrDefault(currentId, Collections.emptyList());

        // A path ends when reaching a leaf service (no outgoing edges) or all neighbors are in current cycle
        boolean extended = false;
        for (Long neighborId : neighbors) {
            if (!pathVisited.contains(neighborId)) {
                extended = true;
                ServiceEntity neighbor = serviceMap.get(neighborId);
                if (neighbor != null) {
                    pathVisited.add(neighborId);
                    currentPath.add(neighbor.getName());

                    dfsPathBacktracking(neighborId, adj, serviceMap, pathVisited, currentPath, allPaths, maxDepth, maxPaths);

                    currentPath.remove(currentPath.size() - 1);
                    pathVisited.remove(neighborId);
                }
            }
        }

        // If no neighbors could be extended and the path has at least one hop, record path
        if (!extended && currentPath.size() > 1) {
            allPaths.add(new ArrayList<>(currentPath));
        }
    }

    /**
     * Analyzes reachable services to extract Tier-1 CRITICAL services affected.
     */
    public CriticalImpactDto getCriticalImpact(Long serviceId) {
        ServiceEntity startService = findServiceOrThrow(serviceId);
        TraversalResultDto bfsResult = runBFS(serviceId);

        Map<String, ServiceEntity> nameMap = serviceRepository.findAll().stream()
                .collect(Collectors.toMap(ServiceEntity::getName, s -> s));

        List<String> criticalNames = new ArrayList<>();
        // Exclude the starting service itself from downstream impact
        for (String serviceName : bfsResult.getVisitedServices()) {
            if (!serviceName.equalsIgnoreCase(startService.getName())) {
                ServiceEntity s = nameMap.get(serviceName);
                if (s != null && s.getCriticality() == Criticality.CRITICAL) {
                    criticalNames.add(s.getName());
                }
            }
        }

        int affectedCount = Math.max(0, bfsResult.getTotalVisited() - 1);

        return new CriticalImpactDto(
                startService.getName(),
                serviceId,
                affectedCount,
                criticalNames.size(),
                criticalNames
        );
    }

    // --- Helper Methods ---

    private ServiceEntity findServiceOrThrow(Long serviceId) {
        return serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + serviceId));
    }

    private Map<Long, ServiceEntity> loadServiceMap() {
        return serviceRepository.findAll().stream()
                .collect(Collectors.toMap(ServiceEntity::getId, s -> s));
    }

    /**
     * Builds an in-memory adjacency list from database dependencies in O(E).
     * Direction: Source -> Target (caller -> dependent system).
     */
    private Map<Long, List<Long>> buildAdjacencyList() {
        List<Dependency> dependencies = dependencyRepository.findAll();
        Map<Long, List<Long>> adj = new HashMap<>();

        for (Dependency d : dependencies) {
            Long src = d.getSourceService().getId();
            Long tgt = d.getTargetService().getId();
            adj.computeIfAbsent(src, k -> new ArrayList<>()).add(tgt);
        }
        return adj;
    }

    private ServiceRefDto toRefDto(ServiceEntity s) {
        return new ServiceRefDto(s.getId(), s.getName(), s.getType(), s.getCriticality(), s.getVersion());
    }
}
