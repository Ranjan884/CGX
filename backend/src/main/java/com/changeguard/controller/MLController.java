package com.changeguard.controller;

import com.changeguard.dto.ml.MLHealthResponse;
import com.changeguard.dto.ml.MLPredictionRequest;
import com.changeguard.dto.ml.MLPredictionResponse;
import com.changeguard.service.ml.MLServiceClient;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ml")
@CrossOrigin(origins = "*")
public class MLController {

    private final MLServiceClient mlServiceClient;

    public MLController(MLServiceClient mlServiceClient) {
        this.mlServiceClient = mlServiceClient;
    }

    /**
     * Phase 7 Endpoint: Direct ML Microservice Health Check
     */
    @GetMapping("/health")
    public ResponseEntity<MLHealthResponse> getMLHealth() {
        return ResponseEntity.ok(mlServiceClient.checkHealth());
    }

    /**
     * Phase 7 Endpoint: Direct ML Prediction Inference
     */
    @PostMapping("/predict")
    public ResponseEntity<MLPredictionResponse> predictDirect(@Valid @RequestBody MLPredictionRequest request) {
        MLServiceClient.MLResult result = mlServiceClient.predict(request);
        if (result.getResponse() != null) {
            return ResponseEntity.ok(result.getResponse());
        } else {
            return ResponseEntity.status(503).build();
        }
    }
}
