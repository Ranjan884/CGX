package com.changeguard.service;

import com.changeguard.dto.BlastRadiusResponseDto;
import com.changeguard.dto.RiskPredictionResponseDto;
import com.changeguard.model.ServiceEntity;
import com.changeguard.model.enums.ChangeType;
import com.changeguard.model.enums.Criticality;
import com.changeguard.repository.ChangeRepository;
import com.changeguard.repository.IncidentRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RuleBasedRiskEngine {

    private final BlastRadiusEngine blastRadiusEngine;
    private final IncidentRepository incidentRepository;
    private final ChangeRepository changeRepository;

    public RuleBasedRiskEngine(BlastRadiusEngine blastRadiusEngine,
                               IncidentRepository incidentRepository,
                               ChangeRepository changeRepository) {
        this.blastRadiusEngine = blastRadiusEngine;
        this.incidentRepository = incidentRepository;
        this.changeRepository = changeRepository;
    }

    public RiskPredictionResponseDto evaluateRisk(ServiceEntity service, ChangeType changeType, int complexity) {
        BlastRadiusResponseDto blast = blastRadiusEngine.calculateBlastRadius(service.getId());

        // 1. Criticality Weight (0.0 to 0.25)
        double critScore = switch (service.getCriticality()) {
            case CRITICAL -> 0.25;
            case HIGH -> 0.18;
            case MEDIUM -> 0.10;
            case LOW -> 0.04;
        };

        // 2. Complexity Score (0.0 to 0.25)
        double complexityScore = (complexity / 10.0) * 0.25;

        // 3. Blast Radius & Downstream Critical Services (0.0 to 0.25)
        double blastScore = (blast.getBlastRadiusRatio() * 0.15) + (Math.min(blast.getCriticalServicesAffected(), 3) / 3.0 * 0.10);

        // 4. Change Type Impact (0.0 to 0.15)
        double changeTypeScore = switch (changeType) {
            case DATABASE_CHANGE -> 0.15;
            case API_CHANGE -> 0.13;
            case INFRASTRUCTURE_CHANGE -> 0.12;
            case ML_MODEL_CHANGE -> 0.10;
            case LIBRARY_UPDATE, DEPENDENCY_CHANGE -> 0.06;
            case CONFIG_CHANGE -> 0.04;
            case SECURITY_CHANGE -> 0.14;
            case VERSION_UPDATE -> 0.07;
        };

        // 5. Historical Failure Score (0.0 to 0.10)
        long failureCount = incidentRepository.findByFailure(true).stream()
                .filter(inc -> inc.getChange().getService().getId().equals(service.getId()))
                .count();
        double historyScore = Math.min(failureCount * 0.04, 0.10);

        double totalRisk = Math.min(1.0, Math.max(0.05, critScore + complexityScore + blastScore + changeTypeScore + historyScore));
        totalRisk = Math.round(totalRisk * 100.0) / 100.0;

        // Categorize Risk Level
        String riskLevel;
        if (totalRisk >= 0.80) {
            riskLevel = "CRITICAL";
        } else if (totalRisk >= 0.60) {
            riskLevel = "HIGH";
        } else if (totalRisk >= 0.30) {
            riskLevel = "MEDIUM";
        } else {
            riskLevel = "LOW";
        }

        // Collect Risk Factors
        List<String> riskFactors = new ArrayList<>();
        if (service.getCriticality() == Criticality.CRITICAL || service.getCriticality() == Criticality.HIGH) {
            riskFactors.add(service.getName() + " is tier-1 " + service.getCriticality() + " banking infrastructure");
        }
        if (complexity >= 7) {
            riskFactors.add("Change complexity is high (" + complexity + "/10)");
        }
        if (blast.getAffectedCount() > 0) {
            riskFactors.add("Downstream impact touches " + blast.getAffectedCount() + " services (" + blast.getCriticalServicesAffected() + " critical)");
        }
        if (changeType == ChangeType.DATABASE_CHANGE || changeType == ChangeType.API_CHANGE) {
            riskFactors.add(changeType.name() + " carries high schema or contract incompatibility potential");
        }
        if (failureCount > 0) {
            riskFactors.add(failureCount + " previous incident(s) recorded on this service");
        }
        if (riskFactors.isEmpty()) {
            riskFactors.add("Standard low-impact configuration or patch change with isolated dependencies");
        }

        // Formulate clear, evidence-based Explanation
        String explanation = String.format(
                "Risk is %s (probability %.0f%%) because %s has %s criticality, the proposed change (%s) has complexity %d/10, " +
                "%d downstream service(s) are in the blast radius (%d critical), and %d historical failure(s) were observed.",
                riskLevel,
                totalRisk * 100.0,
                service.getName(),
                service.getCriticality(),
                changeType,
                complexity,
                blast.getAffectedCount(),
                blast.getCriticalServicesAffected(),
                failureCount
        );

        // Suggested Testing / Rollout Strategy
        String recommendedRollout = switch (riskLevel) {
            case "CRITICAL" -> "BLUE_GREEN: Require Blue-Green isolated environment deployment, automated rollback hooks, dual-write validation, and mandatory senior CAB sign-off.";
            case "HIGH" -> "CANARY: Implement staged Canary rollout (5% -> 25% -> 100% over 4 hours) with strict synthetic transaction tracing and integration testing.";
            case "MEDIUM" -> "CONTROLLED: Deploy during scheduled maintenance window with smoke tests and dependency health checks.";
            default -> "NORMAL: Standard CI/CD automated pipeline deployment with unit/integration test suite pass.";
        };

        return new RiskPredictionResponseDto(
                service.getName(),
                totalRisk,
                riskLevel,
                "RuleBasedEngine-v1.0",
                riskFactors,
                explanation,
                recommendedRollout,
                blast
        );
    }
}
