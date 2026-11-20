package com.changeguard.controller;

import com.changeguard.dto.recommendation.RecommendationRequestDto;
import com.changeguard.dto.recommendation.RecommendationResponseDto;
import com.changeguard.service.AuditLogService;
import com.changeguard.service.RecommendationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Phase 13 & 14 REST Controller: Intelligent Change Recommendation & Decision Support APIs with Audit Logging.
 */
@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final AuditLogService auditLogService;

    public RecommendationController(RecommendationService recommendationService, AuditLogService auditLogService) {
        this.recommendationService = recommendationService;
        this.auditLogService = auditLogService;
    }

    /**
     * POST /api/recommendations/analyze
     * Analyzes a proposed technical change and returns explainable advisory recommendations.
     */
    @PostMapping("/analyze")
    public ResponseEntity<RecommendationResponseDto> analyzeRecommendations(
            @RequestHeader(value = "X-User-Role", required = false, defaultValue = "ENGINEER") String userRole,
            @Valid @RequestBody RecommendationRequestDto request) {
        RecommendationResponseDto response = recommendationService.analyzeRecommendations(request);
        auditLogService.recordAudit(
                userRole,
                "RECOMMENDATION_ANALYSIS",
                "SERVICE",
                request.getServiceId(),
                "SUCCESS",
                String.format("Generated %d recommendations for %s on service ID %d",
                        response.getRecommendations() != null ? response.getRecommendations().size() : 0,
                        request.getChangeType(), request.getServiceId())
        );
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/recommendations/change/{changeId}
     * Evaluates recommendations for a pre-recorded Change record in the database.
     */
    @GetMapping("/change/{changeId}")
    public ResponseEntity<RecommendationResponseDto> getRecommendationsForChange(
            @PathVariable Long changeId,
            @RequestHeader(value = "X-User-Role", required = false, defaultValue = "ENGINEER") String userRole) {
        RecommendationResponseDto response = recommendationService.analyzeRecommendationsForChange(changeId);
        auditLogService.recordAudit(
                userRole,
                "RECOMMENDATION_ANALYSIS",
                "CHANGE",
                changeId,
                "SUCCESS",
                String.format("Evaluated recommendations for change record #%d -> %d actions generated",
                        changeId, response.getRecommendations() != null ? response.getRecommendations().size() : 0)
        );
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/recommendations/change/{changeId}
     * POST alias for evaluating recommendations on a pre-recorded Change record.
     */
    @PostMapping("/change/{changeId}")
    public ResponseEntity<RecommendationResponseDto> analyzeRecommendationsForChangePost(
            @PathVariable Long changeId) {
        return getRecommendationsForChange(changeId);
    }
}
