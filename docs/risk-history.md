# Phase 12: Continuous Change Monitoring & Risk History Specification

## 1. Overview & Objective

ChangeGuard Phase 12 extends the platform from single-event change evaluation into a continuous lifecycle platform:
$$\text{PREDICT} \longrightarrow \text{DEPLOY / OBSERVE} \longrightarrow \text{RECORD OUTCOME} \longrightarrow \text{COMPARE} \longrightarrow \text{ANALYZE HISTORY}$$

When technical releases are evaluated in Phase 5 & 7 (`POST /api/risk/analyze`), the resulting rule risk, blast radius, and ML predictions are systematically persisted into the `risk_analysis_history` table. As releases are deployed to production, operators record the observed outcome (`PATCH /api/risk-history/{id}/outcome`).

---

## 2. Database Schema: `risk_analysis_history`

```sql
CREATE TABLE risk_analysis_history (
    id SERIAL PRIMARY KEY,
    change_id INTEGER REFERENCES changes(id) ON DELETE SET NULL,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    risk_score DOUBLE PRECISION NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    blast_radius_score DOUBLE PRECISION NOT NULL,
    affected_services_count INTEGER NOT NULL,
    critical_services_affected INTEGER NOT NULL,
    dependency_depth INTEGER NOT NULL,
    ml_failure_probability DOUBLE PRECISION,
    ml_prediction INTEGER,
    ml_model_version VARCHAR(30),
    analysis_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actual_incident BOOLEAN,
    actual_incident_severity VARCHAR(20) CHECK (actual_incident_severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    outcome_updated_at TIMESTAMP WITH TIME ZONE
);
```

### Indexed Columns:
- `service_id`, `change_id`, `analysis_timestamp`, `risk_level`, `actual_incident`

---

## 3. Handling Null & Unknown Values

1. **At Analysis Time**:
   - `actual_incident = NULL`
   - `actual_incident_severity = NULL`
   - `outcome_updated_at = NULL`
2. **When ML Inference is Offline or Degraded**:
   - `ml_failure_probability = NULL`
   - `ml_prediction = NULL`
3. **Important Distinction**:
   - `UNKNOWN` is never treated as `NO_INCIDENT` or $0.0$.
   - The platform strictly isolates pending/unverified releases from confirmed safe deployments.

---

## 4. Outcome Classification Logic

When `actual_incident` is recorded, the prediction is classified:

| ML Prediction ($1$=Failure, $0$=Safe) | Actual Incident ($y=1$ vs $y=0$) | Outcome Classification | Operational Meaning |
|---|---|---|---|
| **$1$ (Failure)** | `TRUE` | `TRUE_POSITIVE` | Incident correctly anticipated pre-deploy |
| **$0$ (Safe)** | `FALSE` | `TRUE_NEGATIVE` | Safe change permitted without interruption |
| **$1$ (Failure)** | `FALSE` | `FALSE_POSITIVE` | Safe change routed to unnecessary review buffer |
| **$0$ (Safe)** | `TRUE` | `FALSE_NEGATIVE` | Uncaught incident that reached production |
| **NULL** | `NULL` | `UNKNOWN` | Awaiting deployment or offline ML inference |

---

## 5. Continuous Risk History REST APIs

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/risk-history` | Retrieve all historical evaluations in descending chronological order |
| `GET` | `/api/risk-history/{id}` | Retrieve detailed single risk history record |
| `GET` | `/api/risk-history/service/{serviceId}` | Retrieve all evaluations for a specific microservice |
| `PATCH` | `/api/risk-history/{id}/outcome` | Record confirmed deployment outcome (`actualIncident: true/false`) |
| `GET` | `/api/risk-history/high-risk-services` | Rank services repeatedly appearing in high-risk releases |
| `GET` | `/api/risk-history/trends` | Historical daily risk trajectory and incident volume |
| `GET` | `/api/risk-history/ml-performance` | Compute realized ML accuracy & confusion metrics from confirmed outcomes |

---

## 6. Insufficient Data Guardrail

When calculating historical ML performance (`GET /api/risk-history/ml-performance`), if the count of labeled outcomes is below the configurable threshold (`min-labeled-samples`, default: `10` or `5` in dev):

```json
{
  "status": "NOT_ENOUGH_DATA",
  "labeledSamples": 3,
  "minRequiredSamples": 10,
  "message": "Only 3 labeled historical outcome(s) recorded. A minimum of 10 labeled outcomes are required to calculate statistically reliable prediction performance metrics."
}
```
*The platform will never report 0% or misleading metrics when sample counts are insufficient.*

---

## 7. Frontend Interface: `/risk-history`

The dedicated Risk History Dashboard provides:
1. **Summary Metrics**: Total analyses, high-risk counts, known incidents, and ground-truth sample count.
2. **Historical Risk Trend Chart**: Visual time-series of average risk scores and incident frequency.
3. **ML Prediction Fidelity Card**: Realized accuracy, precision, recall, and confusion breakdown with insufficient-data warnings.
4. **High-Risk Services Table**: Realized failure frequencies by service tier.
5. **Interactive Changelog**: Filterable by service, risk tier, and outcome classification, with a modal to record deployment outcomes.
