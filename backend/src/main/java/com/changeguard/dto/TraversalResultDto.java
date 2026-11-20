package com.changeguard.dto;

import java.util.List;

public class TraversalResultDto {
    private String algorithm;
    private String startingService;
    private Long startingServiceId;
    private List<String> visitedServices;
    private int totalVisited;

    public TraversalResultDto() {
    }

    public TraversalResultDto(String algorithm, String startingService, Long startingServiceId, List<String> visitedServices) {
        this.algorithm = algorithm;
        this.startingService = startingService;
        this.startingServiceId = startingServiceId;
        this.visitedServices = visitedServices;
        this.totalVisited = visitedServices != null ? visitedServices.size() : 0;
    }

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
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

    public List<String> getVisitedServices() {
        return visitedServices;
    }

    public void setVisitedServices(List<String> visitedServices) {
        this.visitedServices = visitedServices;
        this.totalVisited = visitedServices != null ? visitedServices.size() : 0;
    }

    public int getTotalVisited() {
        return totalVisited;
    }

    public void setTotalVisited(int totalVisited) {
        this.totalVisited = totalVisited;
    }
}
