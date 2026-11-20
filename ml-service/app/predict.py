"""
ChangeGuard ML Inference Module
Provides probabilistic incident risk prediction for a single proposed change record.
Loads serialized pipeline and evaluates model probability against configurable threshold.
"""

import sys
import os
from pathlib import Path

# Add ml-service root to python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import joblib
import pandas as pd
from typing import Dict, Any, Optional

from app.config import (
    BEST_MODEL_FILE,
    ALL_FEATURE_COLUMNS,
    CLASSIFICATION_THRESHOLD
)

_cached_model = None

def get_model():
    """
    Loads and caches the trained ML pipeline from disk.
    """
    global _cached_model
    if _cached_model is None:
        if not BEST_MODEL_FILE.exists():
            raise FileNotFoundError(
                f"Trained model artifact not found at {BEST_MODEL_FILE}. "
                "Please run `python app/train.py` first."
            )
        _cached_model = joblib.load(BEST_MODEL_FILE)
    return _cached_model

def predict_change(
    features: Dict[str, Any],
    threshold: float = CLASSIFICATION_THRESHOLD
) -> Dict[str, Any]:
    """
    Predicts incident failure probability for a single proposed change.
    
    Returns:
        Dict containing failureProbability, prediction (0/1), riskLevel, and thresholdUsed.
    """
    model = get_model()

    # Create single-row DataFrame ensuring column presence
    row_data = {}
    for col in ALL_FEATURE_COLUMNS:
        if col not in features:
            raise ValueError(f"Missing required feature: '{col}'")
        row_data[col] = [features[col]]

    df_input = pd.DataFrame(row_data)

    # Inference via scikit-learn Pipeline (preprocessing + classifier)
    probabilities = model.predict_proba(df_input)[0]
    failure_prob = float(probabilities[1])
    prediction = 1 if failure_prob >= threshold else 0

    if failure_prob >= 0.80:
        risk_level = "CRITICAL"
    elif failure_prob >= 0.60:
        risk_level = "HIGH"
    elif failure_prob >= 0.30:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return {
        "failureProbability": round(failure_prob, 4),
        "prediction": prediction,
        "riskLevel": risk_level,
        "thresholdUsed": threshold,
        "interpretation": (
            "Elevated probability of post-deployment incident; automated canary/blue-green rollout strongly recommended."
            if prediction == 1 else
            "Low estimated failure probability based on historical change patterns; standard deployment pipeline recommended."
        )
    }

if __name__ == "__main__":
    # Test example
    sample_input = {
        "change_complexity": 0.85,
        "dependency_count": 6,
        "dependency_depth": 3,
        "criticality_score": 1.0,
        "historical_failure_rate": 0.30,
        "change_type": "VERSION_UPDATE",
        "blast_radius_score": 80.8,
        "critical_services_affected": 2,
        "previous_incidents": 3,
        "service_age": 36,
        "version_change_size": 1.0
    }
    print("Testing ML Prediction with Sample High-Risk Payment Service Change:")
    try:
        res = predict_change(sample_input)
        import json
        print(json.dumps(res, indent=2))
    except Exception as e:
        print(f"Error during prediction: {e}")
