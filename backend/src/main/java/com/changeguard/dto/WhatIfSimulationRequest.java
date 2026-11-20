package com.changeguard.dto;

import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class WhatIfSimulationRequest {

    @NotNull(message = "serviceId is required")
    private Long serviceId;

    private String changeType;
    private String oldVersion;
    private String newVersion;
    private Object complexity;
    private String description;

    private List<DependencyChangeDto> dependencyChanges = new ArrayList<>();

    public WhatIfSimulationRequest() {
    }

    public WhatIfSimulationRequest(Long serviceId, String changeType, String oldVersion, String newVersion, Object complexity, String description) {
        this.serviceId = serviceId;
        this.changeType = changeType;
        this.oldVersion = oldVersion;
        this.newVersion = newVersion;
        this.complexity = complexity;
        this.description = description;
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

    public List<DependencyChangeDto> getDependencyChanges() {
        return dependencyChanges;
    }

    public void setDependencyChanges(List<DependencyChangeDto> dependencyChanges) {
        this.dependencyChanges = dependencyChanges != null ? dependencyChanges : new ArrayList<>();
    }
}
