package com.changeguard.controller;

import com.changeguard.model.Incident;
import com.changeguard.model.enums.Severity;
import com.changeguard.service.IncidentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = "*")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @GetMapping
    public ResponseEntity<List<Incident>> getAllIncidents() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incident> getIncidentById(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getIncidentById(id));
    }

    @GetMapping("/severity/{severity}")
    public ResponseEntity<List<Incident>> getIncidentsBySeverity(@PathVariable String severity) {
        return ResponseEntity.ok(incidentService.getIncidentsBySeverity(Severity.valueOf(severity.toUpperCase())));
    }

    @GetMapping("/failed")
    public ResponseEntity<List<Incident>> getFailedIncidents() {
        return ResponseEntity.ok(incidentService.getFailedIncidents());
    }
}
