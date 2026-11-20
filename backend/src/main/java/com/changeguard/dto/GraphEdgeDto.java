package com.changeguard.dto;

import com.changeguard.model.enums.Criticality;

public class GraphEdgeDto {
    private Long id;
    private Long source;
    private Long target;
    private String sourceName;
    private String targetName;
    private String dependencyType;
    private Criticality criticality;

    public GraphEdgeDto() {
    }

    public GraphEdgeDto(Long id, Long source, Long target, String sourceName, String targetName, String dependencyType, Criticality criticality) {
        this.id = id;
        this.source = source;
        this.target = target;
        this.sourceName = sourceName;
        this.targetName = targetName;
        this.dependencyType = dependencyType;
        this.criticality = criticality;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSource() {
        return source;
    }

    public void setSource(Long source) {
        this.source = source;
    }

    public Long getTarget() {
        return target;
    }

    public void setTarget(Long target) {
        this.target = target;
    }

    public String getSourceName() {
        return sourceName;
    }

    public void setSourceName(String sourceName) {
        this.sourceName = sourceName;
    }

    public String getTargetName() {
        return targetName;
    }

    public void setTargetName(String targetName) {
        this.targetName = targetName;
    }

    public String getDependencyType() {
        return dependencyType;
    }

    public void setDependencyType(String dependencyType) {
        this.dependencyType = dependencyType;
    }

    public Criticality getCriticality() {
        return criticality;
    }

    public void setCriticality(Criticality criticality) {
        this.criticality = criticality;
    }
}
