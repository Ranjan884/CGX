package com.changeguard.dto.history;

import com.changeguard.model.enums.Severity;
import java.time.LocalDateTime;

/**
 * Phase 12 DTO: Detailed Historical Risk Analysis Record
 */
public class RiskHistoryResponseDto {

    private Long id;
    private Long changeId;
    private Long serviceId;
    private String serviceName;
    private String serviceCriticality;
    private Double riskScore;
    private Integer riskPercentage;
    private String riskLevel;
    private Double blastRadiusScore;
    private Integer affectedServicesCount;
    private Integer criticalServicesAffected;
    private Integer dependencyDepth;
    private Double mlFailureProbability;
    private Integer mlPrediction;
    private String mlModelVersion;
    private LocalDateTime analysisTimestamp;
    private Boolean actualIncident;
    private Severity actualIncidentSeverity;
    private String outcomeClassification; // TRUE_POSITIVE, TRUE_NEGATIVE, FALSE_POSITIVE, FALSE_NEGATIVE, UNKNOWN
    private LocalDateTime outcomeUpdatedAt;

    public RiskHistoryResponseDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getChangeId() {
        return changeId;
    }

    public void setChangeId(Long changeId) {
        this.changeId = changeId;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getServiceCriticality() {
        return serviceCriticality;
    }

    public void setServiceCriticality(String serviceCriticality) {
        this.serviceCriticality = serviceCriticality;
    }

    public Double getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Double riskScore) {
        this.riskScore = riskScore;
    }

    public Integer getRiskPercentage() {
        return riskPercentage;
    }

    public void setRiskPercentage(Integer riskPercentage) {
        this.riskPercentage = riskPercentage;
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

    public String getOutcomeClassification() {
        return outcomeClassification;
    }

    public void setOutcomeClassification(String outcomeClassification) {
        this.outcomeClassification = outcomeClassification;
    }

    public LocalDateTime getOutcomeUpdatedAt() {
        return outcomeUpdatedAt;
    }

    public void setOutcomeUpdatedAt(LocalDateTime outcomeUpdatedAt) {
        this.outcomeUpdatedAt = outcomeUpdatedAt;
    }
}
