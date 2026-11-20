package com.changeguard.service;

import com.changeguard.exception.ResourceNotFoundException;
import com.changeguard.exception.ValidationException;
import com.changeguard.model.Dependency;
import com.changeguard.model.ServiceEntity;
import com.changeguard.repository.DependencyRepository;
import com.changeguard.repository.ServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class DependencyService {

    private final DependencyRepository dependencyRepository;
    private final ServiceRepository serviceRepository;

    public DependencyService(DependencyRepository dependencyRepository, ServiceRepository serviceRepository) {
        this.dependencyRepository = dependencyRepository;
        this.serviceRepository = serviceRepository;
    }

    public List<Dependency> getAllDependencies() {
        return dependencyRepository.findAll();
    }

    public List<Dependency> getDependenciesBySourceService(Long sourceId) {
        ServiceEntity source = serviceRepository.findById(sourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Source service not found with id: " + sourceId));
        return dependencyRepository.findBySourceService(source);
    }

    @Transactional
    public Dependency createDependency(Long sourceId, Long targetId, String type, com.changeguard.model.enums.Criticality criticality) {
        if (sourceId.equals(targetId)) {
            throw new ValidationException("Source and target service cannot be the same (self-referencing not allowed)");
        }
        ServiceEntity source = serviceRepository.findById(sourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Source service not found with id: " + sourceId));
        ServiceEntity target = serviceRepository.findById(targetId)
                .orElseThrow(() -> new ResourceNotFoundException("Target service not found with id: " + targetId));

        if (dependencyRepository.existsBySourceServiceAndTargetService(source, target)) {
            throw new ValidationException("Dependency relationship already exists between " + source.getName() + " and " + target.getName());
        }

        Dependency dependency = new Dependency(source, target, type != null ? type : "REST_API", criticality);
        return dependencyRepository.save(dependency);
    }
}
