package com.changeguard.dto;

import com.changeguard.dto.ml.MLPredictionResponse;
import com.changeguard.dto.ml.MLStatus;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class SimulationStateDto {

    private Long serviceId;
    private String serviceName;
    private String version;
    private String changeType;
    private Object complexity;

    private double blastRadiusScore;
    private int totalAffectedServices;
    private int criticalServicesAffectedCount;
    private int maxDependencyDepth;

    private List<String> directlyAffectedServices = new ArrayList<>();
    private List<String> indirectlyAffectedServices = new ArrayList<>();
    private List<String> allAffectedServices = new ArrayList<>();
    private List<String> criticalServicesAffected = new ArrayList<>();
    private Map<String, Integer> serviceDepths = new LinkedHashMap<>();
    private List<List<String>> dependencyPaths = new ArrayList<>();

    private double ruleBasedRiskScore;
    private int ruleBasedRiskPercentage;
    private String ruleBasedRiskLevel;
    private Map<String, RiskFactorDetailDto> riskFactors = new LinkedHashMap<>();

    private MLPredictionResponse mlPrediction;
    private MLStatus mlStatus;
    private String explanation;

    public SimulationStateDto() {
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

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getChangeType() {
        return changeType;
    }

    public void setChangeType(String changeType) {
        this.changeType = changeType;
    }

    public Object getComplexity() {
        return complexity;
    }

    public void setComplexity(Object complexity) {
        this.complexity = complexity;
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

    public int getCriticalServicesAffectedCount() {
        return criticalServicesAffectedCount;
    }

    public void setCriticalServicesAffectedCount(int criticalServicesAffectedCount) {
        this.criticalServicesAffectedCount = criticalServicesAffectedCount;
    }

    public int getMaxDependencyDepth() {
        return maxDependencyDepth;
    }

    public void setMaxDependencyDepth(int maxDependencyDepth) {
        this.maxDependencyDepth = maxDependencyDepth;
    }

    public List<String> getDirectlyAffectedServices() {
        return directlyAffectedServices;
    }

    public void setDirectlyAffectedServices(List<String> directlyAffectedServices) {
        this.directlyAffectedServices = directlyAffectedServices != null ? directlyAffectedServices : new ArrayList<>();
    }

    public List<String> getIndirectlyAffectedServices() {
        return indirectlyAffectedServices;
    }

    public void setIndirectlyAffectedServices(List<String> indirectlyAffectedServices) {
        this.indirectlyAffectedServices = indirectlyAffectedServices != null ? indirectlyAffectedServices : new ArrayList<>();
    }

    public List<String> getAllAffectedServices() {
        return allAffectedServices;
    }

    public void setAllAffectedServices(List<String> allAffectedServices) {
        this.allAffectedServices = allAffectedServices != null ? allAffectedServices : new ArrayList<>();
    }

    public List<String> getCriticalServicesAffected() {
        return criticalServicesAffected;
    }

    public void setCriticalServicesAffected(List<String> criticalServicesAffected) {
        this.criticalServicesAffected = criticalServicesAffected != null ? criticalServicesAffected : new ArrayList<>();
    }

    public Map<String, Integer> getServiceDepths() {
        return serviceDepths;
    }

    public void setServiceDepths(Map<String, Integer> serviceDepths) {
        this.serviceDepths = serviceDepths != null ? serviceDepths : new LinkedHashMap<>();
    }

    public List<List<String>> getDependencyPaths() {
        return dependencyPaths;
    }

    public void setDependencyPaths(List<List<String>> dependencyPaths) {
        this.dependencyPaths = dependencyPaths != null ? dependencyPaths : new ArrayList<>();
    }

    public double getRuleBasedRiskScore() {
        return ruleBasedRiskScore;
    }

    public void setRuleBasedRiskScore(double ruleBasedRiskScore) {
        this.ruleBasedRiskScore = ruleBasedRiskScore;
    }

    public int getRuleBasedRiskPercentage() {
        return ruleBasedRiskPercentage;
    }

    public void setRuleBasedRiskPercentage(int ruleBasedRiskPercentage) {
        this.ruleBasedRiskPercentage = ruleBasedRiskPercentage;
    }

    public String getRuleBasedRiskLevel() {
        return ruleBasedRiskLevel;
    }

    public void setRuleBasedRiskLevel(String ruleBasedRiskLevel) {
        this.ruleBasedRiskLevel = ruleBasedRiskLevel;
    }

    public Map<String, RiskFactorDetailDto> getRiskFactors() {
        return riskFactors;
    }

    public void setRiskFactors(Map<String, RiskFactorDetailDto> riskFactors) {
        this.riskFactors = riskFactors != null ? riskFactors : new LinkedHashMap<>();
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

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
