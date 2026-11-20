package com.changeguard.dto.ml;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class MLHealthResponse {

    private String status;
    private String service;
    private Boolean modelLoaded;
    private String modelType;
    private String version;

    public MLHealthResponse() {
    }

    public MLHealthResponse(String status, String service, Boolean modelLoaded, String modelType, String version) {
        this.status = status;
        this.service = service;
        this.modelLoaded = modelLoaded;
        this.modelType = modelType;
        this.version = version;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public Boolean getModelLoaded() {
        return modelLoaded;
    }

    public void setModelLoaded(Boolean modelLoaded) {
        this.modelLoaded = modelLoaded;
    }

    public String getModelType() {
        return modelType;
    }

    public void setModelType(String modelType) {
        this.modelType = modelType;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }
}
