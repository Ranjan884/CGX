package com.changeguard.model.enums;

/**
 * Phase 13: Standardized Decision-Support Recommendation Types
 * These represent advisory suggestions for engineering teams and Change Advisory Boards (CAB).
 * ChangeGuard NEVER automatically executes these actions.
 */
public enum RecommendationType {
    STANDARD_DEPLOYMENT,
    ADDITIONAL_TESTING,
    INTEGRATION_TESTING,
    PERFORMANCE_TESTING,
    CRITICAL_SERVICE_MONITORING,
    CANARY_ROLLOUT,
    STAGED_ROLLOUT,
    ROLLBACK_PREPARATION,
    DEPENDENCY_REVIEW,
    DATABASE_REVIEW,
    SECURITY_REVIEW,
    OBSERVABILITY_CHECK,
    HISTORICAL_REVIEW
}
