package com.changeguard.service.ml;

import com.changeguard.dto.BlastRadiusResultDto;
import com.changeguard.dto.RiskAnalysisRequest;
import com.changeguard.dto.ml.MLPredictionRequest;
import com.changeguard.model.ServiceEntity;
import com.changeguard.model.enums.Criticality;
import org.springframework.stereotype.Component;

/**
 * Phase 7 Component: ML Feature Builder
 * 
 * Derives and transforms real banking backend data and topology into the exact
 * 11 features expected by the Phase 6/7 Machine Learning model.
 */
@Component
public class MLFeatureBuilder {

    /**
     * Constructs an MLPredictionRequest from live backend context.
     */
    public MLPredictionRequest buildFeatures(
            RiskAnalysisRequest request,
            ServiceEntity service,
            BlastRadiusResultDto blastRadius,
            double normalizedComplexity,
            double historicalFailureRate,
            int previousIncidentsCount) {

        // 1. change_complexity (0.0 to 1.0)
        double complexity = Math.min(1.0, Math.max(0.0, normalizedComplexity));

        // 2. dependency_count (0 to 15+)
        int dependencyCount = Math.max(0, blastRadius.getTotalAffectedServices());

        // 3. dependency_depth (0 to 8+)
        int dependencyDepth = Math.max(0, blastRadius.getMaxDependencyDepth());

        // 4. criticality_score (0.0 to 1.0)
        double criticalityScore = mapCriticalityToScore(service.getCriticality());

        // 5. historical_failure_rate (0.0 to 1.0)
        double histFailureRate = Math.min(1.0, Math.max(0.0, historicalFailureRate));

        // 6. change_type (e.g. VERSION_UPDATE, CONFIG_CHANGE, DATABASE_CHANGE)
        String changeType = request.getChangeType() != null ? request.getChangeType().trim().toUpperCase() : "VERSION_UPDATE";

        // 7. blast_radius_score (0.0 to 100.0)
        double blastScore = Math.min(100.0, Math.max(0.0, blastRadius.getBlastRadiusScore()));

        // 8. critical_services_affected (0+)
        int criticalAffected = Math.max(0, blastRadius.getCriticalServicesAffectedCount());

        // 9. previous_incidents (0+)
        int previousIncidents = Math.max(0, previousIncidentsCount);

        // 10. service_age (simulated based on service ID / established history, e.g. 12 to 120 months)
        int serviceAge = estimateServiceAge(service);

        // 11. version_change_size (numerical delta magnitude)
        double versionDelta = calculateVersionDelta(request.getOldVersion(), request.getNewVersion(), changeType);

        return new MLPredictionRequest(
                round(complexity, 2),
                dependencyCount,
                dependencyDepth,
                round(criticalityScore, 2),
                round(histFailureRate, 3),
                changeType,
                round(blastScore, 1),
                criticalAffected,
                previousIncidents,
                serviceAge,
                round(versionDelta, 2)
        );
    }

    private double mapCriticalityToScore(Criticality criticality) {
        if (criticality == null) return 0.50;
        switch (criticality) {
            case CRITICAL:
                return 1.00;
            case HIGH:
                return 0.75;
            case MEDIUM:
                return 0.50;
            case LOW:
            default:
                return 0.25;
        }
    }

    private int estimateServiceAge(ServiceEntity service) {
        // Core services (Payment, Core Banking, Auth) are older; newer client apps are younger
        if (service.getId() != null) {
            long id = service.getId();
            if (id == 5L || id == 7L || id == 8L) return 48; // Payment, Core Banking, DB
            if (id == 2L || id == 3L || id == 4L) return 36; // Gateway, Auth, Account
            if (id == 6L || id == 10L) return 24;            // Fraud, Reconciliation
            if (id == 1L || id == 9L || id == 11L) return 18;// Customer App, Notification, Reporting
        }
        return 36; // Default 3 years
    }

    /**
     * Calculates the delta magnitude of the version change.
     * Examples:
     * - "2.0.0" -> "3.0.0" = 1.00 (Major update)
     * - "2.1.0" -> "2.2.0" = 0.10 (Minor update)
     * - "2.1.0" -> "2.1.1" = 0.02 (Patch update)
     */
    public double calculateVersionDelta(String oldVersion, String newVersion, String changeType) {
        if (oldVersion == null || newVersion == null) {
            if ("DATABASE_CHANGE".equalsIgnoreCase(changeType) || "INFRASTRUCTURE_CHANGE".equalsIgnoreCase(changeType)) {
                return 1.00;
            }
            return 0.50;
        }

        try {
            String[] v1Parts = oldVersion.trim().split("[.-]");
            String[] v2Parts = newVersion.trim().split("[.-]");

            int major1 = v1Parts.length > 0 ? Integer.parseInt(v1Parts[0].replaceAll("\\D+", "")) : 1;
            int major2 = v2Parts.length > 0 ? Integer.parseInt(v2Parts[0].replaceAll("\\D+", "")) : 1;

            if (major1 != major2) {
                return Math.max(1.0, Math.abs(major2 - major1) * 1.0);
            }

            int minor1 = v1Parts.length > 1 ? Integer.parseInt(v1Parts[1].replaceAll("\\D+", "")) : 0;
            int minor2 = v2Parts.length > 1 ? Integer.parseInt(v2Parts[1].replaceAll("\\D+", "")) : 0;

            if (minor1 != minor2) {
                return Math.max(0.10, Math.abs(minor2 - minor1) * 0.10);
            }

            int patch1 = v1Parts.length > 2 ? Integer.parseInt(v1Parts[2].replaceAll("\\D+", "")) : 0;
            int patch2 = v2Parts.length > 2 ? Integer.parseInt(v2Parts[2].replaceAll("\\D+", "")) : 0;

            if (patch1 != patch2) {
                return 0.02;
            }

            return 0.01;
        } catch (Exception ex) {
            return 0.50;
        }
    }

    private double round(double val, int decimals) {
        double factor = Math.pow(10, decimals);
        return Math.round(val * factor) / factor;
    }
}
