package com.changeguard.service;

import com.changeguard.dto.RiskAnalysisRequest;
import com.changeguard.dto.RiskAnalysisResult;
import com.changeguard.dto.WhatIfSimulationResponse;
import com.changeguard.dto.recommendation.*;
import com.changeguard.exception.ResourceNotFoundException;
import com.changeguard.exception.ValidationException;
import com.changeguard.model.Change;
import com.changeguard.model.Incident;
import com.changeguard.model.RiskAnalysisHistory;
import com.changeguard.model.ServiceEntity;
import com.changeguard.model.enums.ChangeType;
import com.changeguard.model.enums.Criticality;
import com.changeguard.model.enums.RecommendationType;
import com.changeguard.repository.ChangeRepository;
import com.changeguard.repository.IncidentRepository;
import com.changeguard.repository.RiskAnalysisHistoryRepository;
import com.changeguard.repository.ServiceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Phase 13 Service: Intelligent Change Recommendation & Decision Support Engine.
 *
 * Extends pre-deployment risk estimation with transparent, explainable recommendations
 * for how engineering teams and Change Advisory Boards (CAB) should safely handle releases.
 *
 * CRITICAL GUARDRAIL: ChangeGuard provides DECISION SUPPORT ONLY.
 * It never automatically deploys, rejects, approves, or rolls back changes.
 */
@Service
@Transactional(readOnly = true)
public class RecommendationService {

    private static final Logger log = LoggerFactory.getLogger(RecommendationService.class);

    private final RiskAnalysisService riskAnalysisService;
    private final ServiceRepository serviceRepository;
    private final ChangeRepository changeRepository;
    private final IncidentRepository incidentRepository;
    private final RiskAnalysisHistoryRepository historyRepository;
    private final WhatIfSimulationService whatIfSimulationService;

    public RecommendationService(RiskAnalysisService riskAnalysisService,
                                 ServiceRepository serviceRepository,
                                 ChangeRepository changeRepository,
                                 IncidentRepository incidentRepository,
                                 RiskAnalysisHistoryRepository historyRepository,
                                 WhatIfSimulationService whatIfSimulationService) {
        this.riskAnalysisService = riskAnalysisService;
        this.serviceRepository = serviceRepository;
        this.changeRepository = changeRepository;
        this.incidentRepository = incidentRepository;
        this.historyRepository = historyRepository;
        this.whatIfSimulationService = whatIfSimulationService;
    }

    /**
     * Generates intelligent decision-support recommendations for a proposed change.
     */
    public RecommendationResponseDto analyzeRecommendations(RecommendationRequestDto request) {
        if (request == null || request.getServiceId() == null) {
            throw new ValidationException("serviceId is required for recommendation analysis");
        }

        ServiceEntity service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + request.getServiceId()));

        // 1. Consume existing Risk Analysis Engine (deterministic rules + blast radius + ML inference)
        RiskAnalysisRequest riskRequest = request.toRiskAnalysisRequest();
        RiskAnalysisResult riskResult = riskAnalysisService.analyzeRisk(riskRequest);

        // 2. Query historical changes & incidents for empirical similarity evidence
        HistoricalSimilarityDto historicalEvidence = computeHistoricalSimilarity(service, request.getChangeType());

        // 3. Process optional What-If simulation if provided
        String simulationNotice = null;
        if (request.getWhatIfSimulation() != null) {
            try {
                WhatIfSimulationResponse simResponse = whatIfSimulationService.simulate(request.getWhatIfSimulation());
                simulationNotice = String.format("What-If Simulation evaluated: Baseline blast radius %.1f shifted to %.1f (delta: %+.1f). Newly affected services: %s",
                        simResponse.getCurrentState().getBlastRadiusScore(),
                        simResponse.getSimulatedState().getBlastRadiusScore(),
                        simResponse.getComparison().getBlastRadiusScoreDelta(),
                        simResponse.getComparison().getNewlyAffectedServices().isEmpty() ? "None" : simResponse.getComparison().getNewlyAffectedServices().toString());
            } catch (Exception e) {
                log.warn("What-If simulation evaluation skipped: {}", e.getMessage());
            }
        }

        // 4. Generate Explainable Decision-Support Action Recommendations
        List<RecommendationActionDto> actions = generateRecommendations(service, riskResult, historicalEvidence, request);

        // 5. Build Unified Response
        RecommendationResponseDto response = new RecommendationResponseDto();
        response.setServiceId(service.getId());
        response.setServiceName(service.getName());
        response.setServiceCriticality(service.getCriticality() != null ? service.getCriticality().name() : "MEDIUM");
        response.setChangeType(request.getChangeType());
        response.setRiskScore(riskResult.getRiskScore());
        response.setRiskPercentage(riskResult.getRiskPercentage());
        response.setRiskLevel(riskResult.getRiskLevel());
        response.setBlastRadiusScore(riskResult.getBlastRadiusScore());
        response.setAffectedServicesCount(riskResult.getTotalAffectedServices());
        response.setCriticalServicesAffectedCount(riskResult.getCriticalServicesAffectedCount());
        response.setDependencyDepth(riskResult.getMaxDependencyDepth());

        if (riskResult.getMlPrediction() != null) {
            response.setMlFailureProbability(riskResult.getMlPrediction().getFailureProbability());
            response.setMlPrediction(riskResult.getMlPrediction().getPrediction());
        }
        response.setMlStatus(riskResult.getMlStatus() != null ? riskResult.getMlStatus().name() : "UNAVAILABLE");

        response.setRecommendations(actions);
        response.setHistoricalEvidence(historicalEvidence);
        response.setSimulationComparisonNotice(simulationNotice);
        response.setDataSupportLevel(determineDataSupportLevel(historicalEvidence, riskResult));

        return response;
    }

    /**
     * Recommends actions for an existing recorded change by ID.
     */
    public RecommendationResponseDto analyzeRecommendationsForChange(Long changeId) {
        Change change = changeRepository.findById(changeId)
                .orElseThrow(() -> new ResourceNotFoundException("Change record not found with id: " + changeId));

        RecommendationRequestDto req = new RecommendationRequestDto(
                change.getService().getId(),
                change.getChangeType().name(),
                change.getOldVersion(),
                change.getNewVersion(),
                change.getComplexity(),
                change.getDescription()
        );

        return analyzeRecommendations(req);
    }

    /**
     * Core Rule-Based Recommendation Decision Rules.
     * Evaluates deterministic risk level, ML probability, blast radius, Tier-1 critical exposure, and historical incident patterns.
     */
    private List<RecommendationActionDto> generateRecommendations(ServiceEntity service,
                                                                  RiskAnalysisResult risk,
                                                                  HistoricalSimilarityDto history,
                                                                  RecommendationRequestDto request) {
        List<RecommendationActionDto> actions = new ArrayList<>();
        List<String> affectedList = risk.getBlastRadius() != null ? risk.getBlastRadius().getAllAffectedServices() : Collections.emptyList();
        List<String> criticalList = risk.getBlastRadius() != null ? risk.getBlastRadius().getCriticalAffectedServices() : Collections.emptyList();

        Double mlProb = risk.getMlPrediction() != null ? risk.getMlPrediction().getFailureProbability() : null;
        boolean mlHighProb = mlProb != null && mlProb >= 0.65;
        boolean isCriticalService = service.getCriticality() == Criticality.CRITICAL;
        String changeTypeStr = request.getChangeType() != null ? request.getChangeType().toUpperCase() : "VERSION_UPDATE";

        // 1. Rollout & Staging Strategy
        if ("CRITICAL".equalsIgnoreCase(risk.getRiskLevel()) || isCriticalService || risk.getCriticalServicesAffectedCount() >= 2) {
            actions.add(new RecommendationActionDto(
                    RecommendationType.STAGED_ROLLOUT,
                    "Enforce Staged Blue-Green Deployment with Synthetic Smoke Gates",
                    "CRITICAL",
                    String.format("Calculated risk score is %d%% and release exposes %d Tier-1 critical banking service(s) (%s). Direct in-place upgrades present unacceptably high outage potential.",
                            risk.getRiskPercentage(), risk.getCriticalServicesAffectedCount(), criticalList.isEmpty() ? service.getName() : criticalList.toString()),
                    "Deploy in an isolated parallel Blue-Green environment. Route 5% synthetic test transactions for 30 minutes. Require explicit Change Advisory Board (CAB) sign-off prior to traffic cutover.",
                    List.of(
                            "Tier-1 criticality of " + service.getName(),
                            risk.getCriticalServicesAffectedCount() + " critical downstream service(s) in blast radius",
                            mlHighProb ? "Model-predicted failure probability elevated at " + Math.round(mlProb * 100) + "%" : "Deterministic rule threshold exceeded"
                    ),
                    criticalList.isEmpty() ? List.of(service.getName()) : criticalList
            ));
        } else if ("HIGH".equalsIgnoreCase(risk.getRiskLevel()) || mlHighProb) {
            actions.add(new RecommendationActionDto(
                    RecommendationType.CANARY_ROLLOUT,
                    "Execute Phased Canary Rollout with Automated Metric Gates",
                    "HIGH",
                    String.format("High systemic risk detected (Score: %d%%). Downstream impact cascades across %d dependency layer(s).",
                            risk.getRiskPercentage(), risk.getMaxDependencyDepth()),
                    "Deploy candidate version to 10% canary traffic. Configure automated rollback triggers if error rate on downstream dependencies exceeds 0.5% during the first 45 minutes.",
                    List.of(
                            "Cascading depth of " + risk.getMaxDependencyDepth() + " layers",
                            mlProb != null ? "ML Model predicts elevated incident probability (" + Math.round(mlProb * 100) + "%)" : "High structural blast radius"
                    ),
                    affectedList
            ));
        } else if ("MEDIUM".equalsIgnoreCase(risk.getRiskLevel())) {
            actions.add(new RecommendationActionDto(
                    RecommendationType.CANARY_ROLLOUT,
                    "Consider Standard Canary Verification Window",
                    "MEDIUM",
                    "Moderate blast radius identified across " + risk.getTotalAffectedServices() + " downstream service(s).",
                    "Route initial traffic through a 15-minute canary observation window during off-peak volume before complete deployment.",
                    List.of("Moderate dependency count of " + risk.getTotalAffectedServices()),
                    affectedList
            ));
        } else {
            actions.add(new RecommendationActionDto(
                    RecommendationType.STANDARD_DEPLOYMENT,
                    "Proceed with Standard CI/CD Automated Deployment",
                    "LOW",
                    "Localized blast radius with minimal downstream dependency reach and low failure probability.",
                    "Execute standard automated pipeline deployment with routine post-deployment health check verification.",
                    List.of("Low risk score of " + risk.getRiskPercentage() + "%", "Zero Tier-1 critical downstream exposures"),
                    affectedList
            ));
        }

        // 2. Critical Service Monitoring
        if (risk.getCriticalServicesAffectedCount() > 0) {
            actions.add(new RecommendationActionDto(
                    RecommendationType.CRITICAL_SERVICE_MONITORING,
                    "Establish Dedicated Health & Latency Telemetry on Critical Downstream Services",
                    "HIGH",
                    String.format("Release propagates downstream into %d Tier-1 critical service(s): %s. An unhandled exception or latency spike could compromise core banking transactions.",
                            risk.getCriticalServicesAffectedCount(), criticalList.toString()),
                    "Arm Prometheus / OpenTelemetry alerts on p99 latency and HTTP 5xx error ratios for: " + criticalList.toString(),
                    List.of(
                            "Direct or indirect dependency on critical services: " + criticalList.toString(),
                            "Blast radius score rated at " + risk.getBlastRadiusScore() + "/100"
                    ),
                    criticalList
            ));
        }

        // 3. Rollback Preparation
        if ("HIGH".equalsIgnoreCase(risk.getRiskLevel()) || "CRITICAL".equalsIgnoreCase(risk.getRiskLevel())) {
            actions.add(new RecommendationActionDto(
                    RecommendationType.ROLLBACK_PREPARATION,
                    "Prepare and Validate Immediate Rollback Runbook",
                    "HIGH",
                    "Given the high blast radius, any unexpected failure must be reversible in under 5 minutes to satisfy regulatory banking SLA compliance.",
                    "Verify that previous container artifacts are warm in the artifact registry and that any database schema migrations are backwards-compatible (expand-and-contract pattern).",
                    List.of("Regulatory SLA compliance requirement", "Max dependency propagation depth of " + risk.getMaxDependencyDepth()),
                    affectedList
            ));
        }

        // 4. Change-Type Specific Technical Reviews
        if (changeTypeStr.contains("DATABASE")) {
            actions.add(new RecommendationActionDto(
                    RecommendationType.DATABASE_REVIEW,
                    "Perform Database Migration Locking & Query Plan Audit",
                    "HIGH",
                    "Database schema migrations pose severe table-locking risks and connection pool exhaustion across interconnected services.",
                    "Inspect DDL scripts for non-concurrent index additions, exclusive table locks, or long-running transactions. Test migration on pre-production staging with production-sized dataset volume.",
                    List.of("DATABASE_CHANGE type identified", "Potential lock contention on Transaction Database"),
                    List.of("Transaction Database", service.getName())
            ));
        } else if (changeTypeStr.contains("API")) {
            actions.add(new RecommendationActionDto(
                    RecommendationType.DEPENDENCY_REVIEW,
                    "Execute Contract & Backward-Compatibility Verification",
                    "HIGH",
                    "API signature or payload revisions risk breaking serialization or schema validation on downstream consumers.",
                    "Execute Pact consumer-driven contract test suites against all " + risk.getTotalAffectedServices() + " downstream consumers prior to merge.",
                    List.of("API_CHANGE modification type", "Affects " + risk.getTotalAffectedServices() + " client services"),
                    affectedList
            ));
        } else if (changeTypeStr.contains("SECURITY") || changeTypeStr.contains("AUTH")) {
            actions.add(new RecommendationActionDto(
                    RecommendationType.SECURITY_REVIEW,
                    "Validate Token Expiry, mTLS Handshakes, and Cache Synchronization",
                    "HIGH",
                    "Security, OAuth2, or token cache modifications risk triggering mass 401 Unauthorized loops across all client gateways.",
                    "Verify token cache TTL parity across cluster instances and ensure backward support for in-flight tokens during key rotation.",
                    List.of("SECURITY_CHANGE modification type", "Authentication critical path"),
                    List.of("Authentication Service", "API Gateway")
            ));
        }

        // 5. Historical Incident Evidence Alert
        if (history != null && history.getIncidentChangesCount() > 0) {
            actions.add(new RecommendationActionDto(
                    RecommendationType.HISTORICAL_REVIEW,
                    "Review Past Incident Post-Mortems for " + service.getName(),
                    history.getHistoricalIncidentRate() >= 0.40 ? "HIGH" : "MEDIUM",
                    String.format("Empirical analysis indicates %d of %d similar previous changes on this service resulted in production incidents (%.1f%% historical failure rate).",
                            history.getIncidentChangesCount(), history.getSimilarChangesCount(), history.getHistoricalIncidentRate() * 100),
                    "Verify that the change address known root causes from past post-mortems: " + (history.getPastIncidentsRootCauses().isEmpty() ? "Check incident logs" : history.getPastIncidentsRootCauses().get(0)),
                    List.of(
                            "Historical failure frequency of " + Math.round(history.getHistoricalIncidentRate() * 100) + "%",
                            history.getIncidentChangesCount() + " past incident(s) logged in database"
                    ),
                    List.of(service.getName())
            ));
        }

        // 6. Observability & Tracing Recommendation
        if (risk.getMaxDependencyDepth() >= 3) {
            actions.add(new RecommendationActionDto(
                    RecommendationType.OBSERVABILITY_CHECK,
                    "Verify Distributed Trace Context Propagation across " + risk.getMaxDependencyDepth() + " Tiers",
                    "MEDIUM",
                    "Deep multi-tier dependency chains make root-cause isolation difficult during cascading degradation.",
                    "Ensure W3C traceparent headers are properly propagated through all outbound RPC/REST clients on " + service.getName() + " to preserve end-to-end distributed trace visibility.",
                    List.of("Deep dependency traversal of " + risk.getMaxDependencyDepth() + " tiers"),
                    affectedList
            ));
        }

        return actions;
    }

    /**
     * Gathers actual empirical evidence from previously recorded changes and incidents.
     */
    private HistoricalSimilarityDto computeHistoricalSimilarity(ServiceEntity service, String changeTypeStr) {
        List<Change> serviceChanges = changeRepository.findByService(service);
        if (serviceChanges.isEmpty()) {
            return HistoricalSimilarityDto.insufficientData("No previous change records logged for " + service.getName());
        }

        ChangeType parsedType = null;
        try {
            if (changeTypeStr != null) {
                parsedType = ChangeType.valueOf(changeTypeStr.toUpperCase());
            }
        } catch (Exception ignored) {
        }

        List<Change> similar = new ArrayList<>();
        for (Change c : serviceChanges) {
            if (parsedType == null || c.getChangeType() == parsedType) {
                similar.add(c);
            }
        }
        if (similar.isEmpty()) {
            similar = serviceChanges; // Fall back to all changes on this service
        }

        int incidentCount = 0;
        List<String> rootCauses = new ArrayList<>();
        for (Change c : similar) {
            List<Incident> incidents = incidentRepository.findByChange(c);
            for (Incident inc : incidents) {
                if (Boolean.TRUE.equals(inc.getFailure())) {
                    incidentCount++;
                    if (inc.getRootCause() != null && !inc.getRootCause().isBlank()) {
                        rootCauses.add(inc.getRootCause());
                    }
                }
            }
        }

        double rate = similar.isEmpty() ? 0.0 : (double) incidentCount / (double) similar.size();
        String summary = String.format("Found %d similar change record(s) on %s (%d incident(s) logged, %.1f%% failure rate).",
                similar.size(), service.getName(), incidentCount, rate * 100);

        return new HistoricalSimilarityDto(
                "AVAILABLE",
                similar.size(),
                incidentCount,
                round(rate),
                summary,
                rootCauses
        );
    }

    private String determineDataSupportLevel(HistoricalSimilarityDto history, RiskAnalysisResult risk) {
        boolean hasHistory = history != null && "AVAILABLE".equalsIgnoreCase(history.getStatus()) && history.getSimilarChangesCount() >= 3;
        boolean hasML = risk.getMlPrediction() != null;

        if (hasHistory && hasML) {
            return "HIGH_DATA_SUPPORT";
        } else if (hasHistory || hasML) {
            return "MODERATE_DATA_SUPPORT";
        } else {
            return "LIMITED_DATA_SUPPORT";
        }
    }

    private static double round(double val) {
        return Math.round(val * 10000.0) / 10000.0;
    }
}
