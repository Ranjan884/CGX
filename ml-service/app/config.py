"""
ChangeGuard ML Configuration
Defines hyperparameters, feature definitions, file paths, and classification thresholds.
"""

import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
RESULTS_DIR = BASE_DIR / "results"

DATA_FILE = DATA_DIR / "synthetic_changes.csv"
BEST_MODEL_FILE = MODELS_DIR / "best_model.joblib"
METRICS_FILE = RESULTS_DIR / "metrics.json"
CONFUSION_MATRIX_FILE = RESULTS_DIR / "confusion_matrix.png"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

# Dataset Generation Settings
RANDOM_SEED = 42
NUM_SAMPLES = 2000
TEST_SPLIT_RATIO = 0.20

# Features Definition
NUMERICAL_FEATURES = [
    "change_complexity",
    "dependency_count",
    "dependency_depth",
    "criticality_score",
    "historical_failure_rate",
    "blast_radius_score",
    "critical_services_affected",
    "previous_incidents",
    "service_age",
    "version_change_size"
]

CATEGORICAL_FEATURES = [
    "change_type"
]

ALL_FEATURE_COLUMNS = NUMERICAL_FEATURES + CATEGORICAL_FEATURES
TARGET_COLUMN = "failure"

# Model Classification Threshold
CLASSIFICATION_THRESHOLD = 0.50

# Valid Categories for Change Type
CHANGE_TYPES = [
    "CONFIG_CHANGE",
    "VERSION_UPDATE",
    "DATABASE_CHANGE",
    "API_CHANGE",
    "DEPENDENCY_CHANGE",
    "INFRASTRUCTURE_CHANGE",
    "SECURITY_CHANGE"
]
