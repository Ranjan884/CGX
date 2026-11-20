package com.changeguard.dto.recommendation;

import com.changeguard.dto.RiskAnalysisRequest;
import com.changeguard.dto.WhatIfSimulationRequest;

/**
 * Phase 13 DTO: Request for Intelligent Change Recommendations
 */
public class RecommendationRequestDto {

    private Long serviceId;
    private String changeType;
    private String oldVersion;
    private String newVersion;
    private Object complexity;
    private String description;

    // Optional: What-If simulation request parameters to factor into recommendation
    private WhatIfSimulationRequest whatIfSimulation;

    public RecommendationRequestDto() {
    }

    public RecommendationRequestDto(Long serviceId, String changeType, String oldVersion,
                                  String newVersion, Object complexity, String description) {
        this.serviceId = serviceId;
        this.changeType = changeType;
        this.oldVersion = oldVersion;
        this.newVersion = newVersion;
        this.complexity = complexity;
        this.description = description;
    }

    public RiskAnalysisRequest toRiskAnalysisRequest() {
        return new RiskAnalysisRequest(serviceId, changeType, oldVersion, newVersion, complexity, description);
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public String getChangeType() {
        return changeType;
    }

    public void setChangeType(String changeType) {
        this.changeType = changeType;
    }

    public String getOldVersion() {
        return oldVersion;
    }

    public void setOldVersion(String oldVersion) {
        this.oldVersion = oldVersion;
    }

    public String getNewVersion() {
        return newVersion;
    }

    public void setNewVersion(String newVersion) {
        this.newVersion = newVersion;
    }

    public Object getComplexity() {
        return complexity;
    }

    public void setComplexity(Object complexity) {
        this.complexity = complexity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public WhatIfSimulationRequest getWhatIfSimulation() {
        return whatIfSimulation;
    }

    public void setWhatIfSimulation(WhatIfSimulationRequest whatIfSimulation) {
        this.whatIfSimulation = whatIfSimulation;
    }
}
