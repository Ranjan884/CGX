package com.changeguard.service;

import com.changeguard.model.AuditLog;
import com.changeguard.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Phase 14: Audit Logging Service
 * Records auditable actions with decoupled transaction propagation to ensure audit trail integrity.
 */
@Service
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Persists an audit log record in a new transaction.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AuditLog recordAudit(String userRole, String action, String entityType, Long entityId, String status, String metadata) {
        try {
            AuditLog audit = new AuditLog(userRole, action, entityType, entityId, status, metadata);
            AuditLog saved = auditLogRepository.save(audit);
            log.info("AUDIT [{}] {} on {}:{} -> {}", userRole, action, entityType, entityId, status);
            return saved;
        } catch (Exception ex) {
            log.warn("Failed to persist audit log: {}", ex.getMessage());
            return null;
        }
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getRecentAuditLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
