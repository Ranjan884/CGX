package com.changeguard.controller;

import com.changeguard.dto.BlastRadiusAnalyzeRequest;
import com.changeguard.dto.BlastRadiusResultDto;
import com.changeguard.dto.ChangeBlastRadiusDto;
import com.changeguard.service.BlastRadiusService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/blast-radius")
@CrossOrigin(origins = "*")
public class BlastRadiusController {

    private final BlastRadiusService blastRadiusService;

    public BlastRadiusController(BlastRadiusService blastRadiusService) {
        this.blastRadiusService = blastRadiusService;
    }

    /**
     * Phase 4 Endpoint: Analyze Blast Radius for a Microservice by ID
     */
    @GetMapping("/service/{serviceId}")
    public ResponseEntity<BlastRadiusResultDto> getBlastRadiusByService(@PathVariable Long serviceId) {
        return ResponseEntity.ok(blastRadiusService.analyzeBlastRadius(serviceId));
    }

    /**
     * Phase 4 Endpoint: Analyze Blast Radius for a specific Change record
     */
    @GetMapping("/change/{changeId}")
    public ResponseEntity<ChangeBlastRadiusDto> getBlastRadiusByChange(@PathVariable Long changeId) {
        return ResponseEntity.ok(blastRadiusService.analyzeBlastRadiusForChange(changeId));
    }

    /**
     * Phase 4 Endpoint: Analyze Blast Radius via POST payload
     */
    @PostMapping("/analyze")
    public ResponseEntity<BlastRadiusResultDto> analyzeBlastRadiusPost(@Valid @RequestBody BlastRadiusAnalyzeRequest request) {
        return ResponseEntity.ok(blastRadiusService.analyzeBlastRadius(request.getServiceId()));
    }
}
