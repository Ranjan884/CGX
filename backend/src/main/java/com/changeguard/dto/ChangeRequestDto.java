package com.changeguard.dto;

import com.changeguard.model.enums.ChangeType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ChangeRequestDto {

    @NotNull(message = "serviceId is required")
    private Long serviceId;

    @NotNull(message = "changeType is required")
    private ChangeType changeType;

    @NotBlank(message = "description is required")
    private String description;

    @NotBlank(message = "oldVersion is required")
    private String oldVersion;

    @NotBlank(message = "newVersion is required")
    private String newVersion;

    @NotNull(message = "complexity is required")
    @Min(value = 1, message = "complexity must be at least 1")
    @Max(value = 10, message = "complexity cannot exceed 10")
    private Integer complexity;

    public ChangeRequestDto() {
    }

    public ChangeRequestDto(Long serviceId, ChangeType changeType, String description, String oldVersion, String newVersion, Integer complexity) {
        this.serviceId = serviceId;
        this.changeType = changeType;
        this.description = description;
        this.oldVersion = oldVersion;
        this.newVersion = newVersion;
        this.complexity = complexity;
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
}
