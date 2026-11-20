package com.changeguard.model;

import com.changeguard.model.enums.Severity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Associated change is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "change_id", nullable = false)
    private Change change;

    @NotNull(message = "Severity must be specified")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Severity severity;

    @Column(nullable = false)
    private Boolean failure = true;

    @NotBlank(message = "Affected services list is required")
    @Column(name = "affected_services", columnDefinition = "TEXT", nullable = false)
    private String affectedServices;

    @NotBlank(message = "Root cause description is required")
    @Column(name = "root_cause", columnDefinition = "TEXT", nullable = false)
    private String rootCause;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Incident() {
    }

    public Incident(Long id, Change change, Severity severity, Boolean failure, String affectedServices, String rootCause) {
        this.id = id;
        this.change = change;
        this.severity = severity;
        this.failure = failure;
        this.affectedServices = affectedServices;
        this.rootCause = rootCause;
        this.createdAt = LocalDateTime.now();
    }

    public Incident(Change change, Severity severity, Boolean failure, String affectedServices, String rootCause) {
        this(null, change, severity, failure, affectedServices, rootCause);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Change getChange() {
        return change;
    }

    public void setChange(Change change) {
        this.change = change;
    }

    public Severity getSeverity() {
        return severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = severity;
    }

    public Boolean getFailure() {
        return failure;
    }

    public void setFailure(Boolean failure) {
        this.failure = failure;
    }

    public String getAffectedServices() {
        return affectedServices;
    }

    public void setAffectedServices(String affectedServices) {
        this.affectedServices = affectedServices;
    }

    public String getRootCause() {
        return rootCause;
    }

    public void setRootCause(String rootCause) {
        this.rootCause = rootCause;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
