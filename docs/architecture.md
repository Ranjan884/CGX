# ChangeGuard System Architecture

## 1. High-Level Architecture Overview

ChangeGuard is architected as an enterprise-grade multi-tier system engineered specifically for core banking IT environments. It analyzes proposed technical releases, traverses dependency topologies, evaluates blast radius, and computes failure probability before changes touch production.

```
┌─────────────────────────────────────────────────────────────────┐
│                      Client Browser (React SPA)                 │
│        (Vite + React Flow + Tailwind CSS + Lucide Icons)        │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 │ HTTPS / REST (JSON)
                                 │ Base URL: VITE_API_BASE_URL
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                Spring Boot 3.2.4 REST API Gateway               │
│                     (Java 17, Port 8080)                        │
│                                                                 │
│  Controllers:                                                   │
│   • /api/services        • /api/dependencies   • /api/risk      │
│   • /api/blast-radius    • /api/simulation     • /api/health    │
│   • /api/incidents       • /api/changes        • /api/ml        │
│                                                                 │
│  Engines:                                                       │
│   • DependencyGraphService (BFS, DFS, Path Tracking)            │
│   • BlastRadiusEngine (Topology scoring, Tier-1 weighting)      │
│   • RuleBasedRiskEngine (Deterministic mathematical weights)    │
│   • WhatIfSimulationService (In-memory clone isolation)         │
│   • MLServiceClient (Resilient HTTP client with timeouts)       │
└──────────────┬──────────────────────────────────┬───────────────┘
               │                                  │
               │ JDBC / Hibernate                 │ HTTP Client (REST)
               │ (JPA)                            │ Port 8000
               ↓                                  ↓
┌───────────────────────────────┐  ┌──────────────────────────────┐
│     PostgreSQL Database       │  │   FastAPI ML Microservice    │
│         (Port 5432)           │  │     (Python 3.10 / 3.11)     │
│                               │  │                              │
│ Tables:                       │  │ Model Pipeline:              │
│  • services                   │  │  • Scikit-learn Pipeline     │
│  • dependencies               │  │  • Random Forest (Champion)  │
│  • changes                    │  │  • Logistic Regression       │
│  • incidents                  │  │  • ColumnTransformer Scaler │
│                               │  │                              │
│ Initialized via:              │  │ Endpoints:                   │
│  • 01_schema.sql              │  │  • GET  /health              │
│  • 02_seed.sql                │  │  • POST /predict             │
└───────────────────────────────┘  └──────────────────────────────┘
```

---

## 2. Component Breakdown

### 2.1 Frontend Client (`/src`)
- **Technology**: React 19, TypeScript, Vite, React Router 6, React Flow (@xyflow/react), Tailwind CSS.
- **Role**: Operator dashboard and visual interaction tier.
- **Security Boundary**: The frontend **never** connects directly to PostgreSQL or FastAPI. All telemetry and queries route through the centralized Spring Boot API (`VITE_API_BASE_URL`).

### 2.2 Backend Gateway Tier (`/backend`)
- **Technology**: Java 17, Spring Boot 3.2.4, Spring Data JPA, Spring Web MVC, Hibernate.
- **Role**: Authoritative transaction controller, security barrier, database access point, and dependency graph execution engine.
- **Key Services**:
  - `DependencyGraphService`: In-memory graph representation with BFS (level order traversal) and DFS (exhaustive acyclic pathfinding).
  - `BlastRadiusEngine`: Cascading impact calculator weighting affected node count, Tier-1 critical service density, and hop depth.
  - `RuleBasedRiskEngine`: Deterministic linear evaluation formula based on weighted complexity, criticality, and historical incident rates.
  - `WhatIfSimulationService`: In-memory sandbox cloning production nodes and applying tentative edge/property mutations without mutating database tables.
  - `MLServiceClient`: Circuit-resilient HTTP client invoking FastAPI inference with 3,000ms timeouts and graceful degraded status fallback.

### 2.3 Machine Learning Microservice (`/ml-service`)
- **Technology**: Python 3.10+, FastAPI, Uvicorn, Scikit-learn, Pandas, Joblib.
- **Role**: Statistical probability estimation for unexpected deployment failure.
- **Model Storage**: Pre-serialized `pipeline_random_forest.joblib` artifact loaded once at application startup into memory.

### 2.4 Relational Persistence (`/database`)
- **Technology**: PostgreSQL 15.
- **Role**: System of record for registered banking microservices, structural dependencies, historical changes, and past incident logs.

---

## 3. Communication Protocols & Data Flow

1. **Service Registration & Discovery**:
   - `GET /api/services` → Spring Boot queries PostgreSQL `services` table.
2. **Topological Graph Traversal**:
   - `GET /api/dependencies/graph` → Spring Boot reads `services` and `dependencies` tables, constructs in-memory adjacency list, and returns nodes and directed edges.
3. **Change Risk Analysis Workflow**:
   - User submits change request via `POST /api/risk/analyze`.
   - Spring Boot runs BFS/DFS starting from target `serviceId`.
   - Graph engine calculates `blast_radius_score` and identifies reachable `CRITICAL` services.
   - Spring Boot computes deterministic Rule-Based Risk score ($0.0 - 1.0$).
   - `MLFeatureBuilder` compiles an 11-dimension feature vector and queries `POST /predict` on FastAPI.
   - Result merges deterministic rule metrics with probabilistic ML predictions and rollout guidance.
4. **What-If Simulation Sandbox Workflow**:
   - User proposes candidate topological or version changes via `POST /api/simulation/what-if`.
   - Spring Boot creates an isolated clone of current service definitions and dependency lists.
   - Mutations (e.g., `ADD` or `REMOVE` edge, version jump) are applied exclusively to in-memory state.
   - Traversal and ML risk recalculations run against modified in-memory graph.
   - Comparative delta (`WhatIfComparisonDto`) is returned; PostgreSQL remains 100% untouched.
