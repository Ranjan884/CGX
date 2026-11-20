package com.changeguard.model;

import com.changeguard.model.enums.Criticality;
import com.changeguard.model.enums.ServiceStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "services")
public class ServiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Service name is required and cannot be blank")
    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @NotBlank(message = "Service type is required")
    @Column(nullable = false, length = 50)
    private String type;

    @NotNull(message = "Service criticality must be specified")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Criticality criticality;

    @NotBlank(message = "Service version is required")
    @Column(nullable = false, length = 20)
    private String version;

    @NotNull(message = "Service status must be specified")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ServiceStatus status = ServiceStatus.ACTIVE;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ServiceEntity() {
    }

    public ServiceEntity(Long id, String name, String type, Criticality criticality, String version, ServiceStatus status) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.criticality = criticality;
        this.version = version;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }

    public ServiceEntity(String name, String type, Criticality criticality, String version, ServiceStatus status) {
        this(null, name, type, criticality, version, status);
    }

    // Getters and Setters
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

    public ServiceStatus getStatus() {
        return status;
    }

    public void setStatus(ServiceStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
