"""
ChangeGuard ML Service - FastAPI Unit & Integration Tests
Uses pytest and FastAPI TestClient to validate endpoints, boundaries, and validation errors.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app, ml_artifacts

client = TestClient(app)

def test_health_endpoint():
    """
    Test 1: Health endpoint returns status UP and verifies model loaded.
    """
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
    assert data["service"] == "ChangeGuard ML Service"
    assert data["modelLoaded"] is True
    assert data["modelType"] is not None

def test_valid_prediction():
    """
    Test 2: Valid prediction with realistic high-risk banking change features.
    """
    payload = {
        "change_complexity": 0.85,
        "dependency_count": 6,
        "dependency_depth": 3,
        "criticality_score": 1.0,
        "historical_failure_rate": 0.25,
        "change_type": "VERSION_UPDATE",
        "blast_radius_score": 80.8,
        "critical_services_affected": 2,
        "previous_incidents": 3,
        "service_age": 36,
        "version_change_size": 1.0
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "failureProbability" in data
    assert 0.0 <= data["failureProbability"] <= 1.0
    assert data["prediction"] in (0, 1)
    assert data["riskLevel"] in ("LOW", "MEDIUM", "HIGH", "CRITICAL")
    assert data["model"] is not None

def test_invalid_feature_range():
    """
    Test 3: Invalid feature range (change_complexity > 1.0) must return HTTP 422.
    """
    payload = {
        "change_complexity": 1.5,  # Exceeds max 1.0
        "dependency_count": 6,
        "dependency_depth": 3,
        "criticality_score": 1.0,
        "historical_failure_rate": 0.25,
        "change_type": "VERSION_UPDATE",
        "blast_radius_score": 80.8,
        "critical_services_affected": 2,
        "previous_incidents": 3,
        "service_age": 36,
        "version_change_size": 1.0
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422

def test_missing_required_feature():
    """
    Test 4: Missing required feature (e.g. blast_radius_score missing) returns HTTP 422.
    """
    payload = {
        "change_complexity": 0.75,
        "dependency_count": 6,
        "dependency_depth": 3,
        "criticality_score": 1.0,
        "historical_failure_rate": 0.25,
        "change_type": "VERSION_UPDATE",
        # blast_radius_score is missing!
        "critical_services_affected": 2,
        "previous_incidents": 3,
        "service_age": 36,
        "version_change_size": 1.0
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422

def test_negative_dependency_count():
    """
    Test 5: Negative dependency count returns HTTP 422.
    """
    payload = {
        "change_complexity": 0.5,
        "dependency_count": -5,  # Negative value
        "dependency_depth": 1,
        "criticality_score": 0.5,
        "historical_failure_rate": 0.1,
        "change_type": "CONFIG_CHANGE",
        "blast_radius_score": 20.0,
        "critical_services_affected": 0,
        "previous_incidents": 0,
        "service_age": 12,
        "version_change_size": 0.1
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422

def test_invalid_change_type():
    """
    Test 6: Invalid categorical value for change_type returns HTTP 422.
    """
    payload = {
        "change_complexity": 0.5,
        "dependency_count": 2,
        "dependency_depth": 1,
        "criticality_score": 0.5,
        "historical_failure_rate": 0.1,
        "change_type": "INVALID_CHANGE_TYPE_XYZ",
        "blast_radius_score": 20.0,
        "critical_services_affected": 0,
        "previous_incidents": 0,
        "service_age": 12,
        "version_change_size": 0.1
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422

def test_model_unavailable():
    """
    Test 7: If model is not loaded, returns HTTP 503 Service Unavailable gracefully.
    """
    original_model = ml_artifacts["model"]
    original_loaded = ml_artifacts["model_loaded"]
    try:
        ml_artifacts["model"] = None
        ml_artifacts["model_loaded"] = False

        payload = {
            "change_complexity": 0.5,
            "dependency_count": 2,
            "dependency_depth": 1,
            "criticality_score": 0.5,
            "historical_failure_rate": 0.1,
            "change_type": "CONFIG_CHANGE",
            "blast_radius_score": 20.0,
            "critical_services_affected": 0,
            "previous_incidents": 0,
            "service_age": 12,
            "version_change_size": 0.1
        }
        response = client.post("/predict", json=payload)
        assert response.status_code == 503
        data = response.json()
        assert "ML model is not available" in str(data)
    finally:
        # Restore model
        ml_artifacts["model"] = original_model
        ml_artifacts["model_loaded"] = original_loaded

def test_prediction_probability_monotonicity():
    """
    Test 8: Prediction probability bounds and relative sanity.
    """
    low_risk_payload = {
        "change_complexity": 0.15,
        "dependency_count": 0,
        "dependency_depth": 0,
        "criticality_score": 0.25,
        "historical_failure_rate": 0.05,
        "change_type": "CONFIG_CHANGE",
        "blast_radius_score": 5.0,
        "critical_services_affected": 0,
        "previous_incidents": 0,
        "service_age": 80,
        "version_change_size": 0.01
    }
    high_risk_payload = {
        "change_complexity": 0.95,
        "dependency_count": 12,
        "dependency_depth": 5,
        "criticality_score": 1.0,
        "historical_failure_rate": 0.50,
        "change_type": "DATABASE_CHANGE",
        "blast_radius_score": 92.0,
        "critical_services_affected": 4,
        "previous_incidents": 6,
        "service_age": 12,
        "version_change_size": 2.0
    }

    res_low = client.post("/predict", json=low_risk_payload).json()
    res_high = client.post("/predict", json=high_risk_payload).json()

    assert 0.0 <= res_low["failureProbability"] <= 1.0
    assert 0.0 <= res_high["failureProbability"] <= 1.0
    assert res_high["failureProbability"] > res_low["failureProbability"]

def test_metrics_endpoint():
    """
    Test 9: Phase 6/10 Metrics endpoint returns JSON.
    """
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert "selected_model" in data

def test_evaluation_endpoint():
    """
    Test 10: Phase 10 Evaluation report endpoint returns valid benchmarking data.
    """
    response = client.get("/evaluation")
    assert response.status_code == 200
    data = response.json()
    assert "experiment_title" in data
    assert "models_benchmarked" in data
    assert "dataset_validation" in data
