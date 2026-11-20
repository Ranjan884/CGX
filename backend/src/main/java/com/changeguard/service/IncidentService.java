package com.changeguard.service;

import com.changeguard.exception.ResourceNotFoundException;
import com.changeguard.model.Incident;
import com.changeguard.model.enums.Severity;
import com.changeguard.repository.IncidentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class IncidentService {

    private final IncidentRepository incidentRepository;

    public IncidentService(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    public Incident getIncidentById(Long id) {
        return incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + id));
    }

    public List<Incident> getIncidentsBySeverity(Severity severity) {
        return incidentRepository.findBySeverity(severity);
    }

    public List<Incident> getFailedIncidents() {
        return incidentRepository.findByFailure(true);
    }
}
