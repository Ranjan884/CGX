package com.changeguard.dto;

import jakarta.validation.constraints.NotNull;

public class DependencyChangeDto {

    @NotNull(message = "action is required (ADD or REMOVE)")
    private String action; // "ADD" or "REMOVE"

    @NotNull(message = "sourceServiceId is required")
    private Long sourceServiceId;

    @NotNull(message = "targetServiceId is required")
    private Long targetServiceId;

    private String dependencyType;
    private String criticality;

    public DependencyChangeDto() {
    }

    public DependencyChangeDto(String action, Long sourceServiceId, Long targetServiceId) {
        this.action = action;
        this.sourceServiceId = sourceServiceId;
        this.targetServiceId = targetServiceId;
    }

    public DependencyChangeDto(String action, Long sourceServiceId, Long targetServiceId, String dependencyType, String criticality) {
        this.action = action;
        this.sourceServiceId = sourceServiceId;
        this.targetServiceId = targetServiceId;
        this.dependencyType = dependencyType;
        this.criticality = criticality;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public Long getSourceServiceId() {
        return sourceServiceId;
    }

    public void setSourceServiceId(Long sourceServiceId) {
        this.sourceServiceId = sourceServiceId;
    }

    public Long getTargetServiceId() {
        return targetServiceId;
    }

    public void setTargetServiceId(Long targetServiceId) {
        this.targetServiceId = targetServiceId;
    }

    public String getDependencyType() {
        return dependencyType;
    }

    public void setDependencyType(String dependencyType) {
        this.dependencyType = dependencyType;
    }

    public String getCriticality() {
        return criticality;
    }

    public void setCriticality(String criticality) {
        this.criticality = criticality;
    }
}
