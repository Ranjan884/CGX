package com.changeguard.dto;

import java.util.List;
import java.util.Map;

public class BlastRadiusResultDto {
    private ServiceRefDto startingService;
    private List<String> directlyAffectedServices;
    private List<String> indirectlyAffectedServices;
    private List<String> allAffectedServices;
    private List<String> criticalAffectedServices;
    private int criticalServicesAffectedCount;
    private int totalAffectedServices;
    private int maxDependencyDepth;
    private Map<String, Integer> serviceDepths;
    private List<List<String>> dependencyPaths;
    private double blastRadiusScore;

    public BlastRadiusResultDto() {
    }

    public BlastRadiusResultDto(ServiceRefDto startingService,
                                List<String> directlyAffectedServices,
                                List<String> indirectlyAffectedServices,
                                List<String> allAffectedServices,
                                List<String> criticalAffectedServices,
                                int criticalServicesAffectedCount,
                                int totalAffectedServices,
                                int maxDependencyDepth,
                                Map<String, Integer> serviceDepths,
                                List<List<String>> dependencyPaths,
                                double blastRadiusScore) {
        this.startingService = startingService;
        this.directlyAffectedServices = directlyAffectedServices;
        this.indirectlyAffectedServices = indirectlyAffectedServices;
        this.allAffectedServices = allAffectedServices;
        this.criticalAffectedServices = criticalAffectedServices;
        this.criticalServicesAffectedCount = criticalServicesAffectedCount;
        this.totalAffectedServices = totalAffectedServices;
        this.maxDependencyDepth = maxDependencyDepth;
        this.serviceDepths = serviceDepths;
        this.dependencyPaths = dependencyPaths;
        this.blastRadiusScore = blastRadiusScore;
    }

    public ServiceRefDto getStartingService() {
        return startingService;
    }

    public void setStartingService(ServiceRefDto startingService) {
        this.startingService = startingService;
    }

    public List<String> getDirectlyAffectedServices() {
        return directlyAffectedServices;
    }

    public void setDirectlyAffectedServices(List<String> directlyAffectedServices) {
        this.directlyAffectedServices = directlyAffectedServices;
    }

    public List<String> getIndirectlyAffectedServices() {
        return indirectlyAffectedServices;
    }

    public void setIndirectlyAffectedServices(List<String> indirectlyAffectedServices) {
        this.indirectlyAffectedServices = indirectlyAffectedServices;
    }

    public List<String> getAllAffectedServices() {
        return allAffectedServices;
    }

    public void setAllAffectedServices(List<String> allAffectedServices) {
        this.allAffectedServices = allAffectedServices;
    }

    public List<String> getCriticalAffectedServices() {
        return criticalAffectedServices;
    }

    public void setCriticalAffectedServices(List<String> criticalAffectedServices) {
        this.criticalAffectedServices = criticalAffectedServices;
    }

    public int getCriticalServicesAffectedCount() {
        return criticalServicesAffectedCount;
    }

    public void setCriticalServicesAffectedCount(int criticalServicesAffectedCount) {
        this.criticalServicesAffectedCount = criticalServicesAffectedCount;
    }

    public int getTotalAffectedServices() {
        return totalAffectedServices;
    }

    public void setTotalAffectedServices(int totalAffectedServices) {
        this.totalAffectedServices = totalAffectedServices;
    }

    public int getMaxDependencyDepth() {
        return maxDependencyDepth;
    }

    public void setMaxDependencyDepth(int maxDependencyDepth) {
        this.maxDependencyDepth = maxDependencyDepth;
    }

    public Map<String, Integer> getServiceDepths() {
        return serviceDepths;
    }

    public void setServiceDepths(Map<String, Integer> serviceDepths) {
        this.serviceDepths = serviceDepths;
    }

    public List<List<String>> getDependencyPaths() {
        return dependencyPaths;
    }

    public void setDependencyPaths(List<List<String>> dependencyPaths) {
        this.dependencyPaths = dependencyPaths;
    }

    public double getBlastRadiusScore() {
        return blastRadiusScore;
    }

    public void setBlastRadiusScore(double blastRadiusScore) {
        this.blastRadiusScore = blastRadiusScore;
    }
}
