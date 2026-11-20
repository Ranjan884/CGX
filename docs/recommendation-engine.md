# Phase 13: Intelligent Change Recommendation & Decision Support Engine

## 1. Overview & Core Philosophy

ChangeGuard Phase 13 extends the platform from predicting failure probabilities and blast radii to delivering **explainable, actionable advisory recommendations** directly to software engineers, site reliability engineers (SREs), and Change Advisory Boards (CAB).

```
PROPOSED TECHNICAL CHANGE
            ↓
Spring Boot REST API Gateway
            ↓
[Dependency Graph Traversal (BFS/DFS)] ──→ [Blast Radius Engine]
            ↓                                    ↓
[Rule-Based Risk Engine (0-100%)]      [ML Microservice Inference (Random Forest)]
            ↓                                    ↓
[Historical Similarity Evidence]       [What-If Topological Sandbox]
            └─────────────────┬──────────────────┘
                              ↓
              RECOMMENDATION DECISION ENGINE
                              ↓
        EXPLAINABLE ADVISORY ACTIONS & ROLLOUT STRATEGY
                              ↓
          HUMAN ENGINEERING TEAM / CAB DECISION
```

---

## 2. Strict Human-in-the-Loop Governance Boundary

> **MANDATORY SYSTEM DIRECTIVE:**  
> ChangeGuard provides **DECISION SUPPORT ONLY**.  
> The system **NEVER**:
> - Automatically approves changes
> - Automatically rejects changes
> - Automatically deploys software to Kubernetes or cloud infrastructure
> - Automatically executes rollback actions
> - Automatically alters live database schemas or traffic routing

All final deployment permissions remain with authorized engineering personnel.

---

## 3. Decision-Support Action Catalog

The engine formulates structured recommendations across 13 standardized action types:

| Recommendation Type | Typical Trigger Scenario | Advisory Action Generated |
|---|---|---|
| `STAGED_ROLLOUT` | Risk `CRITICAL`, Tier-1 service modified, or $\ge 2$ critical downstream dependencies exposed | Enforce Blue-Green parallel deployment with 5% synthetic smoke transaction gates and mandatory CAB review before cutover |
| `CANARY_ROLLOUT` | Risk `HIGH` or ML failure probability $\ge 0.65$ | Execute phased canary rollout (10% traffic) with automated metric rollback triggers on downstream 5xx errors |
| `STANDARD_DEPLOYMENT` | Risk `LOW`, minimal blast radius, zero Tier-1 critical downstream exposures | Proceed through standard automated CI/CD pipeline with routine health checks |
| `CRITICAL_SERVICE_MONITORING` | $\ge 1$ Tier-1 critical service within downstream blast radius | Arm Prometheus / OpenTelemetry p99 latency and error ratio alerts on all critical downstream systems |
| `ROLLBACK_PREPARATION` | Risk `HIGH` or `CRITICAL` | Validate warm standby container artifacts and confirm database migrations are backwards-compatible |
| `DATABASE_REVIEW` | Change type is `DATABASE_CHANGE` | Audit DDL scripts for exclusive table locks, non-concurrent indexing, and test migration against staging database volume |
| `DEPENDENCY_REVIEW` | Change type is `API_CHANGE` or `DEPENDENCY_CHANGE` | Execute Pact consumer-driven contract test suites against all downstream consumers prior to merge |
| `SECURITY_REVIEW` | Change type is `SECURITY_CHANGE` or Auth microservice modified | Validate token TTL parity, backward-compatible JWT signature support, and mTLS handshake synchronization |
| `HISTORICAL_REVIEW` | Empirical history indicates past outages on similar releases | Review past incident post-mortems and check that current release addresses known failure root causes |
| `OBSERVABILITY_CHECK` | Cascading depth $\ge 3$ layers | Verify W3C distributed traceparent header propagation across all client RPC interfaces |

---

## 4. Multi-Factor Evidence Synthesis

The engine synthesizes findings from:
1. **Deterministic Rule Score ($0.0 - 1.0$)**: Baseline safety thresholds.
2. **Model-Predicted Failure Probability ($0.0 - 1.0$)**: Identifies non-linear multivariate risk interactions.
3. **Topological Blast Radius ($0 - 100$)**: Reachable service count, Tier-1 critical exposures, and propagation hop depths.
4. **Historical Empirical Evidence**: Actual changelog records on the target service and past incident failure rates.
5. **What-If Simulation Sandbox**: Compares baseline blast radius to hypothetical structural link or version updates.

---

## 5. REST API Endpoints

### `POST /api/recommendations/analyze`
Generates comprehensive advisory actions for a proposed change.

#### Sample Request:
```json
{
  "serviceId": 5,
  "changeType": "VERSION_UPDATE",
  "oldVersion": "2.0.0",
  "newVersion": "3.0.0",
  "complexity": "HIGH",
  "description": "Upgrade Payment Service v2 to v3 for ISO20022 compliance"
}
```

#### Sample Response:
```json
{
  "serviceId": 5,
  "serviceName": "Payment Service",
  "serviceCriticality": "CRITICAL",
  "changeType": "VERSION_UPDATE",
  "riskScore": 0.8062,
  "riskPercentage": 81,
  "riskLevel": "CRITICAL",
  "blastRadiusScore": 80.8,
  "affectedServicesCount": 6,
  "criticalServicesAffectedCount": 2,
  "dependencyDepth": 3,
  "mlFailureProbability": 0.8124,
  "mlPrediction": 1,
  "mlStatus": "AVAILABLE",
  "decisionSupportNotice": "ChangeGuard provides analytical decision-support recommendations only. Final deployment decisions, canary gates, and rollback authorization remain strictly with authorized engineering personnel.",
  "dataSupportLevel": "HIGH_DATA_SUPPORT",
  "recommendations": [
    {
      "type": "STAGED_ROLLOUT",
      "title": "Enforce Staged Blue-Green Deployment with Synthetic Smoke Gates",
      "priority": "CRITICAL",
      "reason": "Calculated risk score is 81% and release exposes 2 Tier-1 critical banking service(s) ([Core Banking Service, Transaction Database]). Direct in-place upgrades present unacceptably high outage potential.",
      "suggestedAction": "Deploy in an isolated parallel Blue-Green environment. Route 5% synthetic test transactions for 30 minutes. Require explicit Change Advisory Board (CAB) sign-off prior to traffic cutover.",
      "supportingFactors": [
        "Tier-1 criticality of Payment Service",
        "2 critical downstream service(s) in blast radius",
        "Model-predicted failure probability elevated at 81%"
      ],
      "affectedServices": ["Core Banking Service", "Transaction Database"]
    },
    {
      "type": "CRITICAL_SERVICE_MONITORING",
      "title": "Establish Dedicated Health & Latency Telemetry on Critical Downstream Services",
      "priority": "HIGH",
      "reason": "Release propagates downstream into 2 Tier-1 critical service(s): [Core Banking Service, Transaction Database]. An unhandled exception or latency spike could compromise core banking transactions.",
      "suggestedAction": "Arm Prometheus / OpenTelemetry alerts on p99 latency and HTTP 5xx error ratios for: [Core Banking Service, Transaction Database]",
      "supportingFactors": [
        "Direct or indirect dependency on critical services: [Core Banking Service, Transaction Database]",
        "Blast radius score rated at 80.8/100"
      ],
      "affectedServices": ["Core Banking Service", "Transaction Database"]
    }
  ],
  "historicalEvidence": {
    "status": "AVAILABLE",
    "similarChangesCount": 4,
    "incidentChangesCount": 2,
    "historicalIncidentRate": 0.50,
    "summaryMessage": "Found 4 similar change record(s) on Payment Service (2 incident(s) logged, 50.0% failure rate).",
    "pastIncidentsRootCauses": [
      "API contract breaking change in transaction amount serialization",
      "ML inference latency spike (>1200ms) caused payment gateway timeout cascading"
    ]
  }
}
```

---

## 6. Frontend Interface: `/recommendations`

The Change Recommendations page provides:
1. **Interactive Evaluation Form**: Select microservices, change types, version jumps, and complexity ratings.
2. **Risk & Blast Radius Telemetry**: Live summary cards highlighting risk level, affected nodes, and ML probability.
3. **Structured Advisory Action Cards**: Priority badges (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), clear "Why?" rationales, suggested engineering actions, and supporting decision factors.
4. **Historical Evidence Summary**: Actual incident frequency and past post-mortem root causes to guard against.
