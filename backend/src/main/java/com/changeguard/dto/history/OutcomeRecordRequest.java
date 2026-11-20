package com.changeguard.dto.history;

import com.changeguard.model.enums.Severity;
import jakarta.validation.constraints.NotNull;

/**
 * Phase 12 Request DTO: Record Observed Deployment Incident Outcome
 */
public class OutcomeRecordRequest {

    @NotNull(message = "actualIncident boolean must be specified (true/false)")
    private Boolean actualIncident;

    private Severity actualIncidentSeverity;

    public OutcomeRecordRequest() {
    }

    public OutcomeRecordRequest(Boolean actualIncident, Severity actualIncidentSeverity) {
        this.actualIncident = actualIncident;
        this.actualIncidentSeverity = actualIncidentSeverity;
    }

    public Boolean getActualIncident() {
        return actualIncident;
    }

    public void setActualIncident(Boolean actualIncident) {
        this.actualIncident = actualIncident;
    }

    public Severity getActualIncidentSeverity() {
        return actualIncidentSeverity;
    }

    public void setActualIncidentSeverity(Severity actualIncidentSeverity) {
        this.actualIncidentSeverity = actualIncidentSeverity;
    }
}
