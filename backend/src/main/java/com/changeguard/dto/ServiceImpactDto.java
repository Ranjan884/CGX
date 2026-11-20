package com.changeguard.dto;

import java.util.List;

public class ServiceImpactDto {
    private ServiceRefDto startingService;
    private List<ServiceRefDto> directlyAffectedServices;
    private List<ServiceRefDto> indirectlyAffectedServices;
    private int totalAffectedServices;

    public ServiceImpactDto() {
    }

    public ServiceImpactDto(ServiceRefDto startingService, List<ServiceRefDto> directlyAffectedServices, List<ServiceRefDto> indirectlyAffectedServices) {
        this.startingService = startingService;
        this.directlyAffectedServices = directlyAffectedServices;
        this.indirectlyAffectedServices = indirectlyAffectedServices;
        this.totalAffectedServices = (directlyAffectedServices != null ? directlyAffectedServices.size() : 0) +
                                     (indirectlyAffectedServices != null ? indirectlyAffectedServices.size() : 0);
    }

    public ServiceRefDto getStartingService() {
        return startingService;
    }

    public void setStartingService(ServiceRefDto startingService) {
        this.startingService = startingService;
    }

    public List<ServiceRefDto> getDirectlyAffectedServices() {
        return directlyAffectedServices;
    }

    public void setDirectlyAffectedServices(List<ServiceRefDto> directlyAffectedServices) {
        this.directlyAffectedServices = directlyAffectedServices;
        updateTotal();
    }

    public List<ServiceRefDto> getIndirectlyAffectedServices() {
        return indirectlyAffectedServices;
    }

    public void setIndirectlyAffectedServices(List<ServiceRefDto> indirectlyAffectedServices) {
        this.indirectlyAffectedServices = indirectlyAffectedServices;
        updateTotal();
    }

    public int getTotalAffectedServices() {
        return totalAffectedServices;
    }

    public void setTotalAffectedServices(int totalAffectedServices) {
        this.totalAffectedServices = totalAffectedServices;
    }

    private void updateTotal() {
        this.totalAffectedServices = (directlyAffectedServices != null ? directlyAffectedServices.size() : 0) +
                                     (indirectlyAffectedServices != null ? indirectlyAffectedServices.size() : 0);
    }
}
