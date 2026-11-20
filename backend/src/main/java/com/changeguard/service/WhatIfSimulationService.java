package com.changeguard.service;

import com.changeguard.config.RiskConfiguration;
import com.changeguard.dto.*;
import com.changeguard.dto.ml.MLPredictionRequest;
import com.changeguard.dto.ml.MLPredictionResponse;
import com.changeguard.dto.ml.MLStatus;
import com.changeguard.exception.ResourceNotFoundException;
import com.changeguard.exception.ValidationException;
import com.changeguard.model.Change;
import com.changeguard.model.Dependency;
import com.changeguard.model.Incident;
import com.changeguard.model.ServiceEntity;
import com.changeguard.model.enums.ChangeType;
import com.changeguard.model.enums.Criticality;
import com.changeguard.repository.ChangeRepository;
import com.changeguard.repository.DependencyRepository;
import com.changeguard.repository.IncidentRepository;
import com.changeguard.repository.ServiceRepository;
import com.changeguard.service.ml.MLFeatureBuilder;
import com.changeguard.service.ml.MLServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Phase 9: What-If Change Simulator Service
 *
 * Provides completely isolated in-memory change impact simulation.
 * Calculates what could happen before committing changes:
 * - Version updates
 * - Complexity shifts
 * - Addition / removal of architectural dependencies
 * - Change type variations
 *
 * Compares CURRENT STATE vs. SIMULATED STATE:
 * - Direct & indirect downstream affected services
 * - Critical services impacted
 * - Max dependency depth
 * - Dependency paths
 * - Blast-radius score (0 - 100)
 * - Rule-based risk score & qualitative level
 * - ML failure probability & prediction
 * - Detailed delta diff (newly affected, no longer affected, risk shifts)
 *
 * SAFETY GUARANTEE: Never writes, updates, or deletes real database records.
 */
@Service
@Transactional(readOnly = true)
public class WhatIfSimulationService {

    private static final Logger log = LoggerFactory.getLogger(WhatIfSimulationService.class);

    private final ServiceRepository serviceRepository;
    private final DependencyRepository dependencyRepository;
    private final ChangeRepository changeRepository;
    private final IncidentRepository incidentRepository;
    private final BlastRadiusService blastRadiusService;
    private final RiskConfiguration riskConfig;
    private final MLFeatureBuilder mlFeatureBuilder;
    private final MLServiceClient mlServiceClient;

    private static final Map<ChangeType, Double> DEFAULT_CHANGE_TYPE_WEIGHTS = new EnumMap<>(ChangeType.class);

    static {
        DEFAULT_CHANGE_TYPE_WEIGHTS.put(ChangeType.CONFIG_CHANGE, 0.40);
        DEFAULT_CHANGE_TYPE_WEIGHTS.put(ChangeType.VERSION_UPDATE, 0.50);
        DEFAULT_CHANGE_TYPE_WEIGHTS.put(ChangeType.LIBRARY_UPDATE, 0.50);
        DEFAULT_CHANGE_TYPE_WEIGHTS.put(ChangeType.API_CHANGE, 0.60);
        DEFAULT_CHANGE_TYPE_WEIGHTS.put(ChangeType.SECURITY_CHANGE, 0.65);
        DEFAULT_CHANGE_TYPE_WEIGHTS.put(ChangeType.ML_MODEL_CHANGE, 0.65);
        DEFAULT_CHANGE_TYPE_WEIGHTS.put(ChangeType.DEPENDENCY_CHANGE, 0.70);
        DEFAULT_CHANGE_TYPE_WEIGHTS.put(ChangeType.INFRASTRUCTURE_CHANGE, 0.75);
        DEFAULT_CHANGE_TYPE_WEIGHTS.put(ChangeType.DATABASE_CHANGE, 0.80);
    }

    public WhatIfSimulationService(ServiceRepository serviceRepository,
                                  DependencyRepository dependencyRepository,
                                  ChangeRepository changeRepository,
                                  IncidentRepository incidentRepository,
                                  BlastRadiusService blastRadiusService,
                                  RiskConfiguration riskConfig,
                                  MLFeatureBuilder mlFeatureBuilder,
                                  MLServiceClient mlServiceClient) {
        this.serviceRepository = serviceRepository;
        this.dependencyRepository = dependencyRepository;
        this.changeRepository = changeRepository;
        this.incidentRepository = incidentRepository;
        this.blastRadiusService = blastRadiusService;
        this.riskConfig = riskConfig;
        this.mlFeatureBuilder = mlFeatureBuilder;
        this.mlServiceClient = mlServiceClient;
    }

    /**
     * Executes What-If Change Simulation in an isolated in-memory sandbox.
     */
    public WhatIfSimulationResponse simulate(WhatIfSimulationRequest request) {
        if (request == null) {
            throw new ValidationException("Simulation request body is required");
        }
        if (request.getServiceId() == null) {
            throw new ValidationException("serviceId is required for simulation");
        }

        // 1. Fetch target service and baseline topology from DB (read-only)
        ServiceEntity targetService = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + request.getServiceId()));

        List<ServiceEntity> allServices = serviceRepository.findAll();
        List<Dependency> allDependencies = dependencyRepository.findAll();

        Map<Long, ServiceEntity> serviceMap = allServices.stream()
                .collect(Collectors.toMap(ServiceEntity::getId, s -> s));

        // 2. Build In-Memory Baseline Graph
        Map<Long, List<Long>> currentAdjacency = new HashMap<>();
        for (ServiceEntity s : allServices) {
            currentAdjacency.put(s.getId(), new ArrayList<>());
        }
        for (Dependency d : allDependencies) {
            Long srcId = d.getSourceService().getId();
            Long tgtId = d.getTargetService().getId();
            if (currentAdjacency.containsKey(srcId)) {
                currentAdjacency.get(srcId).add(tgtId);
            }
        }

        // 3. Build In-Memory Simulated Copy
        Map<Long, List<Long>> simulatedAdjacency = new HashMap<>();
        for (Map.Entry<Long, List<Long>> entry : currentAdjacency.entrySet()) {
            simulatedAdjacency.put(entry.getKey(), new ArrayList<>(entry.getValue()));
        }

        // Apply hypothetical dependency additions and removals
        if (request.getDependencyChanges() != null) {
            for (DependencyChangeDto change : request.getDependencyChanges()) {
                if (change == null || change.getAction() == null) continue;
                Long src = change.getSourceServiceId();
                Long tgt = change.getTargetServiceId();

                if (src == null || tgt == null || !serviceMap.containsKey(src) || !serviceMap.containsKey(tgt)) {
                    continue;
                }

                if ("ADD".equalsIgnoreCase(change.getAction().trim())) {
                    List<Long> targets = simulatedAdjacency.computeIfAbsent(src, k -> new ArrayList<>());
                    if (!targets.contains(tgt)) {
                        targets.add(tgt);
                    }
                } else if ("REMOVE".equalsIgnoreCase(change.getAction().trim())) {
                    List<Long> targets = simulatedAdjacency.get(src);
                    if (targets != null) {
                        targets.remove(tgt);
                    }
                }
            }
        }

        // Determine baseline vs simulated parameters
        String baselineVersion = (request.getOldVersion() != null && !request.getOldVersion().isBlank())
                ? request.getOldVersion().trim()
                : targetService.getVersion();

        String simulatedVersion = (request.getNewVersion() != null && !request.getNewVersion().isBlank())
                ? request.getNewVersion().trim()
                : baselineVersion;

        String changeTypeStr = (request.getChangeType() != null && !request.getChangeType().isBlank())
                ? request.getChangeType().trim()
                : "VERSION_UPDATE";

        Object simulatedComplexity = request.getComplexity() != null ? request.getComplexity() : "HIGH";
        Object baselineComplexity = "MEDIUM"; // Standard baseline reference for pre-change state

        // 4. Evaluate Current State
        SimulationStateDto currentState = evaluateState(
                targetService,
                currentAdjacency,
                serviceMap,
                allServices.size(),
                baselineVersion,
                baselineVersion,
                "CONFIG_CHANGE",
                baselineComplexity,
                request.getDescription()
        );

        // 5. Evaluate Simulated State
        SimulationStateDto simulatedState = evaluateState(
                targetService,
                simulatedAdjacency,
                serviceMap,
                allServices.size(),
                baselineVersion,
                simulatedVersion,
                changeTypeStr,
                simulatedComplexity,
                request.getDescription()
        );

        // 6. Compute Comprehensive Comparison & Delta
        WhatIfComparisonDto comparison = computeComparison(currentState, simulatedState, targetService);

        return new WhatIfSimulationResponse(request, currentState, simulatedState, comparison);
    }

    /**
     * Evaluates a complete graph state (BFS, DFS paths, rule-based risk, ML prediction) in-memory.
     */
    private SimulationStateDto evaluateState(
            ServiceEntity targetService,
            Map<Long, List<Long>> adjacency,
            Map<Long, ServiceEntity> serviceMap,
            int totalServicesCount,
            String oldVersion,
            String newVersion,
            String changeTypeStr,
            Object complexityObj,
            String description) {

        Long serviceId = targetService.getId();
        ChangeType changeType = parseChangeType(changeTypeStr);
        double normalizedComplexity = parseComplexity(complexityObj);

        // 1. BFS Traversal for exact shortest hop depth
        Queue<Long> queue = new LinkedList<>();
        Map<Long, Integer> depthMap = new LinkedHashMap<>();

        queue.add(serviceId);
        depthMap.put(serviceId, 0);

        while (!queue.isEmpty()) {
            Long currentId = queue.poll();
            int currentDepth = depthMap.get(currentId);
            List<Long> neighbors = adjacency.getOrDefault(currentId, Collections.emptyList());

            for (Long neighborId : neighbors) {
                if (!depthMap.containsKey(neighborId)) {
                    depthMap.put(neighborId, currentDepth + 1);
                    queue.add(neighborId);
                }
            }
        }

        // 2. Direct vs Indirect Impact categorization
        List<Long> directNeighborIds = adjacency.getOrDefault(serviceId, Collections.emptyList());
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

        // 3. DFS Dependency Paths (maxDepth=15, maxPaths=50)
        List<List<String>> dependencyPaths = findPathsDFS(serviceId, adjacency, serviceMap, 15, 50);

        // 4. Blast-Radius Score (0 - 100)
        double blastRadiusScore = blastRadiusService.calculateBlastRadiusScore(
                allAffected.size(),
                totalServicesCount,
                criticalAffected.size(),
                maxDepth,
                dependencyPaths.size()
        );

        // 5. Rule-Based Risk Factors
        RiskConfiguration.Weights weights = riskConfig.getWeights();
        Map<String, RiskFactorDetailDto> factorMap = new LinkedHashMap<>();

        // Complexity
        double complexityContrib = normalizedComplexity * weights.getComplexity();
        factorMap.put("complexity", new RiskFactorDetailDto(
                "Change Complexity",
                complexityObj,
                round(normalizedComplexity, 4),
                weights.getComplexity(),
                round(complexityContrib, 4),
                describeComplexity(normalizedComplexity)
        ));

        // Dependency Count
        int maxDeps = Math.max(1, riskConfig.getDefaults().getMaxRelevantDependencies());
        double normalizedDeps = Math.min(1.0, (double) allAffected.size() / (double) maxDeps);
        double depsContrib = normalizedDeps * weights.getDependency();
        factorMap.put("dependencyCount", new RiskFactorDetailDto(
                "Dependency Count",
                allAffected.size(),
                round(normalizedDeps, 4),
                weights.getDependency(),
                round(depsContrib, 4),
                String.format("%d downstream service(s) affected", allAffected.size())
        ));

        // Dependency Depth
        int maxDepthConfig = Math.max(1, riskConfig.getDefaults().getMaxDepth());
        double normalizedDepth = Math.min(1.0, (double) maxDepth / (double) maxDepthConfig);
        double depthContrib = normalizedDepth * weights.getDepth();
        factorMap.put("dependencyDepth", new RiskFactorDetailDto(
                "Dependency Depth",
                maxDepth,
                round(normalizedDepth, 4),
                weights.getDepth(),
                round(depthContrib, 4),
                String.format("Impact reaches depth %d across topology", maxDepth)
        ));

        // Service Criticality
        double normalizedCrit = mapCriticalityToFactor(targetService.getCriticality());
        double critContrib = normalizedCrit * weights.getCriticality();
        factorMap.put("serviceCriticality", new RiskFactorDetailDto(
                "Service Criticality",
                targetService.getCriticality().name(),
                round(normalizedCrit, 4),
                weights.getCriticality(),
                round(critContrib, 4),
                String.format("Target service is tier-%s", targetService.getCriticality())
        ));

        // Historical Incident Rate
        HistoricalDataResult history = calculateHistoricalIncidentRate(targetService);
        double incidentContrib = history.failureRate * weights.getIncident();
        factorMap.put("historicalIncidents", new RiskFactorDetailDto(
                "Historical Failure Rate",
                history.hasSufficientData ? String.format("%d/%d failures", history.failedChanges, history.totalChanges) : "BASELINE",
                round(history.failureRate, 4),
                weights.getIncident(),
                round(incidentContrib, 4),
                history.description
        ));

        // Change Type
        double normalizedChangeType = DEFAULT_CHANGE_TYPE_WEIGHTS.getOrDefault(changeType, 0.50);
        double changeTypeContrib = normalizedChangeType * weights.getChangeType();
        factorMap.put("changeType", new RiskFactorDetailDto(
                "Change Type Impact",
                changeType.name(),
                round(normalizedChangeType, 4),
                weights.getChangeType(),
                round(changeTypeContrib, 4),
                String.format("%s carries technical weight of %.2f", changeType.name(), normalizedChangeType)
        ));

        // Critical Services Affected
        double normalizedCritAffected = Math.min(1.0, criticalAffected.size() * 0.50);
        double critAffectedContrib = normalizedCritAffected * weights.getCriticalService();
        factorMap.put("criticalServicesAffected", new RiskFactorDetailDto(
                "Critical Services Affected",
                criticalAffected.size(),
                round(normalizedCritAffected, 4),
                weights.getCriticalService(),
                round(critAffectedContrib, 4),
                String.format("%d Tier-1 critical service(s) exposed", criticalAffected.size())
        ));

        // Blast-Radius Score
        double normalizedBlast = Math.min(1.0, Math.max(0.0, blastRadiusScore / 100.0));
        double blastContrib = normalizedBlast * weights.getBlastRadius();
        factorMap.put("blastRadiusScore", new RiskFactorDetailDto(
                "Blast-Radius Score",
                blastRadiusScore,
                round(normalizedBlast, 4),
                weights.getBlastRadius(),
                round(blastContrib, 4),
                String.format("Calculated blast-radius score of %.1f/100", blastRadiusScore)
        ));

        // Total Risk Score
        double totalRisk = complexityContrib + depsContrib + depthContrib + critContrib +
                           incidentContrib + changeTypeContrib + critAffectedContrib + blastContrib;
        double finalRiskScore = Math.min(1.0, Math.max(0.05, totalRisk));
        finalRiskScore = round(finalRiskScore, 4);
        int riskPercentage = (int) Math.round(finalRiskScore * 100);
        String riskLevel = determineRiskLevel(finalRiskScore);

        String explanation = generateExplanation(targetService, changeType, finalRiskScore, riskLevel,
                allAffected.size(), criticalAffected, maxDepth, history);

        // 6. Build State DTO
        SimulationStateDto state = new SimulationStateDto();
        state.setServiceId(serviceId);
        state.setServiceName(targetService.getName());
        state.setVersion(newVersion);
        state.setChangeType(changeType.name());
        state.setComplexity(complexityObj);

        state.setBlastRadiusScore(blastRadiusScore);
        state.setTotalAffectedServices(allAffected.size());
        state.setCriticalServicesAffectedCount(criticalAffected.size());
        state.setMaxDependencyDepth(maxDepth);

        state.setDirectlyAffectedServices(directlyAffected);
        state.setIndirectlyAffectedServices(indirectlyAffected);
        state.setAllAffectedServices(allAffected);
        state.setCriticalServicesAffected(criticalAffected);
        state.setServiceDepths(serviceDepths);
        state.setDependencyPaths(dependencyPaths);

        state.setRuleBasedRiskScore(finalRiskScore);
        state.setRuleBasedRiskPercentage(riskPercentage);
        state.setRuleBasedRiskLevel(riskLevel);
        state.setRiskFactors(factorMap);
        state.setExplanation(explanation);

        // 7. Invoke ML Service for Inference
        try {
            BlastRadiusResultDto mockBlastDto = new BlastRadiusResultDto();
            mockBlastDto.setTotalAffectedServices(allAffected.size());
            mockBlastDto.setMaxDependencyDepth(maxDepth);
            mockBlastDto.setBlastRadiusScore(blastRadiusScore);
            mockBlastDto.setCriticalServicesAffectedCount(criticalAffected.size());

            RiskAnalysisRequest mockReq = new RiskAnalysisRequest(
                    serviceId,
                    changeType.name(),
                    oldVersion,
                    newVersion,
                    complexityObj,
                    description
            );

            MLPredictionRequest mlReq = mlFeatureBuilder.buildFeatures(
                    mockReq,
                    targetService,
                    mockBlastDto,
                    normalizedComplexity,
                    history.failureRate,
                    history.failedChanges
            );

            MLServiceClient.MLResult mlResult = mlServiceClient.predict(mlReq);
            state.setMlPrediction(mlResult.getResponse());
            state.setMlStatus(mlResult.getStatus());
        } catch (Exception ex) {
            log.warn("Simulation ML prediction failed gracefully: {}", ex.getMessage());
            state.setMlPrediction(null);
            state.setMlStatus(MLStatus.ERROR);
        }

        return state;
    }

    /**
     * Computes the delta diff and executive verdict between Current State and Simulated State.
     */
    private WhatIfComparisonDto computeComparison(
            SimulationStateDto current,
            SimulationStateDto simulated,
            ServiceEntity service) {

        WhatIfComparisonDto comp = new WhatIfComparisonDto();

        Set<String> currentAffectedSet = new LinkedHashSet<>(current.getAllAffectedServices());
        Set<String> simulatedAffectedSet = new LinkedHashSet<>(simulated.getAllAffectedServices());

        // Newly affected services
        List<String> newlyAffected = simulatedAffectedSet.stream()
                .filter(name -> !currentAffectedSet.contains(name))
                .collect(Collectors.toList());

        // No longer affected services
        List<String> noLongerAffected = currentAffectedSet.stream()
                .filter(name -> !simulatedAffectedSet.contains(name))
                .collect(Collectors.toList());

        // Newly critical services affected
        Set<String> currentCritSet = new HashSet<>(current.getCriticalServicesAffected());
        List<String> newlyCritical = simulated.getCriticalServicesAffected().stream()
                .filter(name -> !currentCritSet.contains(name))
                .collect(Collectors.toList());

        comp.setNewlyAffectedServices(newlyAffected);
        comp.setNoLongerAffectedServices(noLongerAffected);
        comp.setNewlyCriticalAffectedServices(newlyCritical);

        comp.setAffectedCountDelta(simulated.getTotalAffectedServices() - current.getTotalAffectedServices());
        comp.setCriticalAffectedDelta(simulated.getCriticalServicesAffectedCount() - current.getCriticalServicesAffectedCount());
        comp.setMaxDepthDelta(simulated.getMaxDependencyDepth() - current.getMaxDependencyDepth());

        comp.setBlastRadiusScoreDelta(round(simulated.getBlastRadiusScore() - current.getBlastRadiusScore(), 1));
        comp.setRiskScoreDelta(round(simulated.getRuleBasedRiskScore() - current.getRuleBasedRiskScore(), 4));
        comp.setRiskPercentageDelta(simulated.getRuleBasedRiskPercentage() - current.getRuleBasedRiskPercentage());

        comp.setCurrentRiskLevel(current.getRuleBasedRiskLevel());
        comp.setSimulatedRiskLevel(simulated.getRuleBasedRiskLevel());
        comp.setRiskLevelChanged(!current.getRuleBasedRiskLevel().equals(simulated.getRuleBasedRiskLevel()));

        if (simulated.getMlPrediction() != null && current.getMlPrediction() != null) {
            double delta = simulated.getMlPrediction().getFailureProbability() - current.getMlPrediction().getFailureProbability();
            comp.setMlProbabilityDelta(round(delta, 4));
        }

        // Generate narrative verdict
        String verdict = buildSimulationVerdict(current, simulated, comp, service);
        comp.setSimulationVerdict(verdict);

        return comp;
    }

    private String buildSimulationVerdict(
            SimulationStateDto current,
            SimulationStateDto simulated,
            WhatIfComparisonDto comp,
            ServiceEntity service) {

        StringBuilder sb = new StringBuilder();
        int pctDelta = comp.getRiskPercentageDelta();

        if (pctDelta > 0) {
            sb.append(String.format("SIMULATION WARNING: The proposed change to %s increases failure risk by +%d%% (from %d%% %s to %d%% %s). ",
                    service.getName(), pctDelta, current.getRuleBasedRiskPercentage(), current.getRuleBasedRiskLevel(),
                    simulated.getRuleBasedRiskPercentage(), simulated.getRuleBasedRiskLevel()));
        } else if (pctDelta < 0) {
            sb.append(String.format("SIMULATION FAVORABLE: The proposed modification reduces systemic failure risk by %d%% (from %d%% %s to %d%% %s). ",
                    Math.abs(pctDelta), current.getRuleBasedRiskPercentage(), current.getRuleBasedRiskLevel(),
                    simulated.getRuleBasedRiskPercentage(), simulated.getRuleBasedRiskLevel()));
        } else {
            sb.append(String.format("SIMULATION NEUTRAL: The proposed change maintains the current risk rating (%d%% %s). ",
                    current.getRuleBasedRiskPercentage(), current.getRuleBasedRiskLevel()));
        }

        if (!comp.getNewlyAffectedServices().isEmpty()) {
            sb.append(String.format("Expands blast radius with %d newly exposed downstream service(s): [%s]. ",
                    comp.getNewlyAffectedServices().size(), String.join(", ", comp.getNewlyAffectedServices())));
        }

        if (!comp.getNewlyCriticalAffectedServices().isEmpty()) {
            sb.append(String.format("CRITICAL ALERT: Exposes Tier-1 banking systems [%s] not previously in the failure path. ",
                    String.join(", ", comp.getNewlyCriticalAffectedServices())));
        }

        if (!comp.getNoLongerAffectedServices().isEmpty()) {
            sb.append(String.format("Decouples %d downstream service(s): [%s]. ",
                    comp.getNoLongerAffectedServices().size(), String.join(", ", comp.getNoLongerAffectedServices())));
        }

        if (simulated.getRuleBasedRiskLevel().equals("CRITICAL")) {
            sb.append("Recommended action: Requires Blue-Green deployment, isolated staging dry-run, and formal CAB sign-off.");
        } else if (simulated.getRuleBasedRiskLevel().equals("HIGH")) {
            sb.append("Recommended action: Implement phased Canary rollout with synthetic transaction tracing.");
        } else {
            sb.append("Recommended action: Eligible for automated deployment window with standard smoke testing.");
        }

        return sb.toString();
    }

    // --- Helper Graph & Parsing Algorithms ---

    private List<List<String>> findPathsDFS(
            Long serviceId,
            Map<Long, List<Long>> adjacency,
            Map<Long, ServiceEntity> serviceMap,
            int maxDepth,
            int maxPaths) {

        ServiceEntity start = serviceMap.get(serviceId);
        if (start == null) return Collections.emptyList();

        List<List<String>> allPaths = new ArrayList<>();
        List<String> currentPath = new ArrayList<>();
        Set<Long> pathVisited = new HashSet<>();

        currentPath.add(start.getName());
        pathVisited.add(serviceId);

        dfsPathBacktracking(serviceId, adjacency, serviceMap, pathVisited, currentPath, allPaths, maxDepth, maxPaths);

        return allPaths;
    }

    private void dfsPathBacktracking(
            Long currentId,
            Map<Long, List<Long>> adj,
            Map<Long, ServiceEntity> serviceMap,
            Set<Long> pathVisited,
            List<String> currentPath,
            List<List<String>> allPaths,
            int maxDepth,
            int maxPaths) {

        if (allPaths.size() >= maxPaths || currentPath.size() >= maxDepth) {
            return;
        }

        List<Long> neighbors = adj.getOrDefault(currentId, Collections.emptyList());
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

        if (!extended && currentPath.size() > 1) {
            allPaths.add(new ArrayList<>(currentPath));
        }
    }

    private ChangeType parseChangeType(String input) {
        if (input == null || input.trim().isEmpty()) {
            return ChangeType.VERSION_UPDATE;
        }
        try {
            return ChangeType.valueOf(input.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ChangeType.VERSION_UPDATE;
        }
    }

    private double parseComplexity(Object complexity) {
        if (complexity == null) return 0.50;
        if (complexity instanceof Number) {
            double val = ((Number) complexity).doubleValue();
            if (val <= 1.0) return Math.max(0.0, val);
            return Math.min(1.0, val / 10.0);
        }
        String str = complexity.toString().trim().toUpperCase();
        switch (str) {
            case "LOW": return 0.25;
            case "MEDIUM": case "MED": return 0.50;
            case "HIGH": return 0.75;
            case "VERY_HIGH": case "CRITICAL": return 1.00;
            default:
                try {
                    double num = Double.parseDouble(str);
                    return parseComplexity(num);
                } catch (Exception ex) {
                    return 0.50;
                }
        }
    }

    private double mapCriticalityToFactor(Criticality criticality) {
        if (criticality == null) return 0.50;
        switch (criticality) {
            case CRITICAL: return 1.00;
            case HIGH: return 0.75;
            case MEDIUM: return 0.50;
            case LOW: default: return 0.25;
        }
    }

    private String describeComplexity(double normalized) {
        if (normalized >= 0.90) return "Very High / Maximum technical complexity rating";
        if (normalized >= 0.70) return "High technical complexity rating";
        if (normalized >= 0.40) return "Moderate complexity rating";
        return "Low complexity routine change";
    }

    private String determineRiskLevel(double score) {
        RiskConfiguration.Thresholds t = riskConfig.getThresholds();
        if (score < t.getLow()) return "LOW";
        if (score < t.getMedium()) return "MEDIUM";
        if (score < t.getHigh()) return "HIGH";
        return "CRITICAL";
    }

    private static class HistoricalDataResult {
        boolean hasSufficientData;
        int totalChanges;
        int failedChanges;
        double failureRate;
        String description;
    }

    private HistoricalDataResult calculateHistoricalIncidentRate(ServiceEntity service) {
        HistoricalDataResult result = new HistoricalDataResult();
        List<Change> changes = changeRepository.findByService(service);

        if (changes == null || changes.isEmpty()) {
            result.hasSufficientData = false;
            result.totalChanges = 0;
            result.failedChanges = 0;
            result.failureRate = riskConfig.getDefaults().getHistoricalFailureRate();
            result.description = String.format("Baseline historical failure rate applied (%.2f)", result.failureRate);
            return result;
        }

        int failedCount = 0;
        for (Change c : changes) {
            List<Incident> incidents = incidentRepository.findByChange(c);
            if (incidents != null && incidents.stream().anyMatch(i -> Boolean.TRUE.equals(i.getFailure()))) {
                failedCount++;
            }
        }

        result.hasSufficientData = true;
        result.totalChanges = changes.size();
        result.failedChanges = failedCount;
        result.failureRate = (double) failedCount / (double) changes.size();
        result.description = String.format("%d failure(s) out of %d historical change(s)", failedCount, changes.size());
        return result;
    }

    private String generateExplanation(
            ServiceEntity service,
            ChangeType changeType,
            double riskScore,
            String riskLevel,
            int affectedCount,
            List<String> criticalAffected,
            int maxDepth,
            HistoricalDataResult history) {

        List<String> keyReasons = new ArrayList<>();
        if (service.getCriticality() == Criticality.CRITICAL || service.getCriticality() == Criticality.HIGH) {
            keyReasons.add(String.format("%s is tier-%s infrastructure", service.getName(), service.getCriticality()));
        }
        if (affectedCount >= 3) {
            keyReasons.add(String.format("impacts %d downstream services", affectedCount));
        }
        if (!criticalAffected.isEmpty()) {
            keyReasons.add(String.format("%d Tier-1 critical system(s) (%s) exposed", criticalAffected.size(), String.join(", ", criticalAffected)));
        }
        if (maxDepth >= 3) {
            keyReasons.add(String.format("downstream reach is %d tiers deep", maxDepth));
        }

        if (keyReasons.isEmpty()) {
            return String.format("The change is evaluated as %s risk (score: %.2f) with isolated impact.", riskLevel, riskScore);
        }

        return String.format("The %s is evaluated as %s risk (score: %.2f / %d%%) because %s.",
                changeType.name(), riskLevel, riskScore, (int) Math.round(riskScore * 100),
                String.join(", ", keyReasons));
    }

    private double round(double val, int decimals) {
        double factor = Math.pow(10, decimals);
        return Math.round(val * factor) / factor;
    }
}
