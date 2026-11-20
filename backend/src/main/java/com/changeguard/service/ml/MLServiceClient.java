package com.changeguard.service.ml;

import com.changeguard.dto.ml.MLHealthResponse;
import com.changeguard.dto.ml.MLPredictionRequest;
import com.changeguard.dto.ml.MLPredictionResponse;
import com.changeguard.dto.ml.MLStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.net.SocketTimeoutException;
import java.time.Duration;

/**
 * Phase 7 Service: Spring Boot REST Client for Python FastAPI ML Microservice.
 * 
 * Invokes remote machine learning inference with configurable timeouts,
 * error handling, and circuit fallback to ensure Spring Boot resilience.
 */
@Service
public class MLServiceClient {

    private static final Logger log = LoggerFactory.getLogger(MLServiceClient.class);

    private final RestClient restClient;
    private final String mlServiceUrl;
    private final int timeoutMs;

    public MLServiceClient(
            @Value("${changeguard.ml-service.url:${ml.service.url:http://localhost:8000}}") String mlServiceUrl,
            @Value("${changeguard.ml-service.timeout-ms:3000}") int timeoutMs) {
        this.mlServiceUrl = mlServiceUrl;
        this.timeoutMs = timeoutMs;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofMillis(timeoutMs));
        requestFactory.setReadTimeout(Duration.ofMillis(timeoutMs));

        this.restClient = RestClient.builder()
                .baseUrl(mlServiceUrl)
                .requestFactory(requestFactory)
                .build();

        log.info("Initialized MLServiceClient connecting to {} with timeout {}ms", mlServiceUrl, timeoutMs);
    }

    /**
     * Container class for ML invocation result and status.
     */
    public static class MLResult {
        private final MLPredictionResponse response;
        private final MLStatus status;
        private final String message;

        public MLResult(MLPredictionResponse response, MLStatus status, String message) {
            this.response = response;
            this.status = status;
            this.message = message;
        }

        public MLPredictionResponse getResponse() {
            return response;
        }

        public MLStatus getStatus() {
            return status;
        }

        public String getMessage() {
            return message;
        }
    }

    /**
     * Calls FastAPI POST /predict to obtain failure probability.
     */
    public MLResult predict(MLPredictionRequest request) {
        log.info("Sending prediction request to ML service: change_type={}, complexity={}, blast_radius={}",
                request.getChangeType(), request.getChangeComplexity(), request.getBlastRadiusScore());

        try {
            MLPredictionResponse response = restClient.post()
                    .uri("/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(MLPredictionResponse.class);

            if (response != null) {
                log.info("ML inference successful: prob={}, prediction={}, level={}",
                        response.getFailureProbability(), response.getPrediction(), response.getRiskLevel());
                return new MLResult(response, MLStatus.AVAILABLE, "Inference completed successfully");
            } else {
                log.warn("ML service returned empty body");
                return new MLResult(null, MLStatus.ERROR, "ML service returned empty response");
            }

        } catch (ResourceAccessException ex) {
            if (ex.getCause() instanceof SocketTimeoutException) {
                log.warn("ML service request timed out after {}ms: {}", timeoutMs, ex.getMessage());
                return new MLResult(null, MLStatus.TIMEOUT, "ML inference timed out after " + timeoutMs + "ms");
            } else {
                log.warn("ML service is unavailable at {}: {}", mlServiceUrl, ex.getMessage());
                return new MLResult(null, MLStatus.UNAVAILABLE, "ML service is currently offline or unreachable");
            }
        } catch (RestClientResponseException ex) {
            log.error("ML service returned HTTP error status {}: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            return new MLResult(null, MLStatus.ERROR, "ML service returned error status: " + ex.getStatusCode());
        } catch (Exception ex) {
            log.error("Unexpected error invoking ML service: {}", ex.getMessage(), ex);
            return new MLResult(null, MLStatus.ERROR, "Unexpected error communicating with ML service");
        }
    }

    /**
     * Calls FastAPI GET /health to check service and model liveness.
     */
    public MLHealthResponse checkHealth() {
        try {
            return restClient.get()
                    .uri("/health")
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(MLHealthResponse.class);
        } catch (Exception ex) {
            log.warn("ML service health check failed: {}", ex.getMessage());
            return new MLHealthResponse("DOWN", "ChangeGuard ML Service", false, null, "1.0.0");
        }
    }

    /**
     * Checks if the ML service is reachable and reports UP status.
     */
    public boolean isAvailable() {
        try {
            MLHealthResponse res = checkHealth();
            return res != null && "UP".equalsIgnoreCase(res.getStatus()) && Boolean.TRUE.equals(res.getModelLoaded());
        } catch (Exception e) {
            return false;
        }
    }

    public String getMlServiceUrl() {
        return mlServiceUrl;
    }

    public int getTimeoutMs() {
        return timeoutMs;
    }
}
