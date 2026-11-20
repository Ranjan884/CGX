package com.changeguard.dto;

import com.changeguard.model.enums.ChangeType;

public class ChangeBlastRadiusDto {
    private Long changeId;
    private String changedService;
    private Long serviceId;
    private ChangeType changeType;
    private String description;
    private String oldVersion;
    private String newVersion;
    private Integer complexity;
    private BlastRadiusResultDto blastRadius;

    public ChangeBlastRadiusDto() {
    }

    public ChangeBlastRadiusDto(Long changeId, String changedService, Long serviceId, ChangeType changeType,
                                String description, String oldVersion, String newVersion, Integer complexity,
                                BlastRadiusResultDto blastRadius) {
        this.changeId = changeId;
        this.changedService = changedService;
        this.serviceId = serviceId;
        this.changeType = changeType;
        this.description = description;
        this.oldVersion = oldVersion;
        this.newVersion = newVersion;
        this.complexity = complexity;
        this.blastRadius = blastRadius;
    }

    public Long getChangeId() {
        return changeId;
    }

    public void setChangeId(Long changeId) {
        this.changeId = changeId;
    }

    public String getChangedService() {
        return changedService;
    }

    public void setChangedService(String changedService) {
        this.changedService = changedService;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public ChangeType getChangeType() {
        return changeType;
    }

    public void setChangeType(ChangeType changeType) {
        this.changeType = changeType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public Integer getComplexity() {
        return complexity;
    }

    public void setComplexity(Integer complexity) {
        this.complexity = complexity;
    }

    public BlastRadiusResultDto getBlastRadius() {
        return blastRadius;
    }

    public void setBlastRadius(BlastRadiusResultDto blastRadius) {
        this.blastRadius = blastRadius;
    }
}
