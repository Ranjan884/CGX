package com.changeguard.model;

import com.changeguard.model.enums.Severity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Phase 12 Entity: Risk Analysis History
 * Stores completed pre-deployment risk evaluations, ML predictions, and actual observed incident outcomes.
 */
@Entity
@Table(name = "risk_analysis_history", indexes = {
    @Index(name = "idx_history_service", columnList = "service_id"),
    @Index(name = "idx_history_change", columnList = "change_id"),
    @Index(name = "idx_history_timestamp", columnList = "analysis_timestamp"),
    @Index(name = "idx_history_risk_level", columnList = "risk_level"),
    @Index(name = "idx_history_actual_incident", columnList = "actual_incident")
})
public class RiskAnalysisHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "change_id")
    private Change change;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity service;

    @Column(name = "risk_score", nullable = false)
    private Double riskScore;

    @Column(name = "risk_level", nullable = false, length = 20)
    private String riskLevel;

    @Column(name = "blast_radius_score", nullable = false)
    private Double blastRadiusScore;

    @Column(name = "affected_services_count", nullable = false)
    private Integer affectedServicesCount;

    @Column(name = "critical_services_affected", nullable = false)
    private Integer criticalServicesAffected;

    @Column(name = "dependency_depth", nullable = false)
    private Integer dependencyDepth;

    // ML Fields: NULL if ML inference service was offline or failed
    @Column(name = "ml_failure_probability")
    private Double mlFailureProbability;

    @Column(name = "ml_prediction")
    private Integer mlPrediction;

    @Column(name = "ml_model_version", length = 30)
    private String mlModelVersion;

    @Column(name = "analysis_timestamp", nullable = false)
    private LocalDateTime analysisTimestamp = LocalDateTime.now();

    // Actual observed production outcome (NULL until recorded)
    @Column(name = "actual_incident")
    private Boolean actualIncident;

    @Enumerated(EnumType.STRING)
    @Column(name = "actual_incident_severity", length = 20)
    private Severity actualIncidentSeverity;

    @Column(name = "outcome_updated_at")
    private LocalDateTime outcomeUpdatedAt;

    public RiskAnalysisHistory() {
    }

    public RiskAnalysisHistory(Change change, ServiceEntity service, Double riskScore, String riskLevel,
                               Double blastRadiusScore, Integer affectedServicesCount,
                               Integer criticalServicesAffected, Integer dependencyDepth,
                               Double mlFailureProbability, Integer mlPrediction, String mlModelVersion) {
        this.change = change;
        this.service = service;
        this.riskScore = riskScore;
        this.riskLevel = riskLevel;
        this.blastRadiusScore = blastRadiusScore;
        this.affectedServicesCount = affectedServicesCount;
        this.criticalServicesAffected = criticalServicesAffected;
        this.dependencyDepth = dependencyDepth;
        this.mlFailureProbability = mlFailureProbability;
        this.mlPrediction = mlPrediction;
        this.mlModelVersion = mlModelVersion;
        this.analysisTimestamp = LocalDateTime.now();
    }

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

    public ServiceEntity getService() {
        return service;
    }

    public void setService(ServiceEntity service) {
        this.service = service;
    }

    public Double getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Double riskScore) {
        this.riskScore = riskScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public Double getBlastRadiusScore() {
        return blastRadiusScore;
    }

    public void setBlastRadiusScore(Double blastRadiusScore) {
        this.blastRadiusScore = blastRadiusScore;
    }

    public Integer getAffectedServicesCount() {
        return affectedServicesCount;
    }

    public void setAffectedServicesCount(Integer affectedServicesCount) {
        this.affectedServicesCount = affectedServicesCount;
    }

    public Integer getCriticalServicesAffected() {
        return criticalServicesAffected;
    }

    public void setCriticalServicesAffected(Integer criticalServicesAffected) {
        this.criticalServicesAffected = criticalServicesAffected;
    }

    public Integer getDependencyDepth() {
        return dependencyDepth;
    }

    public void setDependencyDepth(Integer dependencyDepth) {
        this.dependencyDepth = dependencyDepth;
    }

    public Double getMlFailureProbability() {
        return mlFailureProbability;
    }

    public void setMlFailureProbability(Double mlFailureProbability) {
        this.mlFailureProbability = mlFailureProbability;
    }

    public Integer getMlPrediction() {
        return mlPrediction;
    }

    public void setMlPrediction(Integer mlPrediction) {
        this.mlPrediction = mlPrediction;
    }

    public String getMlModelVersion() {
        return mlModelVersion;
    }

    public void setMlModelVersion(String mlModelVersion) {
        this.mlModelVersion = mlModelVersion;
    }

    public LocalDateTime getAnalysisTimestamp() {
        return analysisTimestamp;
    }

    public void setAnalysisTimestamp(LocalDateTime analysisTimestamp) {
        this.analysisTimestamp = analysisTimestamp;
    }

    public Boolean getActualIncident() {
        return actualIncident;
    }

    public void setActualIncident(Boolean actualIncident) {
        this.actualIncident = actualIncident;
    }

    public Severity getActualIncidentSeverity() {
        return actualIncidentSeverity;
    }

    public void setActualIncidentSeverity(Severity actualIncidentSeverity) {
        this.actualIncidentSeverity = actualIncidentSeverity;
    }

    public LocalDateTime getOutcomeUpdatedAt() {
        return outcomeUpdatedAt;
    }

    public void setOutcomeUpdatedAt(LocalDateTime outcomeUpdatedAt) {
        this.outcomeUpdatedAt = outcomeUpdatedAt;
    }
}
