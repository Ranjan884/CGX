package com.changeguard.dto;

import jakarta.validation.constraints.NotNull;

public class BlastRadiusAnalyzeRequest {

    @NotNull(message = "serviceId is required")
    private Long serviceId;

    public BlastRadiusAnalyzeRequest() {
    }

    public BlastRadiusAnalyzeRequest(Long serviceId) {
        this.serviceId = serviceId;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }
}
