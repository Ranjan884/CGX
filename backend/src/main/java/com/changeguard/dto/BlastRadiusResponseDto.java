package com.changeguard.dto;

import java.util.List;

public class BlastRadiusResponseDto {
    private String targetService;
    private List<String> affectedServices;
    private int affectedCount;
    private int criticalServicesAffected;
    private double blastRadiusRatio;
    private List<List<String>> paths;

    public BlastRadiusResponseDto() {
    }

    public BlastRadiusResponseDto(String targetService, List<String> affectedServices, int affectedCount, 
                                 int criticalServicesAffected, double blastRadiusRatio, List<List<String>> paths) {
        this.targetService = targetService;
        this.affectedServices = affectedServices;
        this.affectedCount = affectedCount;
        this.criticalServicesAffected = criticalServicesAffected;
        this.blastRadiusRatio = blastRadiusRatio;
        this.paths = paths;
    }

    // Getters and Setters
    public String getTargetService() {
        return targetService;
    }

    public void setTargetService(String targetService) {
        this.targetService = targetService;
    }

    public List<String> getAffectedServices() {
        return affectedServices;
    }

    public void setAffectedServices(List<String> affectedServices) {
        this.affectedServices = affectedServices;
    }

    public int getAffectedCount() {
        return affectedCount;
    }

    public void setAffectedCount(int affectedCount) {
        this.affectedCount = affectedCount;
    }

    public int getCriticalServicesAffected() {
        return criticalServicesAffected;
    }

    public void setCriticalServicesAffected(int criticalServicesAffected) {
        this.criticalServicesAffected = criticalServicesAffected;
    }

    public double getBlastRadiusRatio() {
        return blastRadiusRatio;
    }

    public void setBlastRadiusRatio(double blastRadiusRatio) {
        this.blastRadiusRatio = blastRadiusRatio;
    }

    public List<List<String>> getPaths() {
        return paths;
    }

    public void setPaths(List<List<String>> paths) {
        this.paths = paths;
    }
}
