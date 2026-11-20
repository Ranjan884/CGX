package com.changeguard.dto.recommendation;

import java.util.List;

/**
 * Phase 13 DTO: Historical Similarity Evidence Summary
 */
public class HistoricalSimilarityDto {

    private String status; // "AVAILABLE", "INSUFFICIENT_DATA"
    private int similarChangesCount;
    private int incidentChangesCount;
    private double historicalIncidentRate;
    private String summaryMessage;
    private List<String> pastIncidentsRootCauses;

    public HistoricalSimilarityDto() {
    }

    public HistoricalSimilarityDto(String status, int similarChangesCount, int incidentChangesCount,
                                   double historicalIncidentRate, String summaryMessage,
                                   List<String> pastIncidentsRootCauses) {
        this.status = status;
        this.similarChangesCount = similarChangesCount;
        this.incidentChangesCount = incidentChangesCount;
        this.historicalIncidentRate = historicalIncidentRate;
        this.summaryMessage = summaryMessage;
        this.pastIncidentsRootCauses = pastIncidentsRootCauses;
    }

    public static HistoricalSimilarityDto insufficientData(String reason) {
        return new HistoricalSimilarityDto("INSUFFICIENT_DATA", 0, 0, 0.0, reason, List.of());
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getSimilarChangesCount() {
        return similarChangesCount;
    }

    public void setSimilarChangesCount(int similarChangesCount) {
        this.similarChangesCount = similarChangesCount;
    }

    public int getIncidentChangesCount() {
        return incidentChangesCount;
    }

    public void setIncidentChangesCount(int incidentChangesCount) {
        this.incidentChangesCount = incidentChangesCount;
    }

    public double getHistoricalIncidentRate() {
        return historicalIncidentRate;
    }

    public void setHistoricalIncidentRate(double historicalIncidentRate) {
        this.historicalIncidentRate = historicalIncidentRate;
    }

    public String getSummaryMessage() {
        return summaryMessage;
    }

    public void setSummaryMessage(String summaryMessage) {
        this.summaryMessage = summaryMessage;
    }

    public List<String> getPastIncidentsRootCauses() {
        return pastIncidentsRootCauses;
    }

    public void setPastIncidentsRootCauses(List<String> pastIncidentsRootCauses) {
        this.pastIncidentsRootCauses = pastIncidentsRootCauses;
    }
}
