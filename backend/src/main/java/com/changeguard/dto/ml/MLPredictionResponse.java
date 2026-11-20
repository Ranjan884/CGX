package com.changeguard.dto.ml;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class MLPredictionResponse {

    private Double failureProbability;
    private Integer prediction;
    private String riskLevel;
    private String model;
    private String modelVersion;

    public MLPredictionResponse() {
    }

    public MLPredictionResponse(Double failureProbability, Integer prediction, String riskLevel, String model, String modelVersion) {
        this.failureProbability = failureProbability;
        this.prediction = prediction;
        this.riskLevel = riskLevel;
        this.model = model;
        this.modelVersion = modelVersion;
    }

    public Double getFailureProbability() {
        return failureProbability;
    }

    public void setFailureProbability(Double failureProbability) {
        this.failureProbability = failureProbability;
    }

    public Integer getPrediction() {
        return prediction;
    }

    public void setPrediction(Integer prediction) {
        this.prediction = prediction;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }
}
