# ChangeGuard — Project Architecture & Data Flow Representation

This document details the text-based architecture, execution pipeline, and component interaction flows verified across the ChangeGuard codebase.

---

## 1. High-Level Decision Support Pipeline

```
           [ Proposed Technical Change ]
            (Service, Version, Complexity)
                         │
                         ▼
        ┌───────────────────────────────────┐
        │ 1. Dependency Graph Construction  │
        │    In-Memory Adjacency List (BFS) │
        └───────────────────────────────────┘
                         │
                         ▼
        ┌───────────────────────────────────┐
        │ 2. Blast-Radius Cascade Engine    │
        │    Shortest-path Downstream Reach │
        └───────────────────────────────────┘
                         │
                         ▼
        ┌───────────────────────────────────┐
        │ 3. Dual-Engine Risk Evaluation    │
        │    ├─ Phase 5: Deterministic Rule │
        │    └─ Phase 7: FastAPI ML Model   │
        └───────────────────────────────────┘
                         │
                         ▼
        ┌───────────────────────────────────┐
        │ 4. Historical Context & Evidence  │
        │    Post-mortem Root-Cause Lookup  │
        └───────────────────────────────────┘
                         │
                         ▼
        ┌───────────────────────────────────┐
        │ 5. What-If Simulation Sandbox     │
        │    In-Memory Cloned Edge Mutation │
        └───────────────────────────────────┘
                         │
                         ▼
        ┌───────────────────────────────────┐
        │ 6. Explainable Decision Support   │
        │    Canary / Staged Safeguards     │
        └───────────────────────────────────┘
                         │
                         ▼
        ┌───────────────────────────────────┐
        │ 7. Executive Dashboard & Review   │
        │    Human Engineer CAB Decision    │
        └───────────────────────────────────┘
```

---

## 2. Multi-Tier Distributed Communication Topology

```
┌────────────────────────────────────────────────────────┐
│               REACT 19 FRONTEND CLIENT                 │
│        (Vite, TypeScript, Tailwind CSS, Motion)        │
│  - Risk Overview Dashboard                             │
│  - React Flow Topology Canvas                          │
│  - 3-Stage Risk Analysis Stepper                       │
│  - What-If Comparison Sandbox                          │
│  - Command Palette (⌘K) & Audit Log Inspector          │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP JSON / REST
                            │ (Header: X-User-Role)
                            ▼
┌────────────────────────────────────────────────────────┐
│            SPRING BOOT 3.3.4 BACKEND CORE              │
│                 (OpenJDK 17 / Port 8080)               │
│                                                        │
│  Controllers:                                          │
│  ├── ServiceController, DependencyController           │
│  ├── ChangeController, RiskController                  │
│  ├── WhatIfController, RiskHistoryController           │
│  ├── RecommendationController, AuditLogController     │
│                                                        │
│  Core Services:                                        │
│  ├── DependencyService (Adjacency List, BFS, DFS)      │
│  ├── BlastRadiusService (Formula & Downstream Tree)    │
│  ├── RiskAnalysisService (Deterministic Weights)       │
│  ├── WhatIfSimulationService (Cloned Graph Sandbox)    │
│  ├── RecommendationService (Evidence Extraction)       │
│  └── AuditLogService (@Transactional REQUIRES_NEW)     │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               │ HTTP REST                │ Spring Data JPA
               │ (RestTemplate)           │ (Hibernate ORM)
               ▼                          ▼
┌────────────────────────────┐ ┌─────────────────────────┐
│     FASTAPI ML SERVICE     │ │      POSTGRESQL 15      │
│   (Python 3.10 / Port 8000)│ │       (Port 5432)       │
│                            │ │                         │
│  - RandomForest Pipeline   │ │  - services             │
│  - Standard Scaler         │ │  - dependencies         │
│  - OneHot Categorical      │ │  - changes              │
│  - Metrics / Health APIs   │ │  - incidents            │
│  - Inference Latency:      │ │  - risk_analysis_history│
│    7.48 ms                 │ │  - audit_logs           │
└────────────────────────────┘ └─────────────────────────┘
```

---

## 3. What-If Simulation Isolation Flow

```
[Production Graph in Heap] ─────────► [Clone Deep Copy in Memory]
                                                   │
                                                   ▼
                                      [Apply Temporary Edge Shifts]
                                      (e.g., ADD Payment → Recon)
                                                   │
                                                   ▼
                                      [Execute BFS on Cloned Graph]
                                                   │
                                                   ▼
                                      [Compute Proposed Blast & Risk]
                                                   │
                                                   ▼
                                      [Calculate Comparative Deltas]
                                      (ΔRisk: +7%, ΔBlast: +5.4)
                                                   │
                                                   ▼
                                      [Discard Cloned Graph State]
                                      (Zero SQL Writes to Postgres)
```
