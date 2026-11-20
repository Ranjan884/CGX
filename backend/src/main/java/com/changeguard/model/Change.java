package com.changeguard.model;

import com.changeguard.model.enums.ChangeType;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "changes")
public class Change {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Service reference is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity service;

    @NotNull(message = "Change type must be specified")
    @Enumerated(EnumType.STRING)
    @Column(name = "change_type", nullable = false, length = 50)
    private ChangeType changeType;

    @NotBlank(message = "Description cannot be blank")
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @NotBlank(message = "Old version cannot be blank")
    @Column(name = "old_version", nullable = false, length = 20)
    private String oldVersion;

    @NotBlank(message = "New version cannot be blank")
    @Column(name = "new_version", nullable = false, length = 20)
    private String newVersion;

    @Min(value = 1, message = "Complexity must be at least 1")
    @Max(value = 10, message = "Complexity cannot exceed 10")
    @Column(nullable = false)
    private Integer complexity;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Change() {
    }

    public Change(Long id, ServiceEntity service, ChangeType changeType, String description, 
                  String oldVersion, String newVersion, Integer complexity) {
        this.id = id;
        this.service = service;
        this.changeType = changeType;
        this.description = description;
        this.oldVersion = oldVersion;
        this.newVersion = newVersion;
        this.complexity = complexity;
        this.createdAt = LocalDateTime.now();
    }

    public Change(ServiceEntity service, ChangeType changeType, String description, 
                  String oldVersion, String newVersion, Integer complexity) {
        this(null, service, changeType, description, oldVersion, newVersion, complexity);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ServiceEntity getService() {
        return service;
    }

    public void setService(ServiceEntity service) {
        this.service = service;
    }

    public ChangeType getChangeType() {
        return changeType;
    }

    public void setChangeType(ChangeType changeType) {
        this.changeType = changeType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getOldVersion() {
        return oldVersion;
    }

    public void setOldVersion(String oldVersion) {
        this.oldVersion = oldVersion;
    }

    public String getNewVersion() {
        return newVersion;
    }

    public void setNewVersion(String newVersion) {
        this.newVersion = newVersion;
    }

    public Integer getComplexity() {
        return complexity;
    }

    public void setComplexity(Integer complexity) {
        this.complexity = complexity;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
