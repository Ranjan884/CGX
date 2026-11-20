package com.changeguard.dto;

import com.changeguard.dto.ml.MLPredictionResponse;
import com.changeguard.dto.ml.MLStatus;

import java.util.Map;

public class RiskAnalysisResult {
    private Long changeId;
    private Long serviceId;
    private String serviceName;
    private double riskScore;
    private int riskPercentage;
    private String riskLevel;
    private double blastRadiusScore;
    private int totalAffectedServices;
    private int criticalServicesAffected;
    private int maxDependencyDepth;
    private Map<String, RiskFactorDetailDto> factors;
    private String explanation;
    private BlastRadiusResultDto blastRadius;

    // Phase 7 Combined Architecture
    private RuleBasedRiskSummaryDto ruleBasedRisk;
    private MLPredictionResponse mlPrediction;
    private MLStatus mlStatus;

    public RiskAnalysisResult() {
    }

    public RiskAnalysisResult(Long changeId, Long serviceId, String serviceName, double riskScore, int riskPercentage,
                              String riskLevel, double blastRadiusScore, int totalAffectedServices,
                              int criticalServicesAffected, int maxDependencyDepth,
                              Map<String, RiskFactorDetailDto> factors, String explanation,
                              BlastRadiusResultDto blastRadius) {
        this.changeId = changeId;
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.riskScore = riskScore;
        this.riskPercentage = riskPercentage;
        this.riskLevel = riskLevel;
        this.blastRadiusScore = blastRadiusScore;
        this.totalAffectedServices = totalAffectedServices;
        this.criticalServicesAffected = criticalServicesAffected;
        this.maxDependencyDepth = maxDependencyDepth;
        this.factors = factors;
        this.explanation = explanation;
        this.blastRadius = blastRadius;
        this.ruleBasedRisk = new RuleBasedRiskSummaryDto(riskScore, riskPercentage, riskLevel);
        this.mlStatus = MLStatus.UNAVAILABLE;
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

    public double getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(double riskScore) {
        this.riskScore = riskScore;
        if (this.ruleBasedRisk != null) {
            this.ruleBasedRisk.setRiskScore(riskScore);
        }
    }

    public int getRiskPercentage() {
        return riskPercentage;
    }

    public void setRiskPercentage(int riskPercentage) {
        this.riskPercentage = riskPercentage;
        if (this.ruleBasedRisk != null) {
            this.ruleBasedRisk.setRiskPercentage(riskPercentage);
        }
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
        if (this.ruleBasedRisk != null) {
            this.ruleBasedRisk.setRiskLevel(riskLevel);
        }
    }

    public double getBlastRadiusScore() {
        return blastRadiusScore;
    }

    public void setBlastRadiusScore(double blastRadiusScore) {
        this.blastRadiusScore = blastRadiusScore;
    }

    public int getTotalAffectedServices() {
        return totalAffectedServices;
    }

    public void setTotalAffectedServices(int totalAffectedServices) {
        this.totalAffectedServices = totalAffectedServices;
    }

    public int getCriticalServicesAffected() {
        return criticalServicesAffected;
    }

    public void setCriticalServicesAffected(int criticalServicesAffected) {
        this.criticalServicesAffected = criticalServicesAffected;
    }

    public int getMaxDependencyDepth() {
        return maxDependencyDepth;
    }

    public void setMaxDependencyDepth(int maxDependencyDepth) {
        this.maxDependencyDepth = maxDependencyDepth;
    }

    public Map<String, RiskFactorDetailDto> getFactors() {
        return factors;
    }

    public void setFactors(Map<String, RiskFactorDetailDto> factors) {
        this.factors = factors;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public BlastRadiusResultDto getBlastRadius() {
        return blastRadius;
    }

    public void setBlastRadius(BlastRadiusResultDto blastRadius) {
        this.blastRadius = blastRadius;
    }

    public RuleBasedRiskSummaryDto getRuleBasedRisk() {
        return ruleBasedRisk;
    }

    public void setRuleBasedRisk(RuleBasedRiskSummaryDto ruleBasedRisk) {
        this.ruleBasedRisk = ruleBasedRisk;
    }

    public MLPredictionResponse getMlPrediction() {
        return mlPrediction;
    }

    public void setMlPrediction(MLPredictionResponse mlPrediction) {
        this.mlPrediction = mlPrediction;
    }

    public MLStatus getMlStatus() {
        return mlStatus;
    }

    public void setMlStatus(MLStatus mlStatus) {
        this.mlStatus = mlStatus;
    }
}
