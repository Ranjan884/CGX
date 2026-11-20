# ChangeGuard — Machine Learning Documentation

## 1. Problem Formulation
- **Objective:** Predict whether a proposed technical IT change will result in a deployment failure or operational incident.
- **Problem Type:** Supervised Binary Classification.
- **Target Variable ($y$):** `incident_occurred` (Binary: `0` = Successful Change, `1` = Incident / Outage Occurred).

---

## 2. Dataset Overview
- **Data Nature:** **100% Synthetic Data** generated with mathematical heuristics simulating a banking microservice environment.
- **Total Records:** 2,000 records.
- **Train / Test Partition:**
  - Training Set: 1,600 samples (80.0%)
  - Test Set: 400 samples (20.0%)
  - Stratification: Random seed fixed at `42` (`random_state=42`) for exact reproducibility.
- **Class Distribution:**
  - Successful Changes ($y=0$): 687 (34.35%)
  - Failed Changes ($y=1$): 1,313 (65.65%)
  - Test Set Class Balance: 137 class 0, 263 class 1.
- **Missing / Duplicate Data:** 0 missing values; 0 duplicate records.

---

## 3. Feature Set (11 Input Dimensions)

| Feature Name | Type | Range / Domain | Engineering Description |
|:---|:---|:---|:---|
| `change_complexity` | Float | 0.10 – 0.89 | Normalized complexity score of the code/infrastructure shift |
| `dependency_count` | Integer | 0 – 15 | Number of direct outbound service dependencies |
| `dependency_depth` | Integer | 0 – 8 | Maximum downstream graph traversal depth |
| `criticality_score` | Float | 0.25 – 1.00 | Tier weight of originating service (Low=0.25, Crit=1.0) |
| `historical_failure_rate`| Float | 0.00 – 1.00 | Ratio of past failed deployments for the originating service |
| `blast_radius_score` | Float | 0.0 – 100.0 | Graph reachability blast-radius score |
| `critical_services_affected`| Integer | 0 – 5 | Number of reachable Tier-1 Critical services |
| `previous_incidents` | Integer | 0 – 10 | Count of past incidents associated with the service |
| `service_age` | Integer | 1 – 60 | Service maturity in months |
| `version_change_size` | Float | 0.0 – 1.0 | Magnitude of version increment (patch=0.1, major=1.0) |
| `change_type` | Categorical | 6 categories | `API_CHANGE`, `DATABASE_CHANGE`, `CONFIG_CHANGE`, `LIBRARY_UPDATE`, `VERSION_UPDATE`, `INFRASTRUCTURE_CHANGE` |

---

## 4. Evaluated Models

### 1. Baseline: Logistic Regression
- **Hyperparameters:** `solver='lbfgs'`, `max_iter=1000`, `random_state=42`.
- **Characteristics:** Fast, convex linear baseline; estimates log-odds of incident occurrence.

### 2. Primary: Random Forest Classifier
- **Hyperparameters:** `n_estimators=100`, `max_depth=12`, `random_state=42`.
- **Characteristics:** Non-parametric ensemble of decision trees; captures nonlinear thresholds and multi-feature cross-interactions.

---

## 5. Model Selection Justification
Random Forest was selected as the operational model artifact (`random_forest_pipeline.joblib`) because:
1. **Higher Recall for Incident Prevention:** In a banking risk context, False Negatives (deploying an outage-causing change unflagged) are far more dangerous than False Positives. Random Forest achieved **88.97% Recall** (identifying 234 of 263 incidents) versus 86.31% for Logistic Regression.
2. **Superior F1 and Accuracy:** Random Forest demonstrated higher overall accuracy (80.75% vs. 80.25%) and F1-score (0.8587 vs. 0.8518).
3. **Low Latency:** Single-sample inference executes in **7.48 ms**, well within production CI/CD SLA constraints (<100 ms).
