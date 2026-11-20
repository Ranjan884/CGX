# ChangeGuard — Empirical Model Comparison

This document records the exact, reproducible empirical evaluation results comparing the two classifiers on the 400-sample test set (`seed=42`).

---

## 1. Primary Classification Performance Comparison

| Metric | Logistic Regression (Baseline) | Random Forest (Selected Model) | Preferred Model |
|:---|:---:|:---:|:---:|
| **Accuracy** | 0.8025 (80.25%) | **0.8075 (80.75%)** | Random Forest |
| **Precision** | **0.8407 (84.07%)** | 0.8298 (82.98%) | Logistic Regression |
| **Recall (Sensitivity)** | 0.8631 (86.31%) | **0.8897 (88.97%)** | **Random Forest** (Critical for Outages) |
| **F1-Score** | 0.8518 | **0.8587** | Random Forest |
| **ROC-AUC** | **0.8477** | 0.8441 | Logistic Regression |
| **Single-Sample Inference Latency** | **2.35 ms** | 7.48 ms | Logistic Regression |
| **Total Test Incidents ($N=263$)** | 227 Caught / 36 Missed | **234 Caught / 29 Missed** | Random Forest |

---

## 2. Confusion Matrices (Test Set, $N=400$)

### Logistic Regression
| | Predicted: No Incident ($y=0$) | Predicted: Incident ($y=1$) | Total |
|:---|:---:|:---:|:---:|
| **Actual: No Incident ($y=0$)** | **94** (True Negative) | **43** (False Positive) | 137 |
| **Actual: Incident ($y=1$)** | **36** (False Negative) | **227** (True Positive) | 263 |
| **Total** | 130 | 270 | 400 |

### Random Forest (Selected Model)
| | Predicted: No Incident ($y=0$) | Predicted: Incident ($y=1$) | Total |
|:---|:---:|:---:|:---:|
| **Actual: No Incident ($y=0$)** | **89** (True Negative) | **48** (False Positive) | 137 |
| **Actual: Incident ($y=1$)** | **29** (False Negative) | **234** (True Positive) | 263 |
| **Total** | 118 | 282 | 400 |

*Key Takeaway:* Random Forest prevented **7 additional catastrophic incidents** (reducing False Negatives from 36 to 29) at the minor expense of 5 additional False Positives. In enterprise banking change risk, this tradeoff is strongly favored.

---

## 3. Random Forest Feature Importance Ranking (Gini Impurity)

| Rank | Feature Name | Gini Importance | Relative Contribution |
|:---:|:---|:---:|:---|
| **1** | `blast_radius_score` | **0.2196 (21.96%)** | Primary risk driver; overall topological reachability |
| **2** | `critical_services_affected` | **0.1657 (16.57%)** | Core banking & payment tier exposure |
| **3** | `dependency_count` | **0.1312 (13.12%)** | Direct fan-out degree |
| **4** | `change_complexity` | **0.0932 (9.32%)** | Code/schema structural complexity |
| **5** | `criticality_score` | **0.0766 (7.66%)** | Originating service criticality rating |
| **6** | `dependency_depth` | **0.0636 (6.36%)** | Multi-hop downstream propagation |
| **7** | `service_age` | **0.0624 (6.24%)** | Legacy system fragility indicator |
| **8** | `historical_failure_rate` | **0.0601 (6.01%)** | Historical track record of service stability |
| **9** | `version_change_size` | **0.0564 (5.64%)** | Major vs. minor version jump |
| **10** | `previous_incidents` | **0.0268 (2.68%)** | Service incident frequency |
| **11** | `change_type` | **0.0444 (4.44%)** | Categorical change classification |

---

## 4. Operational Classification Threshold Analysis (Random Forest)

| Threshold ($\tau$) | Accuracy | Precision | Recall | F1-Score | Use Case |
|:---:|:---:|:---:|:---:|:---:|:---|
| **0.30** | 0.6975 | 0.6850 | **0.9924** | 0.8105 | Hyper-strict Tier-1 freeze periods (zero outages allowed) |
| **0.50 (Default)** | **0.8075** | **0.8298** | **0.8897** | **0.8587** | **Balanced operational baseline** |
| **0.60** | 0.6125 | 0.9038 | 0.3574 | 0.5123 | Low-criticality batch jobs / internal utilities |
| **0.70** | 0.4100 | 0.9655 | 0.1065 | 0.1918 | Extreme precision required; flags only near-certain disasters |
