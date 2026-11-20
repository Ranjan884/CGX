package com.changeguard.dto;

public class RiskFactorDetailDto {
    private String factorName;
    private Object rawValue;
    private double normalizedValue;
    private double weight;
    private double contribution;
    private String description;

    public RiskFactorDetailDto() {
    }

    public RiskFactorDetailDto(String factorName, Object rawValue, double normalizedValue, double weight, double contribution, String description) {
        this.factorName = factorName;
        this.rawValue = rawValue;
        this.normalizedValue = normalizedValue;
        this.weight = weight;
        this.contribution = contribution;
        this.description = description;
    }

    public String getFactorName() {
        return factorName;
    }

    public void setFactorName(String factorName) {
        this.factorName = factorName;
    }

    public Object getRawValue() {
        return rawValue;
    }

    public void setRawValue(Object rawValue) {
        this.rawValue = rawValue;
    }

    public double getNormalizedValue() {
        return normalizedValue;
    }

    public void setNormalizedValue(double normalizedValue) {
        this.normalizedValue = normalizedValue;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

    public double getContribution() {
        return contribution;
    }

    public void setContribution(double contribution) {
        this.contribution = contribution;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
