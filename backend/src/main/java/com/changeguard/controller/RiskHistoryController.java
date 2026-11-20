package com.changeguard.controller;

import com.changeguard.dto.history.*;
import com.changeguard.service.AuditLogService;
import com.changeguard.service.RiskAnalysisHistoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Phase 12 & 14 REST Controller: Continuous Change Monitoring & Risk History APIs with Audit Logging.
 */
@RestController
@RequestMapping("/api/risk-history")
@CrossOrigin(origins = "*")
public class RiskHistoryController {

    private final RiskAnalysisHistoryService historyService;
    private final AuditLogService auditLogService;

    public RiskHistoryController(RiskAnalysisHistoryService historyService, AuditLogService auditLogService) {
        this.historyService = historyService;
        this.auditLogService = auditLogService;
    }

    /**
     * GET /api/risk-history
     * Return all historical risk analysis evaluations.
     */
    @GetMapping
    public ResponseEntity<List<RiskHistoryResponseDto>> getAllHistory() {
        return ResponseEntity.ok(historyService.getAllHistory());
    }

    /**
     * GET /api/risk-history/{id}
     * Return single historical risk analysis record.
     */
    @GetMapping("/{id}")
    public ResponseEntity<RiskHistoryResponseDto> getHistoryById(@PathVariable Long id) {
        return ResponseEntity.ok(historyService.getHistoryById(id));
    }

    /**
     * GET /api/risk-history/service/{serviceId}
     * Return risk history for a specific microservice.
     */
    @GetMapping("/service/{serviceId}")
    public ResponseEntity<List<RiskHistoryResponseDto>> getHistoryByService(@PathVariable Long serviceId) {
        return ResponseEntity.ok(historyService.getHistoryByService(serviceId));
    }

    /**
     * PATCH /api/risk-history/{id}/outcome
     * Record actual observed deployment incident outcome.
     */
    @PatchMapping("/{id}/outcome")
    public ResponseEntity<RiskHistoryResponseDto> recordOutcome(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false, defaultValue = "ENGINEER") String userRole,
            @Valid @RequestBody OutcomeRecordRequest request) {
        if ("VIEWER".equalsIgnoreCase(userRole)) {
            auditLogService.recordAudit("VIEWER", "OUTCOME_RECORDED", "RISK_HISTORY", id, "DENIED", "Viewer role denied outcome update permission");
            throw new SecurityException("VIEWER role has read-only access and cannot record incident outcomes.");
        }
        RiskHistoryResponseDto updated = historyService.recordOutcome(id, request);
        auditLogService.recordAudit(
                userRole,
                "OUTCOME_RECORDED",
                "RISK_HISTORY",
                id,
                "SUCCESS",
                String.format("Recorded outcome for history #%d: incident=%s, severity=%s, classification=%s",
                        id, updated.getActualIncident(), updated.getActualIncidentSeverity(), updated.getOutcomeClassification())
        );
        return ResponseEntity.ok(updated);
    }

    /**
     * GET /api/risk-history/high-risk-services
     * Identify services repeatedly appearing in high-risk releases.
     */
    @GetMapping("/high-risk-services")
    public ResponseEntity<List<HighRiskServiceStatDto>> getHighRiskServices() {
        return ResponseEntity.ok(historyService.getHighRiskServices());
    }

    /**
     * GET /api/risk-history/trends
     * Return historical risk score and incident trajectory data.
     */
    @GetMapping("/trends")
    public ResponseEntity<RiskTrendsResponseDto> getRiskTrends() {
        return ResponseEntity.ok(historyService.getRiskTrends());
    }

    /**
     * GET /api/risk-history/ml-performance
     * Compute actual ML prediction accuracy from recorded outcomes.
     */
    @GetMapping("/ml-performance")
    public ResponseEntity<HistoricalMLPerformanceDto> getMLPerformance() {
        return ResponseEntity.ok(historyService.getMLPerformanceMetrics());
    }
}
