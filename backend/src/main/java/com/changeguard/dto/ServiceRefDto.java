package com.changeguard.dto;

import com.changeguard.model.enums.Criticality;

public class ServiceRefDto {
    private Long id;
    private String name;
    private String type;
    private Criticality criticality;
    private String version;

    public ServiceRefDto() {
    }

    public ServiceRefDto(Long id, String name, String type, Criticality criticality, String version) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.criticality = criticality;
        this.version = version;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Criticality getCriticality() {
        return criticality;
    }

    public void setCriticality(Criticality criticality) {
        this.criticality = criticality;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }
}
