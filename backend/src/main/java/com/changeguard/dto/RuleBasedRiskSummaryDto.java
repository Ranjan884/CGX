package com.changeguard.dto;

public class RuleBasedRiskSummaryDto {
    private double riskScore;
    private int riskPercentage;
    private String riskLevel;

    public RuleBasedRiskSummaryDto() {
    }

    public RuleBasedRiskSummaryDto(double riskScore, int riskPercentage, String riskLevel) {
        this.riskScore = riskScore;
        this.riskPercentage = riskPercentage;
        this.riskLevel = riskLevel;
    }

    public double getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(double riskScore) {
        this.riskScore = riskScore;
    }

    public int getRiskPercentage() {
        return riskPercentage;
    }

    public void setRiskPercentage(int riskPercentage) {
        this.riskPercentage = riskPercentage;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }
}
