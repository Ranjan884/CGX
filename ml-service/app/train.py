"""
ChangeGuard Machine Learning Training Pipeline
Trains, evaluates, and compares Logistic Regression and Random Forest classifiers.
Saves the best model, metrics, and feature importances.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
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
    METRICS_FILE,
    CONFUSION_MATRIX_FILE,
    RANDOM_SEED,
    TEST_SPLIT_RATIO,
    ALL_FEATURE_COLUMNS,
    TARGET_COLUMN,
    NUM_SAMPLES
)
from app.data_generator import generate_synthetic_data, save_and_validate_dataset
from app.preprocessing import create_preprocessor, get_feature_names_after_preprocessing

def run_training_pipeline():
    print("\n" + "=" * 70)
    print("ChangeGuard - Phase 6 Machine Learning Model Training Pipeline")
    print("=" * 70)

    # 1. Dataset Generation & Loading
    if not DATA_FILE.exists():
        print(f"Generating synthetic dataset with {NUM_SAMPLES} samples...")
        records = generate_synthetic_data(num_samples=NUM_SAMPLES, seed=RANDOM_SEED)
        save_and_validate_dataset(records, filepath=str(DATA_FILE))
    else:
        print(f"Loading existing synthetic dataset from: {DATA_FILE}")

    df = pd.read_csv(DATA_FILE)
    print(f"Dataset shape: {df.shape}")
    print(f"Total samples: {len(df)} | Incidents (target=1): {df[TARGET_COLUMN].sum()} ({(df[TARGET_COLUMN].mean()*100):.1f}%)")

    # 2. Train / Test Split (80% Train, 20% Test, Stratified, random_state=42)
    # Using temporal or stratified split; here stratified preserves realistic incident ratio without data leakage
    X = df[ALL_FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=TEST_SPLIT_RATIO,
        random_state=RANDOM_SEED,
        stratify=y
    )

    print(f"Training split: {len(X_train)} samples ({y_train.sum()} incidents)")
    print(f"Testing split:  {len(X_test)} samples ({y_test.sum()} incidents)")

    # 3. Model 1: Logistic Regression Pipeline
    print("\n--- Training Model 1: Logistic Regression ---")
    lr_pipeline = Pipeline([
        ("preprocessor", create_preprocessor()),
        ("classifier", LogisticRegression(max_iter=1000, random_state=RANDOM_SEED))
    ])
    lr_pipeline.fit(X_train, y_train)

    y_pred_lr = lr_pipeline.predict(X_test)
    y_prob_lr = lr_pipeline.predict_proba(X_test)[:, 1]

    cm_lr = confusion_matrix(y_test, y_pred_lr)
    lr_metrics = {
        "model_name": "Logistic Regression",
        "accuracy": round(float(accuracy_score(y_test, y_pred_lr)), 4),
        "precision": round(float(precision_score(y_test, y_pred_lr, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, y_pred_lr, zero_division=0)), 4),
        "f1": round(float(f1_score(y_test, y_pred_lr, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, y_prob_lr)), 4),
        "confusion_matrix": {
            "true_negatives": int(cm_lr[0][0]),
            "false_positives": int(cm_lr[0][1]),
            "false_negatives": int(cm_lr[1][0]),
            "true_positives": int(cm_lr[1][1])
        }
    }

    # 4. Model 2: Random Forest Classifier Pipeline
    print("--- Training Model 2: Random Forest Classifier ---")
    rf_pipeline = Pipeline([
        ("preprocessor", create_preprocessor()),
        ("classifier", RandomForestClassifier(
            n_estimators=100,
            max_depth=6,
            min_samples_split=4,
            random_state=RANDOM_SEED
        ))
    ])
    rf_pipeline.fit(X_train, y_train)

    y_pred_rf = rf_pipeline.predict(X_test)
    y_prob_rf = rf_pipeline.predict_proba(X_test)[:, 1]

    cm_rf = confusion_matrix(y_test, y_pred_rf)
    rf_metrics = {
        "model_name": "Random Forest",
        "accuracy": round(float(accuracy_score(y_test, y_pred_rf)), 4),
        "precision": round(float(precision_score(y_test, y_pred_rf, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, y_pred_rf, zero_division=0)), 4),
        "f1": round(float(f1_score(y_test, y_pred_rf, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, y_prob_rf)), 4),
        "confusion_matrix": {
            "true_negatives": int(cm_rf[0][0]),
            "false_positives": int(cm_rf[0][1]),
            "false_negatives": int(cm_rf[1][0]),
            "true_positives": int(cm_rf[1][1])
        }
    }

    # 5. Extract Feature Importances
    preprocessor = rf_pipeline.named_steps["preprocessor"]
    transformed_feature_names = get_feature_names_after_preprocessing(preprocessor)
    rf_importances = rf_pipeline.named_steps["classifier"].feature_importances_

    feature_importance_list = []
    for name, imp in zip(transformed_feature_names, rf_importances):
        feature_importance_list.append({"feature": name, "importance": round(float(imp), 4)})

    feature_importance_list.sort(key=lambda x: x["importance"], reverse=True)

    # Logistic Regression Coefficients
    lr_coeffs = lr_pipeline.named_steps["classifier"].coef_[0]
    lr_coeff_list = []
    for name, coeff in zip(transformed_feature_names, lr_coeffs):
        lr_coeff_list.append({"feature": name, "coefficient": round(float(coeff), 4)})
    lr_coeff_list.sort(key=lambda x: abs(x["coefficient"]), reverse=True)

    # 6. Model Selection Criterion
    # Selection based on comprehensive evaluation: F1 score + ROC-AUC + Recall (priority to catch incidents)
    lr_composite = lr_metrics["f1"] * 0.4 + lr_metrics["roc_auc"] * 0.3 + lr_metrics["recall"] * 0.3
    rf_composite = rf_metrics["f1"] * 0.4 + rf_metrics["roc_auc"] * 0.3 + rf_metrics["recall"] * 0.3

    if rf_composite >= lr_composite:
        best_model_name = "Random Forest"
        best_pipeline = rf_pipeline
        selection_reason = (
            f"Random Forest selected with composite score {rf_composite:.4f} vs {lr_composite:.4f} "
            f"(F1: {rf_metrics['f1']:.4f}, ROC-AUC: {rf_metrics['roc_auc']:.4f}, Recall: {rf_metrics['recall']:.4f}). "
            f"Offers superior nonlinear decision boundaries for cross-feature interaction."
        )
    else:
        best_model_name = "Logistic Regression"
        best_pipeline = lr_pipeline
        selection_reason = (
            f"Logistic Regression selected with composite score {lr_composite:.4f} vs {rf_composite:.4f}."
        )

    # 7. Model Serialization
    joblib.dump(best_pipeline, BEST_MODEL_FILE)
    print(f"\nSaved Best Model ({best_model_name}) to: {BEST_MODEL_FILE}")

    # 8. Save Metrics & Results
    results_payload = {
        "dataset_metadata": {
            "total_samples": len(df),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "incident_rate_overall": round(float(df[TARGET_COLUMN].mean()), 4),
            "random_seed": RANDOM_SEED
        },
        "selected_model": best_model_name,
        "selection_reason": selection_reason,
        "models": {
            "logistic_regression": lr_metrics,
            "random_forest": rf_metrics
        },
        "feature_importances_random_forest": feature_importance_list[:12],
        "logistic_regression_coefficients": lr_coeff_list[:12]
    }

    with open(METRICS_FILE, "w", encoding="utf-8") as f:
        json.dump(results_payload, f, indent=2)
    print(f"Saved evaluation metrics to: {METRICS_FILE}")

    # 9. Print Comparison Table
    print("\n" + "=" * 70)
    print("MODEL COMPARISON TABLE (Unseen Test Data, n=400)")
    print("=" * 70)
    print(f"{'Model':<22} | {'Accuracy':<8} | {'Precision':<9} | {'Recall':<8} | {'F1':<6} | {'ROC-AUC':<7}")
    print("-" * 70)
    print(f"{'Logistic Regression':<22} | {lr_metrics['accuracy']:<8.4f} | {lr_metrics['precision']:<9.4f} | {lr_metrics['recall']:<8.4f} | {lr_metrics['f1']:<6.4f} | {lr_metrics['roc_auc']:<7.4f}")
    print(f"{'Random Forest':<22} | {rf_metrics['accuracy']:<8.4f} | {rf_metrics['precision']:<9.4f} | {rf_metrics['recall']:<8.4f} | {rf_metrics['f1']:<6.4f} | {rf_metrics['roc_auc']:<7.4f}")
    print("=" * 70)

    print("\nConfusion Matrix - Random Forest:")
    print(f"  True Negatives (TN):  {rf_metrics['confusion_matrix']['true_negatives']} (Correctly predicted safe)")
    print(f"  False Positives (FP): {rf_metrics['confusion_matrix']['false_positives']} (Safe change flagged as risky)")
    print(f"  False Negatives (FN): {rf_metrics['confusion_matrix']['false_negatives']} (Dangerous change missed - critical metric)")
    print(f"  True Positives (TP):  {rf_metrics['confusion_matrix']['true_positives']} (Correctly predicted incident)")

    print("\nTop 5 Most Important Features (Random Forest):")
    for idx, item in enumerate(feature_importance_list[:5], 1):
        print(f"  {idx}. {item['feature']:<30}: {item['importance']:.4f}")

    print("\n" + "=" * 70)
    print(f"RESULT: {best_model_name} successfully serialized and ready for inference.")
    print("=" * 70)

    # Optional plot generation if matplotlib available
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt

        fig, ax = plt.subplots(figsize=(6, 5))
        cax = ax.matshow(cm_rf, cmap=plt.cm.Blues, alpha=0.8)
        for i in range(2):
            for j in range(2):
                ax.text(x=j, y=i, s=cm_rf[i, j], va='center', ha='center', size='xx-large')
        plt.xlabel('Predicted Label', fontsize=12)
        plt.ylabel('True Label', fontsize=12)
        plt.title('Random Forest Confusion Matrix', fontsize=14)
        plt.colorbar(cax)
        fig.tight_layout()
        plt.savefig(CONFUSION_MATRIX_FILE, dpi=150)
        plt.close()
        print(f"Confusion matrix plot saved to: {CONFUSION_MATRIX_FILE}")
    except Exception as e:
        print(f"Note on plot generation: {e}")

    return results_payload

if __name__ == "__main__":
    run_training_pipeline()
