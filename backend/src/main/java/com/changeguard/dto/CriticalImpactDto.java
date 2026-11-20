package com.changeguard.dto;

import java.util.List;

public class CriticalImpactDto {
    private String startingService;
    private Long startingServiceId;
    private int affectedServices;
    private int criticalServicesAffected;
    private List<String> criticalServices;

    public CriticalImpactDto() {
    }

    public CriticalImpactDto(String startingService, Long startingServiceId, int affectedServices, int criticalServicesAffected, List<String> criticalServices) {
        this.startingService = startingService;
        this.startingServiceId = startingServiceId;
        this.affectedServices = affectedServices;
        this.criticalServicesAffected = criticalServicesAffected;
        this.criticalServices = criticalServices;
    }

    public String getStartingService() {
        return startingService;
    }

    public void setStartingService(String startingService) {
        this.startingService = startingService;
    }

    public Long getStartingServiceId() {
        return startingServiceId;
    }

    public void setStartingServiceId(Long startingServiceId) {
        this.startingServiceId = startingServiceId;
    }

    public int getAffectedServices() {
        return affectedServices;
    }

    public void setAffectedServices(int affectedServices) {
        this.affectedServices = affectedServices;
    }

    public int getCriticalServicesAffected() {
        return criticalServicesAffected;
    }

    public void setCriticalServicesAffected(int criticalServicesAffected) {
        this.criticalServicesAffected = criticalServicesAffected;
    }

    public List<String> getCriticalServices() {
        return criticalServices;
    }

    public void setCriticalServices(List<String> criticalServices) {
        this.criticalServices = criticalServices;
    }
}
