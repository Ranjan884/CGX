package com.changeguard.service;

import com.changeguard.dto.BlastRadiusResponseDto;
import com.changeguard.model.Dependency;
import com.changeguard.model.ServiceEntity;
import com.changeguard.model.enums.Criticality;
import com.changeguard.repository.DependencyRepository;
import com.changeguard.repository.ServiceRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class BlastRadiusEngine {

    private final DependencyRepository dependencyRepository;
    private final ServiceRepository serviceRepository;

    public BlastRadiusEngine(DependencyRepository dependencyRepository, ServiceRepository serviceRepository) {
        this.dependencyRepository = dependencyRepository;
        this.serviceRepository = serviceRepository;
    }

    /**
     * Traverses the microservice dependency graph starting from targetServiceId using BFS.
     * Identifies all downstream affected services and computes all unique dependency paths.
     */
    public BlastRadiusResponseDto calculateBlastRadius(Long targetServiceId) {
        ServiceEntity startService = serviceRepository.findById(targetServiceId)
                .orElseThrow(() -> new IllegalArgumentException("Service not found with id: " + targetServiceId));

        List<ServiceEntity> allServices = serviceRepository.findAll();
        List<Dependency> allDependencies = dependencyRepository.findAll();

        // Build adjacency map: serviceId -> List of downstream target service IDs
        Map<Long, List<ServiceEntity>> adjacencyList = new HashMap<>();
        Map<Long, ServiceEntity> serviceMap = new HashMap<>();
        for (ServiceEntity s : allServices) {
            adjacencyList.put(s.getId(), new ArrayList<>());
            serviceMap.put(s.getId(), s);
        }
        for (Dependency d : allDependencies) {
            if (adjacencyList.containsKey(d.getSourceService().getId())) {
                adjacencyList.get(d.getSourceService().getId()).add(d.getTargetService());
            }
        }

        // BFS Traversal
        Queue<Long> queue = new LinkedList<>();
        Set<Long> visited = new HashSet<>();
        List<String> affectedServiceNames = new ArrayList<>();
        int criticalServicesCount = 0;

        queue.add(targetServiceId);
        visited.add(targetServiceId);

        while (!queue.isEmpty()) {
            Long currentId = queue.poll();
            List<ServiceEntity> neighbors = adjacencyList.getOrDefault(currentId, Collections.emptyList());

            for (ServiceEntity neighbor : neighbors) {
                if (!visited.contains(neighbor.getId())) {
                    visited.add(neighbor.getId());
                    queue.add(neighbor.getId());
                    affectedServiceNames.add(neighbor.getName());

                    if (neighbor.getCriticality() == Criticality.CRITICAL) {
                        criticalServicesCount++;
                    }
                }
            }
        }

        // Find all dependency paths from startService to all downstream endpoints
        List<List<String>> allPaths = new ArrayList<>();
        List<String> currentPath = new ArrayList<>();
        currentPath.add(startService.getName());
        findPathsDFS(startService.getId(), adjacencyList, new HashSet<>(), currentPath, allPaths);

        double totalCount = Math.max(1, allServices.size());
        double blastRadiusRatio = Math.round((affectedServiceNames.size() / totalCount) * 100.0) / 100.0;

        return new BlastRadiusResponseDto(
                startService.getName(),
                affectedServiceNames,
                affectedServiceNames.size(),
                criticalServicesCount,
                blastRadiusRatio,
                allPaths
        );
    }

    private void findPathsDFS(Long currentId, Map<Long, List<ServiceEntity>> adj, 
                              Set<Long> pathVisited, List<String> currentPath, List<List<String>> allPaths) {
        pathVisited.add(currentId);
        List<ServiceEntity> neighbors = adj.getOrDefault(currentId, Collections.emptyList());

        if (neighbors.isEmpty() && currentPath.size() > 1) {
            allPaths.add(new ArrayList<>(currentPath));
        } else {
            for (ServiceEntity neighbor : neighbors) {
                if (!pathVisited.contains(neighbor.getId())) {
                    currentPath.add(neighbor.getName());
                    findPathsDFS(neighbor.getId(), adj, pathVisited, currentPath, allPaths);
                    currentPath.remove(currentPath.size() - 1);
                }
            }
        }
        pathVisited.remove(currentId);
    }
}
