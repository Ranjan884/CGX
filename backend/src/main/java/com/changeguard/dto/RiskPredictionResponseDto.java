package com.changeguard.dto;

import java.util.List;

public class RiskPredictionResponseDto {
    private String serviceName;
    private double riskProbability;
    private String riskLevel;
    private String modelUsed;
    private List<String> riskFactors;
    private String explanation;
    private String recommendedRollout;
    private BlastRadiusResponseDto blastRadius;

    public RiskPredictionResponseDto() {
    }

    public RiskPredictionResponseDto(String serviceName, double riskProbability, String riskLevel, 
                                      String modelUsed, List<String> riskFactors, String explanation, 
                                      String recommendedRollout, BlastRadiusResponseDto blastRadius) {
        this.serviceName = serviceName;
        this.riskProbability = riskProbability;
        this.riskLevel = riskLevel;
        this.modelUsed = modelUsed;
        this.riskFactors = riskFactors;
        this.explanation = explanation;
        this.recommendedRollout = recommendedRollout;
        this.blastRadius = blastRadius;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public double getRiskProbability() {
        return riskProbability;
    }

    public void setRiskProbability(double riskProbability) {
        this.riskProbability = riskProbability;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getModelUsed() {
        return modelUsed;
    }

    public void setModelUsed(String modelUsed) {
        this.modelUsed = modelUsed;
    }

    public List<String> getRiskFactors() {
        return riskFactors;
    }

    public void setRiskFactors(List<String> riskFactors) {
        this.riskFactors = riskFactors;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getRecommendedRollout() {
        return recommendedRollout;
    }

    public void setRecommendedRollout(String recommendedRollout) {
        this.recommendedRollout = recommendedRollout;
    }

    public BlastRadiusResponseDto getBlastRadius() {
        return blastRadius;
    }

    public void setBlastRadius(BlastRadiusResponseDto blastRadius) {
        this.blastRadius = blastRadius;
    }
}
