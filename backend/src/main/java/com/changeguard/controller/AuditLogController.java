package com.changeguard.controller;

import com.changeguard.model.AuditLog;
import com.changeguard.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Phase 14: REST Controller for Audit Logs
 */
@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin(origins = "*")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    /**
     * GET /api/audit-logs
     * Returns recent audit logs for security, compliance, and governance tracking.
     */
    @GetMapping
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogService.getRecentAuditLogs());
    }
}
