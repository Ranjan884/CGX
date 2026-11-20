package com.changeguard.service;

import com.changeguard.dto.BlastRadiusResponseDto;
import com.changeguard.dto.ChangeRequestDto;
import com.changeguard.dto.RiskPredictionResponseDto;
import com.changeguard.exception.ResourceNotFoundException;
import com.changeguard.exception.ValidationException;
import com.changeguard.model.Change;
import com.changeguard.model.ServiceEntity;
import com.changeguard.repository.ChangeRepository;
import com.changeguard.repository.ServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ChangeService {

    private final ChangeRepository changeRepository;
    private final ServiceRepository serviceRepository;
    private final BlastRadiusEngine blastRadiusEngine;
    private final RuleBasedRiskEngine ruleBasedRiskEngine;

    public ChangeService(ChangeRepository changeRepository,
                         ServiceRepository serviceRepository,
                         BlastRadiusEngine blastRadiusEngine,
                         RuleBasedRiskEngine ruleBasedRiskEngine) {
        this.changeRepository = changeRepository;
        this.serviceRepository = serviceRepository;
        this.blastRadiusEngine = blastRadiusEngine;
        this.ruleBasedRiskEngine = ruleBasedRiskEngine;
    }

    public List<Change> getAllChanges() {
        return changeRepository.findAll();
    }

    public Change getChangeById(Long id) {
        return changeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Change record not found with id: " + id));
    }

    @Transactional
    public Change createChange(ChangeRequestDto dto) {
        if (dto.getOldVersion().trim().equalsIgnoreCase(dto.getNewVersion().trim())) {
            throw new ValidationException("New version must be different from old version");
        }

        ServiceEntity service = serviceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + dto.getServiceId()));

        Change change = new Change(
                service,
                dto.getChangeType(),
                dto.getDescription(),
                dto.getOldVersion(),
                dto.getNewVersion(),
                dto.getComplexity()
        );

        return changeRepository.save(change);
    }

    public BlastRadiusResponseDto getBlastRadiusForChange(Long changeId) {
        Change change = getChangeById(changeId);
        return blastRadiusEngine.calculateBlastRadius(change.getService().getId());
    }

    public RiskPredictionResponseDto predictRiskForChange(ChangeRequestDto dto) {
        ServiceEntity service = serviceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + dto.getServiceId()));
        return ruleBasedRiskEngine.evaluateRisk(service, dto.getChangeType(), dto.getComplexity());
    }
}
