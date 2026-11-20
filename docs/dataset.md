# ChangeGuard — Synthetic Dataset Documentation

## 1. Dataset Provenance & Integrity Statement
- **Origin:** The dataset utilized by ChangeGuard is **100% synthetically generated** using Python probabilistic sampling scripts (`ml-service/app/data_generation.py`).
- **Non-Affiliation Disclaimer:** This dataset contains **no real-world banking customer data, proprietary bank records, or confidential network topologies**.
- **Research Utility:** It provides a reproducible, controlled environment to validate topological dependency analysis, blast-radius formulations, and machine learning classification pipelines.

---

## 2. Statistical Profiles & Feature Distributions

The dataset consists of **2,000 synthetic change records**:
- **Missing Values:** Exactly 0 missing values across all 11 columns.
- **Duplicates:** Exactly 0 duplicate feature vectors.
- **Target Distribution:**
  - `incident_occurred = 0` (Success): 687 records (34.35%)
  - `incident_occurred = 1` (Failure/Incident): 1,313 records (65.65%)

### Feature Summary Statistics ($N=2,000$)
| Feature Name | Min | Max | Mean ($\mu$) | Standard Dev ($\sigma$) |
|:---|:---:|:---:|:---:|:---:|
| `change_complexity` | 0.10 | 0.89 | 0.5008 | 0.1823 |
| `dependency_count` | 0.00 | 15.00 | 4.3690 | 3.6708 |
| `dependency_depth` | 0.00 | 8.00 | 2.4920 | 1.9224 |
| `criticality_score` | 0.25 | 1.00 | 0.5623 | 0.2467 |
| `historical_failure_rate`| 0.00 | 0.90 | 0.2520 | 0.1983 |
| `blast_radius_score` | 0.00 | 98.40 | 38.6415 | 28.9102 |
| `critical_services_affected`| 0.00 | 5.00 | 1.3480 | 1.2514 |
| `previous_incidents` | 0.00 | 10.00 | 2.5110 | 2.1450 |
| `service_age` | 1.00 | 60.00 | 29.8400 | 17.2100 |
| `version_change_size` | 0.10 | 1.00 | 0.4430 | 0.3210 |

---

## 3. Data Synthesis Methodology
The target variable $y$ (incident occurrence) was generated using a latent logistic risk function with nonlinear interaction terms:
$$\text{Logit}(p) = \beta_0 + \beta_1 \cdot \text{Complexity} + \beta_2 \cdot \text{BlastRadius} + \beta_3 \cdot \text{CriticalNodes} + \gamma \cdot (\text{Complexity} \times \text{Criticality}) + \epsilon$$
$$p = \frac{1}{1 + e^{-\text{Logit}(p)}}$$
$$y \sim \text{Bernoulli}(p)$$

Where:
- $\gamma \cdot (\text{Complexity} \times \text{Criticality})$ introduces the realistic enterprise phenomenon that high complexity changes on critical ledger services fail far more frequently than the sum of their individual factors.
- $\epsilon \sim \mathcal{N}(0, 0.15)$ introduces realistic stochastic operational variance (e.g., unexpected network blips, disk I/O contention).

---

## 4. Limitations of the Synthetic Data
1. **Uncorrelated Bernoulli Trials:** Real production incidents frequently cluster during major release cycles, freeze windows, or regional network anomalies.
2. **Absence of Human Organizational Dynamics:** Does not capture engineer shift fatigue, team turnover, or documentation gaps.
3. **Domain Transfer:** While the methodology transfers directly to production microservice architectures, model weights must be retrained on real telemetry before live deployment.
