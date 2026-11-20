package com.changeguard.dto;

import java.util.List;

public class PathsResultDto {
    private String startingService;
    private Long startingServiceId;
    private int totalPaths;
    private List<List<String>> paths;

    public PathsResultDto() {
    }

    public PathsResultDto(String startingService, Long startingServiceId, List<List<String>> paths) {
        this.startingService = startingService;
        this.startingServiceId = startingServiceId;
        this.paths = paths;
        this.totalPaths = paths != null ? paths.size() : 0;
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

    public int getTotalPaths() {
        return totalPaths;
    }

    public void setTotalPaths(int totalPaths) {
        this.totalPaths = totalPaths;
    }

    public List<List<String>> getPaths() {
        return paths;
    }

    public void setPaths(List<List<String>> paths) {
        this.paths = paths;
        this.totalPaths = paths != null ? paths.size() : 0;
    }
}
