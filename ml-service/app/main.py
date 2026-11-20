"""
ChangeGuard - FastAPI Machine Learning Inference Microservice
Serves predictive incident risk scoring using the trained Random Forest pipeline.
"""

import sys
import os
from pathlib import Path
from contextlib import asynccontextmanager

# Add parent directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import joblib
import pandas as pd
import logging

from app.config import BEST_MODEL_FILE, ALL_FEATURE_COLUMNS, CLASSIFICATION_THRESHOLD
from app.schemas import ChangePredictionRequest, PredictionResponse, HealthResponse

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("changeguard-ml")

# Global state for loaded model
ml_artifacts = {
    "model": None,
    "model_loaded": False,
    "model_type": None,
    "version": "1.0"
}

def load_ml_model():
    """
    Loads serialized scikit-learn pipeline from disk into global state.
    """
    if BEST_MODEL_FILE.exists():
        try:
            logger.info("Loading ML model artifact from %s", BEST_MODEL_FILE)
            model = joblib.load(BEST_MODEL_FILE)
            ml_artifacts["model"] = model
            ml_artifacts["model_loaded"] = True
            
            # Determine classifier type from pipeline if available
            if hasattr(model, "named_steps") and "classifier" in model.named_steps:
                ml_artifacts["model_type"] = type(model.named_steps["classifier"]).__name__
            else:
                ml_artifacts["model_type"] = type(model).__name__
                
            logger.info("ML model successfully loaded into memory (Type: %s)", ml_artifacts["model_type"])
        except Exception as e:
            logger.error("Failed to deserialize model from %s: %s", BEST_MODEL_FILE, e, exc_info=True)
            ml_artifacts["model"] = None
            ml_artifacts["model_loaded"] = False
            ml_artifacts["model_type"] = None
    else:
        logger.warning("Model file not found at %s. Inference requests will fail until trained.", BEST_MODEL_FILE)
        ml_artifacts["model"] = None
        ml_artifacts["model_loaded"] = False
        ml_artifacts["model_type"] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure ML model loaded into memory
    if not ml_artifacts["model_loaded"]:
        load_ml_model()
    yield
    # Shutdown cleanup if needed
    logger.info("Shutting down ChangeGuard ML Service")

# Eagerly load model on import as well so test clients and standalone scripts have it ready
load_ml_model()

app = FastAPI(
    title="ChangeGuard ML Service",
    description="Predictive IT Change Incident Risk Machine Learning Service",
    version="1.0.0",
    lifespan=lifespan
)

# Minimal configurable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error processing %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "ML Inference Error",
            "message": "An error occurred during machine learning evaluation."
        }
    )

@app.get("/health", response_model=HealthResponse)
def health_check():
    """
    Health check endpoint: verifies service liveness and model availability.
    """
    return HealthResponse(
        status="UP",
        service="ChangeGuard ML Service",
        modelLoaded=ml_artifacts["model_loaded"],
        modelType=ml_artifacts["model_type"],
        version="1.0.0"
    )

@app.post("/predict", response_model=PredictionResponse)
def predict_change_risk(req: ChangePredictionRequest):
    """
    Executes real-time inference using the serialized pipeline on a single proposed change.
    """
    model = ml_artifacts["model"]
    if model is None or not ml_artifacts["model_loaded"]:
        logger.error("Predict called but ML model is not available in memory")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "ML model is not available",
                "message": "The predictive model artifact is not loaded on this server."
            }
        )

    try:
        # Prepare single-row DataFrame using exact feature names
        input_dict = {
            "change_complexity": [req.change_complexity],
            "dependency_count": [req.dependency_count],
            "dependency_depth": [req.dependency_depth],
            "criticality_score": [req.criticality_score],
            "historical_failure_rate": [req.historical_failure_rate],
            "change_type": [req.change_type],
            "blast_radius_score": [req.blast_radius_score],
            "critical_services_affected": [req.critical_services_affected],
            "previous_incidents": [req.previous_incidents],
            "service_age": [req.service_age],
            "version_change_size": [req.version_change_size]
        }
        df_input = pd.DataFrame(input_dict)

        # Scikit-learn Pipeline handles OneHotEncoding + StandardScaler + Random Forest inference
        probabilities = model.predict_proba(df_input)[0]
        failure_prob = float(probabilities[1])
        prediction = 1 if failure_prob >= CLASSIFICATION_THRESHOLD else 0

        # Qualitative Risk Level classification
        if failure_prob >= 0.80:
            risk_level = "CRITICAL"
        elif failure_prob >= 0.60:
            risk_level = "HIGH"
        elif failure_prob >= 0.30:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        logger.info(
            "Change prediction evaluated: type=%s, complexity=%.2f, blast=%.1f -> prob=%.4f (%s)",
            req.change_type, req.change_complexity, req.blast_radius_score, failure_prob, risk_level
        )

        return PredictionResponse(
            failureProbability=round(failure_prob, 4),
            prediction=prediction,
            riskLevel=risk_level,
            model=ml_artifacts["model_type"] or "RandomForest",
            modelVersion=ml_artifacts["version"]
        )

    except Exception as e:
        logger.error("Prediction inference failed: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Prediction Error",
                "message": "Failed to execute inference on provided feature vectors."
            }
        )

@app.get("/metrics")
def get_model_metrics():
    """
    Returns the Phase 6 / Phase 10 model metrics and confusion matrix.
    """
    from app.config import METRICS_FILE
    import json
    if METRICS_FILE.exists():
        with open(METRICS_FILE, "r") as f:
            return json.load(f)
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Metrics file not found. Run training/evaluation pipeline."
    )

@app.get("/evaluation")
def get_evaluation_report():
    """
    Returns the comprehensive Phase 10 validation and research evaluation report.
    """
    from app.config import RESULTS_DIR
    import json
    eval_file = RESULTS_DIR / "final_evaluation.json"
    if eval_file.exists():
        with open(eval_file, "r") as f:
            return json.load(f)
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Evaluation report not found. Run `python app/experiment_evaluation.py`."
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
