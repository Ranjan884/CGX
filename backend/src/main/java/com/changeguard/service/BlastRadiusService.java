package com.changeguard.service;

import com.changeguard.dto.BlastRadiusResultDto;
import com.changeguard.dto.ChangeBlastRadiusDto;
import com.changeguard.dto.PathsResultDto;
import com.changeguard.dto.ServiceImpactDto;
import com.changeguard.dto.ServiceRefDto;
import com.changeguard.exception.ResourceNotFoundException;
import com.changeguard.model.Change;
import com.changeguard.model.Dependency;
import com.changeguard.model.ServiceEntity;
import com.changeguard.model.enums.Criticality;
import com.changeguard.repository.ChangeRepository;
import com.changeguard.repository.DependencyRepository;
import com.changeguard.repository.ServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * ChangeGuard Phase 4: Blast-Radius Engine
 * 
 * Determines the systemic blast radius of a technical change across banking microservices.
 * Computes:
 * - Direct vs Indirect downstream dependencies
 * - Dependency depth for each affected service and maximum depth
 * - Tier-1 Critical services impacted
 * - Dependency paths explaining the blast radius
 * - Normalized Blast-Radius Score (0 - 100)
 * 
 * Time Complexity: O(V + E) using in-memory graph traversal.
 */
@Service
@Transactional(readOnly = true)
public class BlastRadiusService {

    private final ServiceRepository serviceRepository;
    private final DependencyRepository dependencyRepository;
    private final ChangeRepository changeRepository;
    private final DependencyGraphService dependencyGraphService;

    public BlastRadiusService(ServiceRepository serviceRepository,
                              DependencyRepository dependencyRepository,
                              ChangeRepository changeRepository,
                              DependencyGraphService dependencyGraphService) {
        this.serviceRepository = serviceRepository;
        this.dependencyRepository = dependencyRepository;
        this.changeRepository = changeRepository;
        this.dependencyGraphService = dependencyGraphService;
    }

    /**
     * Analyzes the complete blast radius for a given service by its ID.
     */
    public BlastRadiusResultDto analyzeBlastRadius(Long serviceId) {
        ServiceEntity startingService = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + serviceId));

        List<ServiceEntity> allServices = serviceRepository.findAll();
        List<Dependency> allDependencies = dependencyRepository.findAll();

        // 1. Build Adjacency List for Breadth-First Depth Calculation
        Map<Long, List<Long>> adjacencyList = new HashMap<>();
        Map<Long, ServiceEntity> serviceMap = new HashMap<>();
        for (ServiceEntity s : allServices) {
            adjacencyList.put(s.getId(), new ArrayList<>());
            serviceMap.put(s.getId(), s);
        }
        for (Dependency d : allDependencies) {
            if (adjacencyList.containsKey(d.getSourceService().getId())) {
                adjacencyList.get(d.getSourceService().getId()).add(d.getTargetService().getId());
            }
        }

        // 2. BFS Traversal to calculate exact shortest dependency depth per affected service
        Queue<Long> queue = new LinkedList<>();
        Map<Long, Integer> depthMap = new LinkedHashMap<>();

        queue.add(serviceId);
        depthMap.put(serviceId, 0);

        while (!queue.isEmpty()) {
            Long currentId = queue.poll();
            int currentDepth = depthMap.get(currentId);
            List<Long> neighbors = adjacencyList.getOrDefault(currentId, Collections.emptyList());

            for (Long neighborId : neighbors) {
                // Shortest hop depth via BFS; skip already discovered nodes to prevent cycles
                if (!depthMap.containsKey(neighborId)) {
                    depthMap.put(neighborId, currentDepth + 1);
                    queue.add(neighborId);
                }
            }
        }

        // 3. Separate Direct vs Indirect Impact
        List<Long> directNeighborIds = adjacencyList.getOrDefault(serviceId, Collections.emptyList());
        Set<Long> directIdSet = new HashSet<>(directNeighborIds);

        List<String> directlyAffected = new ArrayList<>();
        List<String> indirectlyAffected = new ArrayList<>();
        List<String> allAffected = new ArrayList<>();
        List<String> criticalAffected = new ArrayList<>();
        Map<String, Integer> serviceDepths = new LinkedHashMap<>();
        int maxDepth = 0;

        for (Map.Entry<Long, Integer> entry : depthMap.entrySet()) {
            Long currentId = entry.getKey();
            int depth = entry.getValue();

            // Skip the starting service itself from downstream affected sets
            if (!currentId.equals(serviceId)) {
                ServiceEntity s = serviceMap.get(currentId);
                if (s != null) {
                    allAffected.add(s.getName());
                    serviceDepths.put(s.getName(), depth);
                    if (depth > maxDepth) {
                        maxDepth = depth;
                    }

                    if (directIdSet.contains(currentId)) {
                        directlyAffected.add(s.getName());
                    } else {
                        indirectlyAffected.add(s.getName());
                    }

                    if (s.getCriticality() == Criticality.CRITICAL) {
                        criticalAffected.add(s.getName());
                    }
                }
            }
        }

        // 4. Retrieve Dependency Paths using Phase 3 engine (maxDepth=15, maxPaths=50)
        PathsResultDto pathsResult = dependencyGraphService.findDependencyPaths(serviceId, 15, 50);
        List<List<String>> dependencyPaths = pathsResult.getPaths();

        // 5. Calculate Normalized Blast-Radius Score (0.0 to 100.0)
        double blastRadiusScore = calculateBlastRadiusScore(
                allAffected.size(),
                allServices.size(),
                criticalAffected.size(),
                maxDepth,
                dependencyPaths.size()
        );

        ServiceRefDto startingDto = new ServiceRefDto(
                startingService.getId(),
                startingService.getName(),
                startingService.getType(),
                startingService.getCriticality(),
                startingService.getVersion()
        );

        return new BlastRadiusResultDto(
                startingDto,
                directlyAffected,
                indirectlyAffected,
                allAffected,
                criticalAffected,
                criticalAffected.size(),
                allAffected.size(),
                maxDepth,
                serviceDepths,
                dependencyPaths,
                blastRadiusScore
        );
    }

    /**
     * Change-based Blast-Radius Analysis.
     * Correlates an existing Change entity with its target microservice blast radius.
     */
    public ChangeBlastRadiusDto analyzeBlastRadiusForChange(Long changeId) {
        Change change = changeRepository.findById(changeId)
                .orElseThrow(() -> new ResourceNotFoundException("Change record not found with id: " + changeId));

        BlastRadiusResultDto blastRadius = analyzeBlastRadius(change.getService().getId());

        return new ChangeBlastRadiusDto(
                change.getId(),
                change.getService().getName(),
                change.getService().getId(),
                change.getChangeType(),
                change.getDescription(),
                change.getOldVersion(),
                change.getNewVersion(),
                change.getComplexity(),
                blastRadius
        );
    }

    /**
     * Calculates a normalized Blast-Radius Score between 0.0 and 100.0.
     * 
     * NOTE: This score is a project-specific analytical heuristic and not an
     * official banking regulatory standard.
     * 
     * Formula Components:
     * 1. Breadth Spread Factor (max 40 pts): (affectedCount / totalServices) * 40
     * 2. Critical Impact Factor (max 35 pts): min(35.0, criticalAffectedCount * 17.5)
     * 3. Propagation Depth Factor (max 15 pts): min(15.0, maxDepth * 5.0)
     * 4. Path Fan-Out Factor (max 10 pts): min(10.0, totalPaths * 3.0)
     * 
     * Total = min(100.0, max(0.0, sum(components)))
     */
    public double calculateBlastRadiusScore(int totalAffected, int totalServices, int criticalAffected, int maxDepth, int totalPaths) {
        if (totalAffected == 0 || totalServices <= 1) {
            return 0.0;
        }

        // 1. Breadth Spread Factor (max 40 points)
        double spreadRatio = (double) totalAffected / (double) totalServices;
        double spreadScore = spreadRatio * 40.0;

        // 2. Critical Impact Factor (max 35 points) - Tier-1 critical systems
        double criticalScore = Math.min(35.0, criticalAffected * 17.5);

        // 3. Propagation Depth Factor (max 15 points) - cascading distance
        double depthScore = Math.min(15.0, maxDepth * 5.0);

        // 4. Path Fan-Out Factor (max 10 points) - parallel path risk
        double pathScore = Math.min(10.0, totalPaths * 3.0);

        double rawScore = spreadScore + criticalScore + depthScore + pathScore;
        double finalScore = Math.min(100.0, Math.max(0.0, rawScore));

        return Math.round(finalScore * 10.0) / 10.0;
    }
}
