package com.changeguard.controller;

import com.changeguard.config.RiskConfiguration;
import com.changeguard.dto.RiskAnalysisRequest;
import com.changeguard.dto.RiskAnalysisResult;
import com.changeguard.service.AuditLogService;
import com.changeguard.service.RiskAnalysisService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/risk")
@CrossOrigin(origins = "*")
public class RiskController {

    private final RiskAnalysisService riskAnalysisService;
    private final RiskConfiguration riskConfiguration;
    private final AuditLogService auditLogService;

    public RiskController(RiskAnalysisService riskAnalysisService,
                          RiskConfiguration riskConfiguration,
                          AuditLogService auditLogService) {
        this.riskAnalysisService = riskAnalysisService;
        this.riskConfiguration = riskConfiguration;
        this.auditLogService = auditLogService;
    }

    /**
     * Phase 5 Endpoint: Analyze risk of a proposed technical change
     */
    @PostMapping("/analyze")
    public ResponseEntity<RiskAnalysisResult> analyzeProposedRisk(
            @RequestHeader(value = "X-User-Role", required = false, defaultValue = "ENGINEER") String userRole,
            @Valid @RequestBody RiskAnalysisRequest request) {
        RiskAnalysisResult result = riskAnalysisService.analyzeRisk(request);
        auditLogService.recordAudit(
                userRole,
                "RISK_ANALYSIS",
                "SERVICE",
                request.getServiceId(),
                "SUCCESS",
                String.format("Evaluated %s change on service ID %d -> Risk %s (%d%%)",
                        request.getChangeType(), request.getServiceId(), result.getRiskLevel(), result.getRiskPercentage())
        );
        return ResponseEntity.ok(result);
    }

    /**
     * Phase 5 Endpoint: Analyze risk for an existing recorded Change
     */
    @PostMapping("/analyze/change/{changeId}")
    public ResponseEntity<RiskAnalysisResult> analyzeChangeRiskPost(
            @PathVariable Long changeId,
            @RequestHeader(value = "X-User-Role", required = false, defaultValue = "ENGINEER") String userRole) {
        RiskAnalysisResult result = riskAnalysisService.analyzeRiskForChange(changeId);
        auditLogService.recordAudit(
                userRole,
                "RISK_ANALYSIS",
                "CHANGE",
                changeId,
                "SUCCESS",
                String.format("Evaluated change record #%d -> Risk %s (%d%%)", changeId, result.getRiskLevel(), result.getRiskPercentage())
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/analyze/change/{changeId}")
    public ResponseEntity<RiskAnalysisResult> analyzeChangeRiskGet(@PathVariable Long changeId) {
        return ResponseEntity.ok(riskAnalysisService.analyzeRiskForChange(changeId));
    }

    /**
     * Phase 5 Endpoint: View active risk weights and threshold configuration
     */
    @GetMapping("/config")
    public ResponseEntity<RiskConfiguration> getRiskConfiguration() {
        return ResponseEntity.ok(riskConfiguration);
    }
}
