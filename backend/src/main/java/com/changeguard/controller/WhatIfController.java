package com.changeguard.controller;

import com.changeguard.dto.WhatIfSimulationRequest;
import com.changeguard.dto.WhatIfSimulationResponse;
import com.changeguard.service.AuditLogService;
import com.changeguard.service.WhatIfSimulationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Phase 9 & 14: What-If Change Simulator REST API Controller with Governance Audit Logging
 *
 * Exposes isolated sandbox simulation endpoints to evaluate hypothetical
 * microservice version upgrades, topological dependency mutations, and complexity shifts.
 */
@RestController
@CrossOrigin(origins = "*")
public class WhatIfController {

    private final WhatIfSimulationService whatIfSimulationService;
    private final AuditLogService auditLogService;

    public WhatIfController(WhatIfSimulationService whatIfSimulationService, AuditLogService auditLogService) {
        this.whatIfSimulationService = whatIfSimulationService;
        this.auditLogService = auditLogService;
    }

    /**
     * Primary Phase 9 Endpoint: Run What-If Simulation
     * POST /api/simulation/what-if
     */
    @PostMapping("/api/simulation/what-if")
    public ResponseEntity<WhatIfSimulationResponse> simulateWhatIf(
            @RequestHeader(value = "X-User-Role", required = false, defaultValue = "ENGINEER") String userRole,
            @Valid @RequestBody WhatIfSimulationRequest request) {
        WhatIfSimulationResponse response = whatIfSimulationService.simulate(request);
        auditLogService.recordAudit(
                userRole,
                "WHATIF_SIMULATION",
                "SERVICE",
                request.getServiceId(),
                "SUCCESS",
                String.format("What-If simulation for service ID %d: deltaScore=%.1f, deltaLevel=%s",
                        request.getServiceId(), response.getDeltaRiskScore(), response.getDeltaRiskLevel())
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Alias endpoint: POST /api/what-if/simulate
     */
    @PostMapping("/api/what-if/simulate")
    public ResponseEntity<WhatIfSimulationResponse> simulateWhatIfAlias(
            @RequestHeader(value = "X-User-Role", required = false, defaultValue = "ENGINEER") String userRole,
            @Valid @RequestBody WhatIfSimulationRequest request) {
        return simulateWhatIf(userRole, request);
    }

    /**
     * Alias endpoint: POST /api/simulation/analyze
     */
    @PostMapping("/api/simulation/analyze")
    public ResponseEntity<WhatIfSimulationResponse> simulateWhatIfAnalyze(
            @RequestHeader(value = "X-User-Role", required = false, defaultValue = "ENGINEER") String userRole,
            @Valid @RequestBody WhatIfSimulationRequest request) {
        return simulateWhatIf(userRole, request);
    }
}
