"""
ChangeGuard Evaluation Script
Loads the serialized best model artifact and evaluates it strictly on unseen test data.
Does not perform retraining.
"""

import json
import joblib
import pandas as pd
import sys
from pathlib import Path

# Add ml-service root to python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
)

from app.config import (
    DATA_FILE,
    BEST_MODEL_FILE,
    ALL_FEATURE_COLUMNS,
    TARGET_COLUMN,
    RANDOM_SEED,
    TEST_SPLIT_RATIO
)

def evaluate_saved_model():
    print("=" * 70)
    print("ChangeGuard - Independent Model Evaluation Script")
    print("=" * 70)

    if not BEST_MODEL_FILE.exists():
        raise FileNotFoundError(f"Model file not found at: {BEST_MODEL_FILE}. Please run `python app/train.py` first.")

    if not DATA_FILE.exists():
        raise FileNotFoundError(f"Dataset not found at: {DATA_FILE}.")

    print(f"Loading model from:   {BEST_MODEL_FILE}")
    model = joblib.load(BEST_MODEL_FILE)

    print(f"Loading dataset from: {DATA_FILE}")
    df = pd.read_csv(DATA_FILE)

    X = df[ALL_FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    # Exactly replicate the 80/20 unseen test split
    _, X_test, _, y_test = train_test_split(
        X, y,
        test_size=TEST_SPLIT_RATIO,
        random_state=RANDOM_SEED,
        stratify=y
    )

    print(f"Evaluating on {len(X_test)} unseen test samples...")

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    auc = roc_auc_score(y_test, y_prob)

    metrics = {
        "evaluation_dataset_size": len(X_test),
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1": round(float(f1), 4),
        "roc_auc": round(float(auc), 4),
        "confusion_matrix": {
            "true_negatives": int(tn),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_positives": int(tp)
        }
    }

    print("\n" + "=" * 70)
    print("EVALUATION METRICS SUMMARY")
    print("=" * 70)
    print(f"Accuracy:  {metrics['accuracy']:.4f}")
    print(f"Precision: {metrics['precision']:.4f}")
    print(f"Recall:    {metrics['recall']:.4f}  (Critical for change risk failure detection)")
    print(f"F1 Score:  {metrics['f1']:.4f}")
    print(f"ROC-AUC:   {metrics['roc_auc']:.4f}")
    print("-" * 70)
    print("Confusion Matrix Breakdown:")
    print(f"  [TN] True Negatives:  {tn} (Safe change predicted safe)")
    print(f"  [FP] False Positives: {fp} (Safe change flagged as risky)")
    print(f"  [FN] False Negatives: {fn} (Dangerous change missed - critical metric)")
    print(f"  [TP] True Positives:  {tp} (Incident accurately anticipated)")
    print("=" * 70)

    return metrics

if __name__ == "__main__":
    evaluate_saved_model()
