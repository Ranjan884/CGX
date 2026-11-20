package com.changeguard.dto.recommendation;

import java.util.List;

/**
 * Phase 13 DTO: Comprehensive Decision-Support Recommendation Response
 */
public class RecommendationResponseDto {

    private Long serviceId;
    private String serviceName;
    private String serviceCriticality;
    private String changeType;
    private Double riskScore;
    private Integer riskPercentage;
    private String riskLevel;
    private Double blastRadiusScore;
    private Integer affectedServicesCount;
    private Integer criticalServicesAffectedCount;
    private Integer dependencyDepth;
    private Double mlFailureProbability;
    private Integer mlPrediction;
    private String mlStatus;

    // Decision Support Guardrail Note
    private String decisionSupportNotice;
    private String dataSupportLevel; // HIGH_DATA_SUPPORT, MODERATE_DATA_SUPPORT, LIMITED_DATA_SUPPORT, INSUFFICIENT_DATA

    private List<RecommendationActionDto> recommendations;
    private HistoricalSimilarityDto historicalEvidence;

    // Optional What-If comparison if simulation was provided
    private String simulationComparisonNotice;

    public RecommendationResponseDto() {
        this.decisionSupportNotice = "ChangeGuard provides analytical decision-support recommendations only. Final deployment decisions, canary gates, and rollback authorization remain strictly with authorized engineering personnel.";
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

    public String getChangeType() {
        return changeType;
    }

    public void setChangeType(String changeType) {
        this.changeType = changeType;
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

    public Integer getCriticalServicesAffectedCount() {
        return criticalServicesAffectedCount;
    }

    public void setCriticalServicesAffectedCount(Integer criticalServicesAffectedCount) {
        this.criticalServicesAffectedCount = criticalServicesAffectedCount;
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

    public String getMlStatus() {
        return mlStatus;
    }

    public void setMlStatus(String mlStatus) {
        this.mlStatus = mlStatus;
    }

    public String getDecisionSupportNotice() {
        return decisionSupportNotice;
    }

    public void setDecisionSupportNotice(String decisionSupportNotice) {
        this.decisionSupportNotice = decisionSupportNotice;
    }

    public String getDataSupportLevel() {
        return dataSupportLevel;
    }

    public void setDataSupportLevel(String dataSupportLevel) {
        this.dataSupportLevel = dataSupportLevel;
    }

    public List<RecommendationActionDto> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<RecommendationActionDto> recommendations) {
        this.recommendations = recommendations;
    }

    public HistoricalSimilarityDto getHistoricalEvidence() {
        return historicalEvidence;
    }

    public void setHistoricalEvidence(HistoricalSimilarityDto historicalEvidence) {
        this.historicalEvidence = historicalEvidence;
    }

    public String getSimulationComparisonNotice() {
        return simulationComparisonNotice;
    }

    public void setSimulationComparisonNotice(String simulationComparisonNotice) {
        this.simulationComparisonNotice = simulationComparisonNotice;
    }
}
