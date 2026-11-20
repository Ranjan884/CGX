package com.changeguard.model;

import com.changeguard.model.enums.Criticality;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "dependencies", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"source_service_id", "target_service_id"})
})
public class Dependency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Source service is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "source_service_id", nullable = false)
    private ServiceEntity sourceService;

    @NotNull(message = "Target service is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "target_service_id", nullable = false)
    private ServiceEntity targetService;

    @Column(name = "dependency_type", length = 50, nullable = false)
    private String dependencyType = "REST_API";

    @NotNull(message = "Dependency criticality is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Criticality criticality = Criticality.HIGH;

    public Dependency() {
    }

    public Dependency(Long id, ServiceEntity sourceService, ServiceEntity targetService, String dependencyType, Criticality criticality) {
        this.id = id;
        this.sourceService = sourceService;
        this.targetService = targetService;
        this.dependencyType = dependencyType;
        this.criticality = criticality;
    }

    public Dependency(ServiceEntity sourceService, ServiceEntity targetService, String dependencyType, Criticality criticality) {
        this(null, sourceService, targetService, dependencyType, criticality);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ServiceEntity getSourceService() {
        return sourceService;
    }

    public void setSourceService(ServiceEntity sourceService) {
        this.sourceService = sourceService;
    }

    public ServiceEntity getTargetService() {
        return targetService;
    }

    public void setTargetService(ServiceEntity targetService) {
        this.targetService = targetService;
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
