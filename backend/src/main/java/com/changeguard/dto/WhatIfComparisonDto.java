package com.changeguard.dto;

import java.util.ArrayList;
import java.util.List;

public class WhatIfComparisonDto {

    private List<String> newlyAffectedServices = new ArrayList<>();
    private List<String> noLongerAffectedServices = new ArrayList<>();
    private List<String> newlyCriticalAffectedServices = new ArrayList<>();

    private int affectedCountDelta;
    private int criticalAffectedDelta;
    private int maxDepthDelta;

    private double blastRadiusScoreDelta;
    private double riskScoreDelta;
    private int riskPercentageDelta;

    private boolean riskLevelChanged;
    private String currentRiskLevel;
    private String simulatedRiskLevel;

    private Double mlProbabilityDelta;
    private String simulationVerdict;

    public WhatIfComparisonDto() {
    }

    public List<String> getNewlyAffectedServices() {
        return newlyAffectedServices;
    }

    public void setNewlyAffectedServices(List<String> newlyAffectedServices) {
        this.newlyAffectedServices = newlyAffectedServices != null ? newlyAffectedServices : new ArrayList<>();
    }

    public List<String> getNoLongerAffectedServices() {
        return noLongerAffectedServices;
    }

    public void setNoLongerAffectedServices(List<String> noLongerAffectedServices) {
        this.noLongerAffectedServices = noLongerAffectedServices != null ? noLongerAffectedServices : new ArrayList<>();
    }

    public List<String> getNewlyCriticalAffectedServices() {
        return newlyCriticalAffectedServices;
    }

    public void setNewlyCriticalAffectedServices(List<String> newlyCriticalAffectedServices) {
        this.newlyCriticalAffectedServices = newlyCriticalAffectedServices != null ? newlyCriticalAffectedServices : new ArrayList<>();
    }

    public int getAffectedCountDelta() {
        return affectedCountDelta;
    }

    public void setAffectedCountDelta(int affectedCountDelta) {
        this.affectedCountDelta = affectedCountDelta;
    }

    public int getCriticalAffectedDelta() {
        return criticalAffectedDelta;
    }

    public void setCriticalAffectedDelta(int criticalAffectedDelta) {
        this.criticalAffectedDelta = criticalAffectedDelta;
    }

    public int getMaxDepthDelta() {
        return maxDepthDelta;
    }

    public void setMaxDepthDelta(int maxDepthDelta) {
        this.maxDepthDelta = maxDepthDelta;
    }

    public double getBlastRadiusScoreDelta() {
        return blastRadiusScoreDelta;
    }

    public void setBlastRadiusScoreDelta(double blastRadiusScoreDelta) {
        this.blastRadiusScoreDelta = blastRadiusScoreDelta;
    }

    public double getRiskScoreDelta() {
        return riskScoreDelta;
    }

    public void setRiskScoreDelta(double riskScoreDelta) {
        this.riskScoreDelta = riskScoreDelta;
    }

    public int getRiskPercentageDelta() {
        return riskPercentageDelta;
    }

    public void setRiskPercentageDelta(int riskPercentageDelta) {
        this.riskPercentageDelta = riskPercentageDelta;
    }

    public boolean isRiskLevelChanged() {
        return riskLevelChanged;
    }

    public void setRiskLevelChanged(boolean riskLevelChanged) {
        this.riskLevelChanged = riskLevelChanged;
    }

    public String getCurrentRiskLevel() {
        return currentRiskLevel;
    }

    public void setCurrentRiskLevel(String currentRiskLevel) {
        this.currentRiskLevel = currentRiskLevel;
    }

    public String getSimulatedRiskLevel() {
        return simulatedRiskLevel;
    }

    public void setSimulatedRiskLevel(String simulatedRiskLevel) {
        this.simulatedRiskLevel = simulatedRiskLevel;
    }

    public Double getMlProbabilityDelta() {
        return mlProbabilityDelta;
    }

    public void setMlProbabilityDelta(Double mlProbabilityDelta) {
        this.mlProbabilityDelta = mlProbabilityDelta;
    }

    public String getSimulationVerdict() {
        return simulationVerdict;
    }

    public void setSimulationVerdict(String simulationVerdict) {
        this.simulationVerdict = simulationVerdict;
    }
}
