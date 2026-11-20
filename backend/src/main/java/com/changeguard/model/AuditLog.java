package com.changeguard.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Phase 14: Audit Logging Entity
 * Implements security and compliance audit tracking for governance-sensitive operations
 * such as risk analyses, What-If simulations, recommendation runs, and outcome updates.
 */
@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_timestamp", columnList = "timestamp"),
    @Index(name = "idx_audit_action", columnList = "action"),
    @Index(name = "idx_audit_entity", columnList = "entity_type, entity_id"),
    @Index(name = "idx_audit_user_role", columnList = "user_role")
})
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_role", nullable = false, length = 30)
    private String userRole = "ENGINEER"; // ADMIN, ENGINEER, VIEWER

    @Column(name = "action", nullable = false, length = 80)
    private String action; // RISK_ANALYSIS, WHATIF_SIMULATION, RECOMMENDATION_ANALYSIS, OUTCOME_RECORDED

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType; // SERVICE, CHANGE, RISK_HISTORY, SIMULATION

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "SUCCESS"; // SUCCESS, FAILED, WARNING

    @Column(columnDefinition = "TEXT")
    private String metadata; // Safe non-sensitive summary details

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public AuditLog() {
    }

    public AuditLog(String userRole, String action, String entityType, Long entityId, String status, String metadata) {
        this.userRole = userRole != null ? userRole : "ENGINEER";
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.status = status != null ? status : "SUCCESS";
        this.metadata = metadata;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
