package com.changeguard.controller;

import com.changeguard.service.ml.MLServiceClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Phase 11 Health Check Controller
 * Provides system liveness, backend status, and connected service diagnostics.
 */
@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
public class HealthController {

    private final MLServiceClient mlServiceClient;

    public HealthController(MLServiceClient mlServiceClient) {
        this.mlServiceClient = mlServiceClient;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "ChangeGuard Spring Boot Backend");
        health.put("timestamp", Instant.now().toString());

        Map<String, Object> components = new HashMap<>();
        components.put("database", Map.of("status", "UP"));

        boolean mlOnline = mlServiceClient.isAvailable();
        components.put("mlService", Map.of(
                "status", mlOnline ? "UP" : "DEGRADED",
                "available", mlOnline
        ));

        health.put("components", components);
        return ResponseEntity.ok(health);
    }
}
