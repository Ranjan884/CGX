<<<<<<< HEAD
# CHANGEGUARD 🛡️
### Predictive IT Change Risk & Blast-Radius Platform for Banking Systems

A production-grade research and portfolio platform that analyzes proposed technical changes in simulated core banking microservices **BEFORE deployment**, predicts incident failure probability, traverses downstream microservice blast radiuses using Graph BFS/DFS, provides evidence-based explanations, and recommends automated rollout strategies (Normal, Canary, Blue-Green).

> **Important Scope Note:** ChangeGuard is built as an academic and portfolio platform using simulated banking infrastructure and synthetic incident data. It is designed to evaluate predictive change-risk layers without exposing real customer or banking records.

---

## 🏛️ Architecture & Decision Pipeline

Existing banking IT operations feature CI/CD, change management (CAB), monitoring, and rollback hooks. ChangeGuard adds a **predictive intelligence layer** directly before deployment staging:

```
PROPOSED TECHNICAL CHANGE
  (Service, Type, Old/New Version, Complexity)
              ↓
  MICROSERVICE DEPENDENCY ENGINE (Phase 3)
              ↓
  BLAST-RADIUS GRAPH TRAVERSAL & DEPTH ENGINE (Phase 4)
  (Identifies Direct, Indirect, Depth, & Critical Systems)
              ↓
  RULE-BASED RISK ENGINE (Phase 5)
  (Multi-factor weighted evaluation, 0-100% score, dynamic explanation)
              ↓
  EVIDENCE-BASED EXPLANATION ENGINE
              ↓
  WHAT-IF TOPOLOGY SIMULATION
              ↓
  DEPLOYMENT DECISION SUPPORT
  (Normal CI/CD vs Canary vs Blue-Green Isolated Rollout)
```

---

## 📁 Project Structure

```
changeguard/
├── backend/                  # Java 17 + Spring Boot 3.2.4 REST API Backend
│   ├── pom.xml               # Maven configuration (Web, Data JPA, Postgres, Validation)
│   ├── src/main/java/com/changeguard/
│   │   ├── ChangeGuardApplication.java   # Spring Boot entry point
│   │   ├── config/                       # Risk configuration & database seeder
│   │   ├── controller/                   # REST controllers (Services, Deps, Risk, BlastRadius, Simulation, Health, ML)
│   │   ├── dto/                          # Clean API request/response DTOs
│   │   ├── exception/                    # Global exception handling & structured JSON error responses
│   │   ├── model/                        # JPA Entities (ServiceEntity, Dependency, Change, Incident)
│   │   ├── repository/                   # Spring Data JPA interfaces
│   │   └── service/                      # Core business engines (Graph, BlastRadius, RuleRisk, WhatIf, MLClient)
│   └── src/test/java/com/changeguard/    # Unit and integration test suites
├── ml-service/               # Python FastAPI Machine Learning Inference Microservice
│   ├── requirements.txt      # Dependencies (fastapi, scikit-learn, pandas, joblib)
│   ├── app/                  # FastAPI app (main.py, schemas.py, predict.py, train.py)
│   ├── models/               # Serialized pipelines (pipeline_random_forest.joblib)
│   ├── tests/                # Automated API and inference test suite
│   └── results/              # Phase 10 evaluation benchmarks & figures
├── database/                 # PostgreSQL Relational Schemas
│   ├── 01_schema.sql         # DDL table creation and relational constraints
│   └── 02_seed.sql           # Seed records (11 banking microservices, 13 dependencies)
├── docs/                     # Comprehensive Phase 11 Documentation
│   ├── architecture.md       # Multi-tier system architecture and communication diagrams
│   ├── setup.md              # Prerequisites and step-by-step local & Docker setup
│   ├── api-documentation.md  # Detailed REST API endpoint specification
│   ├── deployment.md         # Production deployment, Nginx proxy, and SSL configuration
│   ├── presentation-notes.md # Structured slides and speaking notes for project demo
│   ├── technical-report.md   # Academic technical report and research findings
│   └── risk-engine.md        # Rule-Based Risk Engine mathematical specification
├── docker/                   # Dockerfiles and Nginx reverse proxy configuration
│   ├── Dockerfile.backend    # Multi-stage Maven + Eclipse Temurin 17 container
│   ├── Dockerfile.frontend   # Node 20 build + Nginx production container
│   ├── Dockerfile.ml         # Python 3.10 slim FastAPI container
│   └── nginx.conf            # Reverse proxy configuration
├── docker-compose.yml        # Orchestration: postgres, ml-service, backend, frontend
├── .env.example              # Centralized environment variable template
├── .gitignore                # Comprehensive Git ignore rules
├── src/                      # React 19 + TypeScript + Vite + Tailwind + React Flow Frontend
└── README.md                 # Complete platform documentation
```

---

## 🏦 Simulated Banking Microservice Topology

ChangeGuard models 11 core microservices across banking tiers:

| ID | Service Name | Tier / Type | Criticality | Version | Upstream Inbound | Downstream Outbound |
|---|---|---|---|---|---|---|
| **1** | **Customer App** | Frontend Client | HIGH | 3.4.1 | 0 | API Gateway |
| **2** | **API Gateway** | Ingress Reverse Proxy | CRITICAL | 2.8.0 | Customer App | Auth, Account, Payment |
| **3** | **Authentication Service**| Security / OAuth2 | CRITICAL | 1.9.4 | API Gateway | - |
| **4** | **Account Service** | Core Accounts | HIGH | 2.1.0 | API Gateway | Core Banking |
| **5** | **Payment Service** | Payment Gateway | CRITICAL | 2.0.0 | API Gateway | Fraud, Core Banking, Notification |
| **6** | **Fraud Detection Service** | Real-time ML / Rules | HIGH | 1.5.2 | Payment | Core Banking |
| **7** | **Core Banking Service** | General Ledger | CRITICAL | 4.2.0 | Account, Payment, Fraud | Transaction DB, Reconciliation |
| **8** | **Transaction Database** | PostgreSQL Cluster | CRITICAL | 15.4 | Core Banking, Reporting | - |
| **9** | **Notification Service** | SMS / Push / Email | MEDIUM | 2.3.1 | Payment | - |
| **10**| **Reconciliation Service**| Settlement Batch | HIGH | 1.8.0 | Core Banking | Reporting Service |
| **11**| **Reporting Service** | Analytics & Audit | LOW | 3.0.2 | Reconciliation | Transaction Database |

---

# ⚖️ PHASE 5 — RULE-BASED RISK ENGINE

### 1. Why Pre-Deployment Risk Prediction is Needed
In banking IT operations, software and configuration releases to production carry latent risks: interface mismatches, cascading timeouts, table locking, and infrastructure routing errors. Standard testing catches functional bugs, but rarely identifies **architectural fragility** under load or transitive downstream dependency exposure.

The **Rule-Based Risk Engine** evaluates a proposed technical change *before deployment*, scoring the change deterministically across 8 architectural and historical factors.

> **Analytical Metric Disclaimer:** This is a rule-based analytical risk model for the ChangeGuard prototype. Its weights and thresholds are configurable project assumptions and are not presented as banking-industry standards.

---

### 2. The 8 Normalized Risk Factors ($0.0 \to 1.0$)

Every risk factor is normalized into a standard $[0.0, 1.0]$ interval:

| Factor | Description | Normalization Formula | Default Weight |
|---|---|---|---|
| **1. Complexity** | Technical difficulty of change | `LOW`=0.25, `MEDIUM`=0.50, `HIGH`=0.75, `VERY_HIGH`=1.00 (or numeric $1-10 \to x/10$) | **0.15** |
| **2. Dependency Count** | Number of downstream affected services | $\min(1.0, N_{\text{affected}} / N_{\text{maxRelevant}})$, default max = 10 | **0.10** |
| **3. Dependency Depth** | Cascading hop distance from Phase 4 | $\min(1.0, D_{\text{max}} / D_{\text{maxConfig}})$, default max = 5 | **0.10** |
| **4. Service Criticality** | Tier level of changed service | `LOW`=0.25, `MEDIUM`=0.50, `HIGH`=0.75, `CRITICAL`=1.00 | **0.15** |
| **5. Historical Incident Rate** | Frequency of failures on this service | $N_{\text{failedChanges}} / N_{\text{totalChanges}}$ (fallback: 0.20 if unseeded) | **0.15** |
| **6. Change Type** | Modification classification | `CONFIG`=0.40, `VERSION`/`LIBRARY`=0.50, `API`=0.60, `SECURITY`/`ML`=0.65, `DEP`=0.70, `INFRA`=0.75, `DB`=0.80 | **0.10** |
| **7. Critical Services Affected** | Tier-1 systems in downstream blast radius | 0 critical = 0.0, 1 critical = 0.50, $\ge 2$ critical = 1.00 | **0.10** |
| **8. Blast-Radius Score** | Phase 4 normalized composite score | $\min(1.0, \text{Phase4Score} / 100.0)$ | **0.15** |

**Total Weight Sum:** $0.15 + 0.10 + 0.10 + 0.15 + 0.15 + 0.10 + 0.10 + 0.15 = \mathbf{1.00}$ ($100\%$).

---

### 3. Weighted Risk Formula & Risk Levels

$$\text{RiskScore} = \sum_{i=1}^{8} \Big(w_i \times f_i\Big)$$
$$\text{RiskPercentage} = \text{round}(\text{RiskScore} \times 100)$$

#### Configurable Risk Level Thresholds:
- **`0.00 – 0.29`**: **LOW** — Routine deployment; localized blast radius; standard automated pipeline.
- **`0.30 – 0.59`**: **MEDIUM** — Moderate downstream reach; scheduled maintenance window recommended.
- **`0.60 – 0.79`**: **HIGH** — Broad systemic impact or Tier-1 service change; phased Canary rollout recommended.
- **`0.80 – 1.00`**: **CRITICAL** — Catastrophic failure potential; mandatory Blue-Green isolation and senior CAB sign-off.

---

### 4. Dynamic Risk Explanation

ChangeGuard does not present a black-box score. The engine dynamically generates a natural explanation identifying the primary factors driving the assessment:

> *"The proposed VERSION_UPDATE on Payment Service is evaluated as CRITICAL risk (score: 0.81 / 81%) because Payment Service is classified as tier-1 CRITICAL banking infrastructure, the change impacts 6 downstream services, 2 Tier-1 critical system(s) (Core Banking Service, Transaction Database) lie within the direct blast radius, downstream propagation travels deeply across 3 dependency tiers, elevated change complexity rating, and historical failure rate on this service is elevated (50%)."*

---

### 5. Phase 5 REST API Endpoints

#### A. Analyze Proposed Change
```bash
curl -X POST "http://localhost:8080/api/risk/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": 5,
    "changeType": "VERSION_UPDATE",
    "oldVersion": "2.0.0",
    "newVersion": "3.0.0",
    "complexity": "HIGH",
    "description": "Payment Service v2 to v3 upgrade"
  }'
```

**Sample JSON Response:**
```json
{
  "changeId": null,
  "serviceId": 5,
  "serviceName": "Payment Service",
  "riskScore": 0.8062,
  "riskPercentage": 81,
  "riskLevel": "CRITICAL",
  "blastRadiusScore": 80.8,
  "totalAffectedServices": 6,
  "criticalServicesAffected": 2,
  "maxDependencyDepth": 3,
  "factors": {
    "complexity": {
      "factorName": "Change Complexity",
      "rawValue": "HIGH",
      "normalizedValue": 0.75,
      "weight": 0.15,
      "contribution": 0.1125,
      "description": "High technical complexity rating"
    },
    "dependencyCount": {
      "factorName": "Dependency Count",
      "rawValue": 6,
      "normalizedValue": 0.6,
      "weight": 0.1,
      "contribution": 0.06,
      "description": "6 downstream service(s) affected (normalized against baseline of 10)"
    },
    "dependencyDepth": {
      "factorName": "Dependency Depth",
      "rawValue": 3,
      "normalizedValue": 0.6,
      "weight": 0.1,
      "contribution": 0.06,
      "description": "Impact propagates 3 dependency layer(s) deep (capped at 5)"
    },
    "serviceCriticality": {
      "factorName": "Service Criticality",
      "rawValue": "CRITICAL",
      "normalizedValue": 1.0,
      "weight": 0.15,
      "contribution": 0.15,
      "description": "Target service Payment Service is tier-CRITICAL infrastructure"
    },
    "historicalIncidents": {
      "factorName": "Historical Failure Rate",
      "rawValue": "1/2 failures",
      "normalizedValue": 0.5,
      "weight": 0.15,
      "contribution": 0.075,
      "description": "1 failure(s) observed out of 2 historical change(s) (50% failure rate)"
    },
    "changeType": {
      "factorName": "Change Type Impact",
      "rawValue": "VERSION_UPDATE",
      "normalizedValue": 0.5,
      "weight": 0.1,
      "contribution": 0.05,
      "description": "VERSION_UPDATE carries technical modification weight of 0.50"
    },
    "criticalServicesAffected": {
      "factorName": "Critical Services Affected",
      "rawValue": 2,
      "normalizedValue": 1.0,
      "weight": 0.1,
      "contribution": 0.1,
      "description": "2 Tier-1 critical service(s) impacted in blast radius"
    },
    "blastRadiusScore": {
      "factorName": "Blast-Radius Score",
      "rawValue": 80.8,
      "normalizedValue": 0.808,
      "weight": 0.15,
      "contribution": 0.1212,
      "description": "Phase 4 normalized blast-radius rating of 80.8/100"
    }
  },
  "explanation": "The proposed VERSION_UPDATE on Payment Service is evaluated as CRITICAL risk (score: 0.81 / 81%) because Payment Service is classified as tier-1 CRITICAL banking infrastructure, the change impacts 6 downstream services, 2 Tier-1 critical system(s) (Core Banking Service, Transaction Database) lie within the direct blast radius, downstream propagation travels deeply across 3 dependency tiers, elevated change complexity rating, and historical failure rate on this service is elevated (50%)."
}
```

#### B. Analyze Existing Change Record
```bash
curl -X POST "http://localhost:8080/api/risk/analyze/change/1" -H "Accept: application/json"
```

#### C. Retrieve Risk Configuration
```bash
curl -X GET "http://localhost:8080/api/risk/config" -H "Accept: application/json"
```

---

## ⚙️ Configuration Properties (`application.properties`)

```properties
changeguard.risk.weights.complexity=0.15
changeguard.risk.weights.dependency=0.10
changeguard.risk.weights.depth=0.10
changeguard.risk.weights.criticality=0.15
changeguard.risk.weights.incident=0.15
changeguard.risk.weights.change-type=0.10
changeguard.risk.weights.critical-service=0.10
changeguard.risk.weights.blast-radius=0.15

changeguard.risk.thresholds.low=0.30
changeguard.risk.thresholds.medium=0.60
changeguard.risk.thresholds.high=0.80

changeguard.risk.defaults.max-relevant-dependencies=10
changeguard.risk.defaults.max-depth=5
changeguard.risk.defaults.historical-failure-rate=0.20
```

---

## 🧪 Running Unit & Integration Tests

Run the complete Phase 5 test suite:
```powershell
cd backend
mvn test -Dtest=RiskAnalysisServiceTest
```

**11 Verified Unit & Integration Test Scenarios:**
1. `testLowRiskScenario` — Low complexity routine change evaluates as `LOW` (< 0.30).
2. `testMediumRiskScenario` — Moderate complexity and dependencies evaluates as `MEDIUM` (0.30–0.59).
3. `testHighRiskScenario` — High complexity on Tier-HIGH service evaluates as `HIGH` (0.60–0.79).
4. `testCriticalRiskScenario` — Schema migration on Tier-1 critical service with critical downstream evaluates as `CRITICAL` (>= 0.80).
5. `testHistoricalIncidentRate` — 2 failures across 10 changes yields exact 0.20 rate.
6. `testScoreRange` — Asserts $0.0 \le \text{riskScore} \le 1.0$ across boundary conditions.
7. `testWeightValidation` — Asserts default weight vector sums to exactly 1.00.
8. `testUnknownChangeTypeThrows` — Asserts HTTP 400 `ValidationException` on unrecognized change type.
9. `testInvalidServiceThrows` — Asserts HTTP 404 `ResourceNotFoundException` on missing service ID.
10. `testNoHistoricalDataFallback` — Verifies fallback to documented baseline without throwing exceptions.
11. `testPaymentServiceVersionUpdateScenario` — Full integration test asserting structure, breakdown, and explanation.

---

## 🤖 Phase 7 — FastAPI + Spring Boot ML Integration

Phase 7 bridges the Python Scikit-Learn ML inference microservice (`ml-service/`) directly to the Java Spring Boot backend (`backend/`), establishing an enterprise dual-engine risk architecture:

```
                  React Frontend
                        │
                        ▼
               Spring Boot Backend
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   PostgreSQL      Risk Engine     ML Client (RestClient)
        │          (Phase 5)            │
        ▼               │               ▼
   Blast Radius         │        FastAPI Microservice (Port 8000)
    (Phase 4)           │               │
                        │               ▼
                        │        Scikit-Learn Pipeline
                        │               │
                        ▼               ▼
            [Rule Risk: 0.81]    [ML Failure Prob: 0.88]
                        │               │
                        └───────┬───────┘
                                ▼
                  Combined RiskAnalysisResult DTO
                                │
                                ▼
                          React Frontend
```

### 1. Architectural Safeguards
- **No Direct Frontend-to-ML Access**: The frontend communicates exclusively with Spring Boot on port 8080 (`/api/*`). The Python microservice remains an internal backend component.
- **Graceful Degradation & Resilience**: If the ML service is offline or times out (configurable default: 3000ms), Spring Boot catches the exception, logs a warning, sets `mlStatus: UNAVAILABLE` (or `TIMEOUT`), and successfully returns the deterministic Phase 5 rule-based risk evaluation without interrupting CI/CD pipelines.
- **Strict Feature Consistency**: Spring Boot's `MLFeatureBuilder` transforms live JPA entities, Blast-Radius DTOs, and change attributes into the exact 11 features expected by the Phase 6 trained model.

### 2. FastAPI Endpoints (`ml-service/app/main.py`)

#### `GET /health`
Verifies service liveness and deserialization of the trained Random Forest model artifact.
```bash
curl -X GET "http://localhost:8000/health" -H "Accept: application/json"
```
Response:
```json
{
  "status": "UP",
  "service": "ChangeGuard ML Service",
  "modelLoaded": true,
  "modelType": "RandomForestClassifier",
  "version": "1.0.0"
}
```

#### `POST /predict`
Generates calibrated failure probability using Scikit-Learn's `ColumnTransformer` + `RandomForestClassifier`.
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "change_complexity": 0.85,
    "dependency_count": 6,
    "dependency_depth": 3,
    "criticality_score": 1.0,
    "historical_failure_rate": 0.25,
    "change_type": "VERSION_UPDATE",
    "blast_radius_score": 80.8,
    "critical_services_affected": 2,
    "previous_incidents": 3,
    "service_age": 36,
    "version_change_size": 1.0
  }'
```
Response:
```json
{
  "failureProbability": 0.8801,
  "prediction": 1,
  "riskLevel": "CRITICAL",
  "model": "RandomForestClassifier",
  "modelVersion": "1.0"
}
```

### 3. Spring Boot Integration Endpoints

- **`POST /api/risk/analyze`**: Unified endpoint returning both Rule-Based and ML risk evaluations.
- **`GET /api/ml/health`**: Proxied health check from Spring Boot to Python FastAPI.
- **`POST /api/ml/predict`**: Direct passthrough ML prediction endpoint for ad-hoc feature vectors.

### 4. Running Phase 7 Tests

**FastAPI Pytest Suite:**
```bash
cd ml-service
pytest tests/test_api.py
```

**Spring Boot JUnit Suite:**
```powershell
cd backend
mvn test -Dtest=MLFeatureBuilderTest,RiskAnalysisServiceTest
```

---

## 💻 Phase 8 — React Dashboard

Phase 8 introduces an enterprise-grade React 19 + TypeScript + Vite + Tailwind CSS dashboard designed specifically for banking IT risk managers, DevOps release teams, and change advisory boards (CAB).

### 1. Technology Stack
- **Framework**: React 19, TypeScript
- **Bundler & Dev Server**: Vite
- **Routing**: React Router DOM v7 (`BrowserRouter`, `Routes`, `Route`, `NavLink`, `useNavigate`)
- **HTTP Client**: Centralized Axios client (`src/api/apiClient.ts`) with request/response interceptors, 4s timeout, and offline fallback tracking
- **Graph Topology**: `@xyflow/react` (React Flow v12) for interactive dependency graphs
- **Icons & Styling**: Lucide React, Tailwind CSS (Tailwind v4 with strict 60-30-10 palette discipline)

### 2. Frontend Folder Structure
```
src/
├── api/                       # Centralized Axios API services
│   ├── apiClient.ts           # Axios instance with BASE_URL & interceptors
│   ├── servicesApi.ts         # GET /api/services, /api/services/{id}, /critical/{crit}
│   ├── dependencyApi.ts       # GET /api/dependencies/graph, /bfs, /dfs, /paths
│   ├── riskApi.ts             # POST /api/risk/analyze, /api/risk/config
│   ├── blastRadiusApi.ts      # GET /api/blast-radius/service/{id}, POST /analyze
│   ├── incidentApi.ts         # GET /api/incidents, /api/incidents/failed
│   ├── changesApi.ts          # GET /api/changes, POST /api/changes
│   └── mlApi.ts               # GET /api/ml/health, POST /api/ml/predict, metrics
├── components/                # Reusable presentation components
│   ├── Header.tsx             # One-row Top Bar with backend & ML liveness badges
│   ├── Sidebar.tsx            # Desktop permanent + mobile collapsible navigation
│   ├── StatCard.tsx           # Enterprise metric card with tabular numerals
│   ├── RiskBadge.tsx          # Accessible risk indicator (LOW/MED/HIGH/CRITICAL)
│   ├── RiskScore.tsx          # Dual numeric + progress gauge indicator
│   ├── RiskFactorCard.tsx     # Phase 5 normalized factor contribution breakdown
│   ├── BlastRadiusCard.tsx    # Visual hierarchical blast propagation flow
│   ├── LoadingSpinner.tsx     # Standardized loading state indicator
│   ├── ErrorMessage.tsx       # User-friendly error alert with retry
│   ├── EmptyState.tsx         # Accessible empty state container
│   └── ServiceNode.tsx        # React Flow custom node with port handles
├── pages/                     # Routed view containers
│   ├── DashboardPage.tsx      # Route: / (KPI cards, system status, benchmark scenarios)
│   ├── ServicesPage.tsx       # Route: /services (Search, filters, side inspector)
│   ├── DependencyGraphPage.tsx# Route: /dependency-graph (React Flow, BFS/DFS traversal)
│   ├── SubmitChangePage.tsx   # Route: /submit-change (Validation, dropdowns, analyze CTA)
│   ├── RiskAnalysisPage.tsx   # Route: /risk-analysis (Rule vs ML separation, factors, explanation)
│   ├── BlastRadiusPage.tsx    # Route: /blast-radius (Cascade table, depth, paths)
│   ├── IncidentsPage.tsx      # Route: /incidents (Search, filter by severity/failure, root-cause)
│   ├── MLMetricsPage.tsx      # Route: /ml-metrics (Confusion matrix, ROC-AUC, feature importance)
│   └── ApiConsolePage.tsx     # Route: /api-console (Interactive developer testing console)
├── types/                     # Centralized TypeScript definitions matching Spring Boot DTOs
│   └── index.ts
├── App.tsx                    # Top-level Router layout with Header and responsive Sidebar
├── main.tsx                   # React root entry point
└── index.css                  # Global styles & Tailwind import
```

### 3. Environment Variables
Stored in `.env` (template in `.env.example`):
```env
# Spring Boot API Gateway Base URL
VITE_API_BASE_URL=http://localhost:8080
```

### 4. Available Application Routes
| Path | Component | Description |
|---|---|---|
| `/` | `DashboardPage` | Overview KPIs, service health, recent change log, benchmark scenarios |
| `/services` | `ServicesPage` | Microservices registry, criticality/type filters, side details drawer |
| `/dependency-graph` | `DependencyGraphPage` | Interactive React Flow directed graph with BFS/DFS impact exploration |
| `/submit-change` | `SubmitChangePage` | Form validation for proposed technical changes with direct risk analysis |
| `/risk-analysis` | `RiskAnalysisPage` | Dual-engine risk report: Rule-Based (Phase 5) vs ML Prediction (Phase 7) |
| `/blast-radius` | `BlastRadiusPage` | Phase 4 analytical blast radius: hop depths, cascade table, failure paths |
| `/incidents` | `IncidentsPage` | Historical change outcomes, severity filters, root-cause analyses |
| `/ml-metrics` | `MLMetricsPage` | Phase 6 model evaluation: Accuracy, F1, ROC-AUC, confusion matrix, feature importance |
| `/what-if` | `WhatIfSimulatorPage` | Phase 9 What-If Change Simulator: in-memory sandbox, delta diff, topology mutations |
| `/api-console` | `ApiConsolePage` | Interactive developer console for testing all backend REST endpoints |

### 5. Starting the Frontend
```bash
npm install
npm run dev
```
Build for production:
```bash
npm run build
npm run lint
```

---

## 🔮 Phase 9 — What-If Change Simulator

Phase 9 introduces an **in-memory architectural sandbox** allowing IT change advisory boards (CAB), platform engineers, and enterprise risk officers to model hypothetical changes before staging:
> *"What could happen if I make this change?"*

### 1. Safety Architecture (Zero DB Mutations)
The simulation strictly adheres to the enterprise isolation rule:
```
Real Database (PostgreSQL)
       │ (read-only query)
       ▼
Current System Topology State
       │ (deep copy in memory)
       ▼
In-Memory Simulation Sandbox
       │ (apply hypothetical modifications)
       ├── Version Upgrade (e.g. 2.0.0 → 3.0.0)
       ├── Complexity Shift (LOW / MEDIUM / HIGH / VERY_HIGH)
       ├── Add Dependency Edge (e.g. Payment → Reporting)
       ├── Remove Dependency Edge (e.g. Decouple Payment → Fraud)
       └── Change Type Modification (DATABASE_CHANGE, CONFIG_CHANGE, etc.)
       │
       ▼
Graph BFS / DFS Traversal & Impact Evaluation
       │
       ▼
Dual-Engine Risk (Rule-Based + ML Prediction)
       │
       ▼
Comparative Delta Diff (CURRENT STATE vs. SIMULATED STATE)
```
**CRITICAL SAFETY GUARANTEE**: No rows are ever inserted, updated, or deleted in the production `services` or `dependencies` tables. All graph alterations exist exclusively in transient execution memory.

### 2. Backend Simulation API

**Endpoint**: `POST /api/simulation/what-if` (also aliased to `POST /api/what-if/simulate`)

**Sample Request Payload:**
```json
{
  "serviceId": 5,
  "changeType": "VERSION_UPDATE",
  "oldVersion": "2.0.0",
  "newVersion": "3.0.0",
  "complexity": "HIGH",
  "description": "Major payment engine upgrade",
  "dependencyChanges": [
    {
      "action": "ADD",
      "sourceServiceId": 5,
      "targetServiceId": 10
    }
  ]
}
```

**Sample Response Structure:**
```json
{
  "request": { ... },
  "currentState": {
    "serviceName": "Payment Service",
    "version": "2.0.0",
    "blastRadiusScore": 80.8,
    "totalAffectedServices": 4,
    "criticalServicesAffectedCount": 1,
    "maxDependencyDepth": 3,
    "ruleBasedRiskScore": 0.58,
    "ruleBasedRiskPercentage": 58,
    "ruleBasedRiskLevel": "MEDIUM",
    "mlPrediction": { "failureProbability": 0.28, "prediction": 0 }
  },
  "simulatedState": {
    "serviceName": "Payment Service",
    "version": "3.0.0",
    "blastRadiusScore": 92.4,
    "totalAffectedServices": 5,
    "criticalServicesAffectedCount": 2,
    "maxDependencyDepth": 3,
    "ruleBasedRiskScore": 0.78,
    "ruleBasedRiskPercentage": 78,
    "ruleBasedRiskLevel": "HIGH",
    "mlPrediction": { "failureProbability": 0.74, "prediction": 1 }
  },
  "comparison": {
    "newlyAffectedServices": ["Reporting Service"],
    "noLongerAffectedServices": [],
    "newlyCriticalAffectedServices": ["Settlement Engine"],
    "affectedCountDelta": 1,
    "criticalAffectedDelta": 1,
    "maxDepthDelta": 0,
    "blastRadiusScoreDelta": 11.6,
    "riskScoreDelta": 0.20,
    "riskPercentageDelta": 20,
    "riskLevelChanged": true,
    "currentRiskLevel": "MEDIUM",
    "simulatedRiskLevel": "HIGH",
    "mlProbabilityDelta": 0.46,
    "simulationVerdict": "SIMULATION WARNING: The proposed change to Payment Service increases failure risk by +20% (from 58% MEDIUM to 78% HIGH). Expands blast radius to 1 new service: [Reporting Service]. Recommended action: Implement phased Canary rollout with synthetic transaction monitoring."
  },
  "simulatedAtTimestamp": 1740000000000
}
```

### 3. Simulator UI Features (`/what-if`)
- **Quick Banking Scenarios**: One-click benchmark presets (Payment v3.0, Core DB Migration, Decouple Fraud, Auth Security Patch).
- **Topology Mutation Sandbox**: Dynamic controls to temporarily add or remove directed dependency links between services.
- **Side-by-Side Deep Dive**: Baseline state vs. Simulated state side-by-side with depth indicators, propagation paths, and risk factor breakdown table.
- **Visual Diff Highlighting**: Prominent `NEW EXPOSURE` badges for newly affected services, `DECOUPLED` indicators for decoupled systems, and delta indicators for risk scores and ML failure probabilities.

---

# 📊 PHASE 10 — FINAL VALIDATION, EVALUATION & RESEARCH EXPERIMENT

### 1. Research Objective & Academic Scope
The goal of Phase 10 is to quantitatively and empirically benchmark whether **ChangeGuard** can anticipate risky IT software changes before deployment in simulated core banking architectures.

> **Academic & Scope Disclosure:** All reported metrics and evaluations are executed exclusively on a synthetic core banking dataset of 2,000 change records generated under fixed random seed (`seed=42`). Results demonstrate methodology, pipeline rigor, and architectural validity. They do not claim or represent real-world commercial banking production results. No data manipulation or metric fabrication was performed.

---

### 2. Experimental Reproducibility & Setup

| Parameter | Value | Description |
|---|---|---|
| **Total Samples ($N$)** | 2,000 | Simulated banking change records across 11 core microservices |
| **Split Strategy** | Stratified Train / Test (80% / 20%) | Preserves incident ratio without data leakage across folds |
| **Train Samples** | 1,600 | Preprocessing scalers and encoders fitted exclusively on this partition |
| **Held-out Test Samples** | 400 | Strictly unseen partition reserved for final evaluation |
| **Random Seed** | `42` | Deterministic pseudo-random number generator seed |
| **Features ($K$)** | 11 features | 10 continuous/discrete numerical + 1 categorical (`change_type`) |
| **Target Variable ($y$)** | `failure` | Binary: `0` = successful change, `1` = incident occurred |
| **Class Balance** | 65.65% Failure ($N=1,313$) | Reflects high-risk banking microservice environment |

#### Dataset Validation & Quality Checks:
- **Missing Values:** $0$ ($0.0\%$) across all 11 columns.
- **Duplicate Records:** $0$ ($0.0\%$).
- **Preprocessing:** Scikit-learn `ColumnTransformer` with `StandardScaler` on numerical features and `OneHotEncoder(handle_unknown='ignore')` on categorical attributes.

---

### 3. Empirical Model & Rule Benchmark Results

All metrics evaluated strictly on the **unseen held-out test set** ($N=400$, 263 actual failure incidents, 137 safe changes):

| Approach / Model | Type | Accuracy | Precision | Recall (Catch Rate) | F1 Score | ROC-AUC | Single Inference Latency |
|---|---|---|---|---|---|---|---|
| **Majority Class Baseline** | Trivial Heuristic | 65.75% | 65.75% | 100.00% | 0.7934 | 0.5000 | <0.01 ms |
| **Rule-Based Engine (Threshold $\ge 0.50$)** | Phase 5 Rules | 72.75% | 91.40% | 64.64% | 0.7572 | 0.8435 | <0.10 ms |
| **Rule-Based Engine (Threshold $\ge 0.60$ HIGH)** | Phase 5 Rules | 55.25% | 90.38% | 35.74% | 0.5123 | 0.8435 | <0.10 ms |
| **Logistic Regression Pipeline** | Linear Model | 80.25% | 84.07% | 86.31% | 0.8518 | 0.8477 | 2.35 ms |
| **Random Forest (Champion)** | Nonlinear Ensemble | **80.75%** | **82.98%** | **88.97%** | **0.8587** | **0.8441** | 7.48 ms |

---

### 4. Confusion Matrix Analysis (Test Partition, $N=400$)

#### Random Forest (Production Champion):
```
                 Predicted Safe (0)    Predicted Risky (1)
Actual Safe (0)        89 (TN)                48 (FP)
Actual Incident (1)    29 (FN)               234 (TP)
```
- **True Positives (234):** Risky banking changes correctly identified before production deployment.
- **True Negatives (89):** Low-risk changes permitted to pass through normal CI/CD without friction.
- **False Positives (48):** Safe changes routed to Canary or extra CAB review (conservative safety margin).
- **False Negatives (29):** High-risk changes missed (minimizing this is the primary objective of banking safety).

#### Confusion Matrix Comparison Across Models:
| Metric | Majority Baseline | Rule-Based ($\ge 0.60$) | Logistic Regression | Random Forest |
|---|---|---|---|---|
| **True Negatives (TN)** | 0 | **127** | 94 | 89 |
| **False Positives (FP)** | 137 | **10** | 43 | 48 |
| **False Negatives (FN)** | 0 | 169 | 36 | **29** |
| **True Positives (TP)** | 263 | 94 | 227 | **234** |

---

### 5. Random Forest Feature Importance (MDI Gini)

The top predictors identified by the 100-tree Random Forest classifier:

| Rank | Feature Name | Description | Importance | Cumulative |
|---|---|---|---|---|
| **1** | `blast_radius_score` | Phase 4 topology traversal score | **0.2196 (22.0%)** | 22.0% |
| **2** | `critical_services_affected` | Count of Tier-1 systems in downstream reach | **0.1657 (16.6%)** | 38.5% |
| **3** | `dependency_count` | Number of reachable downstream microservices | **0.1312 (13.1%)** | 51.7% |
| **4** | `change_complexity` | Technical complexity rating ($0.1 - 1.0$) | **0.0932 (9.3%)** | 61.0% |
| **5** | `criticality_score` | Criticality tier of modified service | **0.0766 (7.7%)** | 68.7% |
| **6** | `dependency_depth` | Maximum cascading hop distance | **0.0636 (6.4%)** | 75.0% |
| **7** | `service_age` | Service maturity in months | **0.0624 (6.2%)** | 81.3% |
| **8** | `historical_failure_rate` | Empirical failure frequency on target service | **0.0601 (6.0%)** | 87.3% |
| **9** | `version_change_size` | Version jump magnitude (Major vs Minor vs Patch) | **0.0564 (5.6%)** | 92.9% |
| **10** | `previous_incidents` | Cumulative historical outages logged | **0.0268 (2.7%)** | 95.6% |
| **11-17** | `change_type_*` | One-hot modification category flags | **0.0441 (4.4%)** | 100.0% |

> *Statistical Note: Feature importance reflects variance reduction across decision tree splits; it confirms model association and utility, not direct causal relationships.*

---

### 6. Rule-Based vs. Machine Learning Disagreement Analysis

Comparing the Rule-Based Engine (High/Critical threshold $\ge 0.60$) vs. Random Forest ($\ge 0.50$):
- **Overall Agreement Rate:** **55.5%** (222 / 400 test samples).
- **Both Correctly Flagged Incident:** 94 changes. Severe structural risks (e.g. Payment Gateway major upgrade cascading into Core Banking).
- **ML Flagged but Rule Missed:** **140 changes**. Multivariate combinations (e.g. moderate blast radius combined with high complexity on established services) that stay below the rule-based linear sum cutoff.
- **Rule Flagged but ML Missed:** 0 changes.
- **Both Missed:** 29 changes (residual operational noise / unmodeled variance).

---

### 7. Trade-Off Analysis & Recommended Governance Architecture

| Evaluation Dimension | Rule-Based Risk Engine | Logistic Regression | Random Forest |
|---|---|---|---|
| **Auditability & Explainability** | **Exceptional** (Deterministic linear sum; easily understood by bank auditors) | **High** (Direct odds-ratio coefficients) | **Moderate** (Requires Gini importances / SHAP / tree inspection) |
| **Recall / Outage Prevention** | Low (35.7% at High cutoff; misses complex risks) | High (86.31%) | **Highest (88.97%)** (Catches subtle multivariate failures) |
| **Inference Latency** | <0.10 ms | 2.35 ms | 7.48 ms (Well below CI/CD <100ms threshold) |
| **Retraining Overhead** | None (Configurable weights) | Low (<20 ms training) | Moderate (~200 ms training) |

#### Enterprise Governance Recommendation:
ChangeGuard recommends a **Hybrid Defense Architecture**:
1. **Rule Engine as Baseline Safety Gate:** Provides deterministic safety floors, policy enforcement (e.g. mandatory CAB for Core Banking), and auditor-friendly explanations.
2. **Machine Learning as Predictive Circuit-Breaker:** Random Forest acts as an intelligent pre-deployment filter catching nonlinear, multi-service cascade interactions that linear rules overlook.

---

### 8. Experiment Limitations
1. **Synthetic Data Boundaries:** Generated with mathematical heuristics and latent log-odds distributions; cannot replicate human organizational dynamics or surprise cloud provider outages.
2. **Independent Sampling:** Assumes change attempts are relatively independent; in real banking enterprises, change failure risks cluster during quarterly freeze-thaw release windows.
3. **Graph Topology Rigidity:** Simulated banking topology consists of 11 services and 13 dependencies; real banks operate hundreds of microservices.

---

### 9. Experiment Artifacts & Verification Commands
- **FastAPI Test Suite:** `pytest ml-service/tests/` (10/10 tests passing).
- **Evaluation Runner:** `PYTHONPATH=ml-service python3 ml-service/app/experiment_evaluation.py`.
- **JSON Evaluation Report:** `ml-service/results/final_evaluation.json`.
- **Generated Figures:** `ml-service/results/roc_curves.png`, `ml-service/results/confusion_matrix.png`.
- **Interactive UI Dashboard:** Navigate to `/ml-metrics` or `/evaluation` in ChangeGuard.

---

# 🚀 PHASE 11 — PRODUCTIONIZATION, SECURITY & FINAL PREPARATION

### 1. Security & Privacy Review
- **Environment Isolation**: Database credentials, passwords, and private URLs are isolated via `.env.example` templates and overridden strictly through environment variables.
- **Frontend Safeguards**: The React SPA communicates solely via `VITE_API_BASE_URL` with Spring Boot (`/api/*`). The browser has **no direct access** to PostgreSQL (port 5432) or FastAPI (port 8000).
- **Zero Secrets in Code**: No API keys, credentials, or personal secrets are committed to Git. `.gitignore` explicitly blocks `.env`, local environment overrides, binary build artifacts, and caches.
- **Academic & Research Scope**: ChangeGuard is an academic prototype evaluating pre-deployment change risk on simulated banking data. It does not access real banking customer data and does not claim production guarantees.

---

### 2. Comprehensive Documentation Library (`/docs`)
- **[System Architecture](docs/architecture.md)**: Deep dive into the 4-tier model, component interaction, and network boundaries.
- **[Setup & Installation Guide](docs/setup.md)**: Prerequisites, local setup, database seeding, and Docker Compose commands.
- **[REST API Documentation](docs/api-documentation.md)**: Complete request/response schemas, error payloads, and endpoint contracts.
- **[Deployment & Proxy Guide](docs/deployment.md)**: Production containerization, reverse proxying, and healthcheck configurations.
- **[Presentation Notes & Slides](docs/presentation-notes.md)**: 10 structured slides with talking points for project presentations.
- **[Technical Research Report](docs/technical-report.md)**: Academic technical report detailing research objectives, algorithms, benchmarks, and findings.
- **[Rule-Based Risk Engine Spec](docs/risk-engine.md)**: Exact mathematical weights, normalization rules, and threshold boundaries.

---

### 3. Step-by-Step Live Demonstration Scenario

| Step | Action | Page | Observed Outcome |
|---|---|---|---|
| **1. Overview** | View Registered Microservices | **Dashboard (`/`)** | Inspect the 11 core banking services across 4 tiers and system health status. |
| **2. Topology** | Explore Dependency Graph | **Dependency Graph (`/dependency-graph`)** | View nodes, directed links, and run interactive BFS/DFS search from Payment Service. |
| **3. Proposal** | Submit a Technical Change | **Submit Change (`/submit-change`)** | Propose a `VERSION_UPDATE` on Payment Service (ID 5) from `2.0.0` to `3.0.0` with `HIGH` complexity. |
| **4. Analysis** | Review Pre-Deploy Risk | **Risk Analysis (`/risk-analysis`)** | Observe `CRITICAL` risk rating (81%), blast radius score of `80.8`, Tier-1 critical exposure, and `BLUE_GREEN` rollout advice. |
| **5. Simulation** | Run What-If Scenario | **What-If Simulator (`/what-if`)** | Simulate decoupling Notification Service or adding an edge; observe real-time risk delta while database remains 100% untouched. |
| **6. Evaluation** | Review Research Benchmarks | **Evaluation (`/evaluation`)** | Inspect model comparison metrics, Confusion Matrices, Gini feature importances, and research scope notes. |

---

### 4. How to Run the Complete Stack

#### Option A: Docker Compose (Recommended single command)
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api/health`
- FastAPI ML: `http://localhost:8000/health`

#### Option B: Local Development
```bash
# 1. PostgreSQL: Seed tables
psql -U postgres -d changeguard -f database/01_schema.sql
psql -U postgres -d changeguard -f database/02_seed.sql

# 2. Start ML Microservice
cd ml-service && uvicorn app.main:app --port 8000

# 3. Start Spring Boot Backend
cd backend && mvn spring-boot:run

# 4. Start React Frontend
npm install && npm run dev
```

---

# 📈 PHASE 12 — CONTINUOUS CHANGE MONITORING & RISK HISTORY

### 1. The Continuous Lifecycle Concept
$$\text{PREDICT} \longrightarrow \text{DEPLOY / OBSERVE} \longrightarrow \text{RECORD OUTCOME} \longrightarrow \text{COMPARE} \longrightarrow \text{ANALYZE HISTORY}$$
Phase 12 elevates ChangeGuard from evaluating isolated change proposals to maintaining a systemic audit trail of all evaluations, tracking longitudinal risk trajectories, recording confirmed deployment outcomes, and validating realized ML model precision and recall against production ground truth.

### 2. Core Capabilities Implemented
- **Automated History Persistence**: Every analysis performed via `POST /api/risk/analyze` is automatically captured in the `risk_analysis_history` table with timestamps, factor breakdowns, and model versions.
- **Outcome Feedback Loop**: Deployment outcomes (incident vs. clean) can be recorded via `PATCH /api/risk-history/{id}/outcome` with severity levels.
- **Ground-Truth Classification**: Automatically classifies predictions into `TRUE_POSITIVE`, `TRUE_NEGATIVE`, `FALSE_POSITIVE`, and `FALSE_NEGATIVE`.
- **Longitudinal Risk Trends**: Time-series aggregation via `GET /api/risk-history/trends` revealing directional shifts in release risk.
- **High-Risk Service Ranking**: Evaluates historical failure frequencies across microservice tiers via `GET /api/risk-history/high-risk-services`.
- **Fidelity Validation with Safety Guardrails**: Calculates empirical accuracy, precision, recall, and F1 via `GET /api/risk-history/ml-performance`. Protects against reporting misleading metrics when sample sizes are below the configurable threshold (`NOT_ENOUGH_DATA`).
- **Interactive Risk History Dashboard**: Fully featured React interface at `/risk-history` with search, risk tier filtering, trend charts, and outcome recording modals.

---

# 💡 PHASE 13 — INTELLIGENT CHANGE RECOMMENDATION & DECISION SUPPORT

### 1. Decision Support, Not Autonomous Control
$$\text{PREDICT} \longrightarrow \text{EVALUATE EVIDENCE} \longrightarrow \text{EXPLAIN} \longrightarrow \text{RECOMMEND ADVISORY ACTIONS} \longrightarrow \text{HUMAN CAB DECISION}$$
ChangeGuard Phase 13 synthesizes topological graph traversals, deterministic rule weights, random forest probabilities, and historical incident records into **clear, explainable advisory recommendations** for engineering teams.

> **Human Governance Mandate:** ChangeGuard operates strictly as a decision-support advisory system. It will never autonomously deploy, reject, approve, or roll back production banking services. Final authority rests with authorized engineering personnel.

### 2. Decision-Support Action Catalog
- **Staged & Canary Rollouts**: Automatically advises Blue-Green isolation with synthetic smoke test gates for Tier-1/CRITICAL exposures, or 10% canary traffic steps with automated 5xx error rollback triggers for HIGH-risk changes.
- **Critical Service Telemetry**: Arms dedicated latency and HTTP error ratio alerts on all downstream Tier-1 systems within the blast radius.
- **Rollback Preparation**: Formulates runbook requirements verifying backward-compatible schema migrations and warm container replicas.
- **Domain-Specific Technical Audits**: Recommends table-lock audits for database DDL changes, Pact contract tests for API changes, and token cache sync reviews for security/auth changes.
- **Empirical Historical Alerts**: Identifies previous change incidents on the target service and flags specific post-mortem root causes to guard against.
- **Interactive Recommendations Dashboard**: New page at `/recommendations` providing interactive release evaluation, blast-radius telemetry, and structured advisory action cards.







---

## GitHub Pull Request Risk Assessment (Local Integration)

ChangeGuard can receive GitHub `pull_request` webhooks, map the repository to a registered ChangeGuard service, create a change record, run the existing risk engine, and post the result as a Pull Request comment.

### Configuration

1. Copy `.env.example` to `.env` and set:
   - `CHANGEGUARD_GITHUB_WEBHOOK_SECRET`: a long random secret shared with the GitHub webhook configuration.
   - `CHANGEGUARD_GITHUB_TOKEN`: a fine-grained token restricted to the target repository with permission to create issue comments (Issues: read/write).
   - `CHANGEGUARD_GITHUB_REPOSITORY_SERVICE_MAP`: comma-separated `owner/repository:serviceId` mappings. Find service IDs in the ChangeGuard Services page or `GET /api/services`.
2. Start the stack with `docker compose up --build`.
3. Expose the local backend to GitHub using a secure tunnel, for example `ngrok http 8080`. Use the HTTPS forwarding URL.
4. In the GitHub repository, open **Settings → Webhooks → Add webhook**:
   - Payload URL: `https://YOUR-TUNNEL-DOMAIN/api/integrations/github/webhook`
   - Content type: `application/json`
   - Secret: the exact value of `CHANGEGUARD_GITHUB_WEBHOOK_SECRET`
   - Events: select **Let me select individual events** and enable **Pull requests** only.
   - Keep SSL verification enabled.
5. Create or update a Pull Request. Supported actions are `opened`, `synchronize`, `reopened`, and `ready_for_review`.

### Change type labels

ChangeGuard can infer a type from the PR title/body. For deterministic classification, add one of these labels to the PR:

- `change-type:API_CHANGE`
- `change-type:DATABASE_CHANGE`
- `change-type:CONFIG_CHANGE`
- `change-type:LIBRARY_UPDATE`
- `change-type:INFRASTRUCTURE_CHANGE`
- `change-type:ML_MODEL_CHANGE`
- `change-type:VERSION_UPDATE`
- `change-type:DEPENDENCY_CHANGE`
- `change-type:SECURITY_CHANGE`

The webhook uses the PR base/head commit abbreviations as the old/new version identifiers and estimates complexity from changed files and changed lines. Treat that complexity as a heuristic until you calibrate it against your team's change history.

### Endpoint

`POST /api/integrations/github/webhook`

GitHub signature verification uses `X-Hub-Signature-256` (HMAC-SHA256). Non-`pull_request` events are ignored. The endpoint is server-to-server and should not be exposed without a webhook secret and HTTPS tunnel.

### CI workflow

`.github/workflows/ci.yml` runs the backend Maven verification and frontend type-check/build on Pull Requests and pushes to `main` or `master`. This CI workflow is separate from the webhook-based risk assessment: CI validates code; the webhook sends the Pull Request to ChangeGuard.

### Current integration boundary

This integration assesses and comments on Pull Requests. It does not approve, block, merge, or deploy changes. GitHub delivery retries can create another assessment record in this initial version; durable webhook-delivery deduplication should be added before using it for a team-wide production workflow.
=======
# CGX
CGX is a locally hosted change intelligence platform that analyzes software changes, service dependencies, blast radius, and deployment risks using machine learning. It integrates real application data to predict potential failures, track incidents, and provide actionable recommendations before deployment.
>>>>>>> 8140bf1a5093029a6058fc1ab29c14b2a64838a3
