package com.changeguard.dto.ml;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

public class MLPredictionRequest {

    @NotNull
    @JsonProperty("change_complexity")
    private Double changeComplexity;

    @NotNull
    @JsonProperty("dependency_count")
    private Integer dependencyCount;

    @NotNull
    @JsonProperty("dependency_depth")
    private Integer dependencyDepth;

    @NotNull
    @JsonProperty("criticality_score")
    private Double criticalityScore;

    @NotNull
    @JsonProperty("historical_failure_rate")
    private Double historicalFailureRate;

    @NotNull
    @JsonProperty("change_type")
    private String changeType;

    @NotNull
    @JsonProperty("blast_radius_score")
    private Double blastRadiusScore;

    @NotNull
    @JsonProperty("critical_services_affected")
    private Integer criticalServicesAffected;

    @NotNull
    @JsonProperty("previous_incidents")
    private Integer previousIncidents;

    @NotNull
    @JsonProperty("service_age")
    private Integer serviceAge;

    @NotNull
    @JsonProperty("version_change_size")
    private Double versionChangeSize;

    public MLPredictionRequest() {
    }

    public MLPredictionRequest(Double changeComplexity, Integer dependencyCount, Integer dependencyDepth,
                               Double criticalityScore, Double historicalFailureRate, String changeType,
                               Double blastRadiusScore, Integer criticalServicesAffected, Integer previousIncidents,
                               Integer serviceAge, Double versionChangeSize) {
        this.changeComplexity = changeComplexity;
        this.dependencyCount = dependencyCount;
        this.dependencyDepth = dependencyDepth;
        this.criticalityScore = criticalityScore;
        this.historicalFailureRate = historicalFailureRate;
        this.changeType = changeType;
        this.blastRadiusScore = blastRadiusScore;
        this.criticalServicesAffected = criticalServicesAffected;
        this.previousIncidents = previousIncidents;
        this.serviceAge = serviceAge;
        this.versionChangeSize = versionChangeSize;
    }

    public Double getChangeComplexity() {
        return changeComplexity;
    }

    public void setChangeComplexity(Double changeComplexity) {
        this.changeComplexity = changeComplexity;
    }

    public Integer getDependencyCount() {
        return dependencyCount;
    }

    public void setDependencyCount(Integer dependencyCount) {
        this.dependencyCount = dependencyCount;
    }

    public Integer getDependencyDepth() {
        return dependencyDepth;
    }

    public void setDependencyDepth(Integer dependencyDepth) {
        this.dependencyDepth = dependencyDepth;
    }

    public Double getCriticalityScore() {
        return criticalityScore;
    }

    public void setCriticalityScore(Double criticalityScore) {
        this.criticalityScore = criticalityScore;
    }

    public Double getHistoricalFailureRate() {
        return historicalFailureRate;
    }

    public void setHistoricalFailureRate(Double historicalFailureRate) {
        this.historicalFailureRate = historicalFailureRate;
    }

    public String getChangeType() {
        return changeType;
    }

    public void setChangeType(String changeType) {
        this.changeType = changeType;
    }

    public Double getBlastRadiusScore() {
        return blastRadiusScore;
    }

    public void setBlastRadiusScore(Double blastRadiusScore) {
        this.blastRadiusScore = blastRadiusScore;
    }

    public Integer getCriticalServicesAffected() {
        return criticalServicesAffected;
    }

    public void setCriticalServicesAffected(Integer criticalServicesAffected) {
        this.criticalServicesAffected = criticalServicesAffected;
    }

    public Integer getPreviousIncidents() {
        return previousIncidents;
    }

    public void setPreviousIncidents(Integer previousIncidents) {
        this.previousIncidents = previousIncidents;
    }

    public Integer getServiceAge() {
        return serviceAge;
    }

    public void setServiceAge(Integer serviceAge) {
        this.serviceAge = serviceAge;
    }

    public Double getVersionChangeSize() {
        return versionChangeSize;
    }

    public void setVersionChangeSize(Double versionChangeSize) {
        this.versionChangeSize = versionChangeSize;
    }
}
