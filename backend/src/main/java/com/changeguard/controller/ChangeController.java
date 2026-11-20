package com.changeguard.controller;

import com.changeguard.dto.BlastRadiusResponseDto;
import com.changeguard.dto.ChangeRequestDto;
import com.changeguard.dto.RiskPredictionResponseDto;
import com.changeguard.model.Change;
import com.changeguard.service.AuditLogService;
import com.changeguard.service.ChangeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ChangeController {

    private final ChangeService changeService;
    private final AuditLogService auditLogService;

    public ChangeController(ChangeService changeService, AuditLogService auditLogService) {
        this.changeService = changeService;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/changes")
    public ResponseEntity<List<Change>> getAllChanges() {
        return ResponseEntity.ok(changeService.getAllChanges());
    }

    @GetMapping("/changes/{id}")
    public ResponseEntity<Change> getChangeById(@PathVariable Long id) {
        return ResponseEntity.ok(changeService.getChangeById(id));
    }

    @PostMapping("/changes")
    public ResponseEntity<Change> createChange(
            @RequestHeader(value = "X-User-Role", required = false, defaultValue = "ENGINEER") String userRole,
            @Valid @RequestBody ChangeRequestDto dto) {
        if ("VIEWER".equalsIgnoreCase(userRole)) {
            auditLogService.recordAudit("VIEWER", "CHANGE_PROPOSED", "SERVICE", dto.getServiceId(), "DENIED", "Viewer role denied change creation permission");
            throw new SecurityException("VIEWER role has read-only access and cannot propose new changes.");
        }
        Change created = changeService.createChange(dto);
        auditLogService.recordAudit(
                userRole,
                "CHANGE_PROPOSED",
                "CHANGE",
                created.getId(),
                "SUCCESS",
                String.format("Proposed change for service %s: %s (complexity: %d)",
                        created.getService().getName(), created.getDescription(), created.getComplexity())
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/changes/{id}/blast-radius")
    public ResponseEntity<BlastRadiusResponseDto> getBlastRadius(@PathVariable Long id) {
        return ResponseEntity.ok(changeService.getBlastRadiusForChange(id));
    }

    @PostMapping("/risk/predict")
    public ResponseEntity<RiskPredictionResponseDto> predictRisk(@Valid @RequestBody ChangeRequestDto dto) {
        return ResponseEntity.ok(changeService.predictRiskForChange(dto));
    }

    @PostMapping("/simulation/run")
    public ResponseEntity<RiskPredictionResponseDto> runSimulation(@Valid @RequestBody ChangeRequestDto dto) {
        return ResponseEntity.ok(changeService.predictRiskForChange(dto));
    }
}
