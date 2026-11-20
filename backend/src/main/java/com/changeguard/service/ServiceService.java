package com.changeguard.service;

import com.changeguard.exception.ResourceNotFoundException;
import com.changeguard.exception.ValidationException;
import com.changeguard.model.ServiceEntity;
import com.changeguard.model.enums.Criticality;
import com.changeguard.repository.ServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ServiceService {

    private final ServiceRepository serviceRepository;

    public ServiceService(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    public List<ServiceEntity> getAllServices() {
        return serviceRepository.findAll();
    }

    public ServiceEntity getServiceById(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
    }

    public List<ServiceEntity> getServicesByCriticality(String criticalityStr) {
        try {
            Criticality criticality = Criticality.valueOf(criticalityStr.toUpperCase());
            return serviceRepository.findByCriticality(criticality);
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid criticality: " + criticalityStr + ". Allowed: LOW, MEDIUM, HIGH, CRITICAL");
        }
    }

    @Transactional
    public ServiceEntity createService(ServiceEntity service) {
        if (serviceRepository.existsByName(service.getName())) {
            throw new ValidationException("Service already exists with name: " + service.getName());
        }
        return serviceRepository.save(service);
    }
}
