package com.changeguard.controller;

import com.changeguard.dto.*;
import com.changeguard.model.Dependency;
import com.changeguard.service.DependencyGraphService;
import com.changeguard.service.DependencyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dependencies")
@CrossOrigin(origins = "*")
public class DependencyController {

    private final DependencyService dependencyService;
    private final DependencyGraphService graphService;

    public DependencyController(DependencyService dependencyService, DependencyGraphService graphService) {
        this.dependencyService = dependencyService;
        this.graphService = graphService;
    }

    /**
     * Phase 2 Endpoint: Get raw dependency records
     */
    @GetMapping
    public ResponseEntity<List<Dependency>> getAllDependencies() {
        return ResponseEntity.ok(dependencyService.getAllDependencies());
    }

    /**
     * Phase 2 Endpoint: Get dependencies by source service
     */
    @GetMapping("/source/{sourceId}")
    public ResponseEntity<List<Dependency>> getDependenciesBySource(@PathVariable Long sourceId) {
        return ResponseEntity.ok(dependencyService.getDependenciesBySourceService(sourceId));
    }

    /**
     * Phase 3 Endpoint: Get complete in-memory directed dependency graph (nodes and edges)
     */
    @GetMapping("/graph")
    public ResponseEntity<GraphResponseDto> getCompleteGraph() {
        return ResponseEntity.ok(graphService.getCompleteGraph());
    }

    /**
     * Phase 3 Endpoint: Get categorized direct vs indirect dependencies for a service
     */
    @GetMapping("/service/{serviceId}")
    public ResponseEntity<ServiceImpactDto> getServiceImpact(@PathVariable Long serviceId) {
        return ResponseEntity.ok(graphService.findDirectAndIndirectAffected(serviceId));
    }

    /**
     * Phase 3 Endpoint: Run Breadth-First Search (BFS) starting from serviceId
     */
    @GetMapping("/service/{serviceId}/bfs")
    public ResponseEntity<TraversalResultDto> runBFS(@PathVariable Long serviceId) {
        return ResponseEntity.ok(graphService.runBFS(serviceId));
    }

    /**
     * Phase 3 Endpoint: Run Depth-First Search (DFS) starting from serviceId
     */
    @GetMapping("/service/{serviceId}/dfs")
    public ResponseEntity<TraversalResultDto> runDFS(@PathVariable Long serviceId) {
        return ResponseEntity.ok(graphService.runDFS(serviceId));
    }

    /**
     * Phase 3 Endpoint: Compute all distinct dependency paths from serviceId
     */
    @GetMapping("/service/{serviceId}/paths")
    public ResponseEntity<PathsResultDto> getDependencyPaths(
            @PathVariable Long serviceId,
            @RequestParam(defaultValue = "15") int maxDepth,
            @RequestParam(defaultValue = "50") int maxPaths) {
        return ResponseEntity.ok(graphService.findDependencyPaths(serviceId, maxDepth, maxPaths));
    }

    /**
     * Phase 3 Endpoint: Calculate critical-services impact analysis
     */
    @GetMapping("/service/{serviceId}/critical-impact")
    public ResponseEntity<CriticalImpactDto> getCriticalImpact(@PathVariable Long serviceId) {
        return ResponseEntity.ok(graphService.getCriticalImpact(serviceId));
    }
}
