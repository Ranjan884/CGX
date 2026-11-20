package com.changeguard.dto.history;

/**
 * Phase 12 DTO: Historical ML Prediction Performance from Actual Observed Incidents
 */
public class HistoricalMLPerformanceDto {

    private String status; // "OK" or "NOT_ENOUGH_DATA"
    private Long labeledSamples;
    private Long minRequiredSamples;
    private Double threshold;
    private Double accuracy;
    private Double precision;
    private Double recall;
    private Double f1;
    private Long truePositives;
    private Long trueNegatives;
    private Long falsePositives;
    private Long falseNegatives;
    private String message;

    public HistoricalMLPerformanceDto() {
    }

    public static HistoricalMLPerformanceDto notEnoughData(long labeledSamples, long minRequired) {
        HistoricalMLPerformanceDto dto = new HistoricalMLPerformanceDto();
        dto.setStatus("NOT_ENOUGH_DATA");
        dto.setLabeledSamples(labeledSamples);
        dto.setMinRequiredSamples(minRequired);
        dto.setMessage(String.format("Only %d labeled historical outcome(s) recorded. A minimum of %d labeled outcomes are required to calculate statistically reliable prediction performance metrics.", labeledSamples, minRequired));
        return dto;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getLabeledSamples() {
        return labeledSamples;
    }

    public void setLabeledSamples(Long labeledSamples) {
        this.labeledSamples = labeledSamples;
    }

    public Long getMinRequiredSamples() {
        return minRequiredSamples;
    }

    public void setMinRequiredSamples(Long minRequiredSamples) {
        this.minRequiredSamples = minRequiredSamples;
    }

    public Double getThreshold() {
        return threshold;
    }

    public void setThreshold(Double threshold) {
        this.threshold = threshold;
    }

    public Double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(Double accuracy) {
        this.accuracy = accuracy;
    }

    public Double getPrecision() {
        return precision;
    }

    public void setPrecision(Double precision) {
        this.precision = precision;
    }

    public Double getRecall() {
        return recall;
    }

    public void setRecall(Double recall) {
        this.recall = recall;
    }

    public Double getF1() {
        return f1;
    }

    public void setF1(Double f1) {
        this.f1 = f1;
    }

    public Long getTruePositives() {
        return truePositives;
    }

    public void setTruePositives(Long truePositives) {
        this.truePositives = truePositives;
    }

    public Long getTrueNegatives() {
        return trueNegatives;
    }

    public void setTrueNegatives(Long trueNegatives) {
        this.trueNegatives = trueNegatives;
    }

    public Long getFalsePositives() {
        return falsePositives;
    }

    public void setFalsePositives(Long falsePositives) {
        this.falsePositives = falsePositives;
    }

    public Long getFalseNegatives() {
        return falseNegatives;
    }

    public void setFalseNegatives(Long falseNegatives) {
        this.falseNegatives = falseNegatives;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
