package com.changeguard.dto.history;

/**
 * Phase 12 DTO: High-Risk Service Aggregation Statistics
 */
public class HighRiskServiceStatDto {

    private Long serviceId;
    private String serviceName;
    private String criticality;
    private Long analyzedChanges;
    private Long highRiskChanges;
    private Long actualIncidents;
    private Double averageRiskScore;
    private Double incidentRate;

    public HighRiskServiceStatDto() {
    }

    public HighRiskServiceStatDto(Long serviceId, String serviceName, String criticality,
                                  Long analyzedChanges, Long highRiskChanges, Long actualIncidents,
                                  Double averageRiskScore, Double incidentRate) {
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.criticality = criticality;
        this.analyzedChanges = analyzedChanges;
        this.highRiskChanges = highRiskChanges;
        this.actualIncidents = actualIncidents;
        this.averageRiskScore = averageRiskScore;
        this.incidentRate = incidentRate;
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

    public String getCriticality() {
        return criticality;
    }

    public void setCriticality(String criticality) {
        this.criticality = criticality;
    }

    public Long getAnalyzedChanges() {
        return analyzedChanges;
    }

    public void setAnalyzedChanges(Long analyzedChanges) {
        this.analyzedChanges = analyzedChanges;
    }

    public Long getHighRiskChanges() {
        return highRiskChanges;
    }

    public void setHighRiskChanges(Long highRiskChanges) {
        this.highRiskChanges = highRiskChanges;
    }

    public Long getActualIncidents() {
        return actualIncidents;
    }

    public void setActualIncidents(Long actualIncidents) {
        this.actualIncidents = actualIncidents;
    }

    public Double getAverageRiskScore() {
        return averageRiskScore;
    }

    public void setAverageRiskScore(Double averageRiskScore) {
        this.averageRiskScore = averageRiskScore;
    }

    public Double getIncidentRate() {
        return incidentRate;
    }

    public void setIncidentRate(Double incidentRate) {
        this.incidentRate = incidentRate;
    }
}
