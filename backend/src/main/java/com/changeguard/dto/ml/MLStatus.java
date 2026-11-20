package com.changeguard.dto.ml;

/**
 * Indicates the operational availability status of the external Python FastAPI ML Service.
 */
public enum MLStatus {
    AVAILABLE,
    UNAVAILABLE,
    TIMEOUT,
    ERROR
}
