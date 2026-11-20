# ChangeGuard — Final Project Status Report

**Project Name:** ChangeGuard  
**Subtitle:** Predictive IT Change Risk & Blast-Radius Platform for Banking Systems  
**Status Date:** September 2026  
**Nature of Project:** Academic / Engineering Prototype using Simulated Banking Services & Synthetic Telemetry Data  

---

## 1. Phase Completion Audit Table

The following audit reflects the actual codebase verification performed across backend (Spring Boot 3.3.4), ML microservice (FastAPI + scikit-learn), database (PostgreSQL 15), and frontend (React 19 + TypeScript):

| Phase | Description | Scope & Capabilities | Status |
|:-----:|:------------|:---------------------|:------:|
| **1** | **Backend Foundation** | Spring Boot 3.3.4 REST scaffold, modular packaging (`config`, `controller`, `dto`, `exception`, `model`, `repository`, `service`), JPA entities, Global Exception Handling, CORS configuration. | **COMPLETE** |
| **2** | **Database & Seed Data** | PostgreSQL schema (`01_schema.sql`), synthetic seed data (`02_seed.sql`, `DatabaseSeeder.java`), 11 banking microservices, 13 topology links, 10 change records, 10 incidents. | **COMPLETE** |
| **3** | **Dependency Graph** | Graph construction, in-memory adjacency list, Breadth-First Search (`BFS`), Depth-First Search (`DFS`), three-color cycle detection ($O(V + E)$). | **COMPLETE** |
| **4** | **Blast Radius Engine** | Downstream cascade reachability, hop-distance calculation, critical tier detection, normalized blast-radius scoring algorithm. | **COMPLETE** |
| **5** | **Rule-Based Risk Scoring** | Multi-factor risk engine: dependency weight (0.25), criticality (0.20), historical failures (0.20), complexity (0.20), blast radius (0.15). Risk levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`). | **COMPLETE** |
| **6** | **Machine Learning Service** | Scikit-learn Random Forest classifier pipeline (`n_estimators=100`, `random_state=42`), Logistic Regression baseline, preprocessing pipelines, model serialization (`joblib`). | **COMPLETE** |
| **7** | **ML Integration** | Spring Boot `MLServiceClient` (HTTP RestTemplate), fallback circuit breaker to rule-based engine on ML timeout or degradation, calibrated probability merging. | **COMPLETE** |
| **8** | **Enterprise Dashboard** | Dark-first enterprise UI (Linear/Vercel precision, Stripe clarity), compact KPI strip, interactive risk trends, service risk exposure, detail slide-over drawers. | **COMPLETE** |
| **9** | **What-If Simulator** | Isolated in-memory sandbox: hypothetical version shifts, complexity mutations, temporary edge additions/removals, comparative delta metrics (Risk delta, Blast delta). | **COMPLETE** |
| **10** | **Validation & Evaluation** | Formal evaluation benchmark (`seed=42`), 2,000 synthetic records, accuracy, precision, recall (0.8897), F1 (0.8587), ROC-AUC (0.8441), inference latency (7.48 ms). | **COMPLETE** |
| **11** | **Productionization & Docker** | Multi-stage Dockerfiles (`backend`, `ml-service`, `frontend`), `docker-compose.yml`, health check endpoints (`/api/health`), logging configuration. | **COMPLETE** |
| **12** | **Risk History & Monitoring** | Continuous change tracking, historical analysis logging (`risk_analysis_history` table), post-deployment outcome capture, confusion classification (TP, FP, TN, FN). | **COMPLETE** |
| **13** | **Intelligent Recommendations** | Automated decision support: testing safeguards, canary/staged rollout advisory, rollback preparation, historical incident root-cause evidence attribution. | **COMPLETE** |
| **14** | **Security & Audit Logging** | RBAC role personas (`ADMIN`, `ENGINEER`, `VIEWER`), tamper-evident compliance audit trail (`audit_logs` table), decoupled transactions (`REQUIRES_NEW`), sanitized error responses. | **COMPLETE** |
| **15** | **Final Documentation & Portfolio** | Comprehensive technical report, architecture specifications, algorithms, viva Q&A, presentation slides & script, demo guide, resume/LinkedIn descriptions. | **COMPLETE** |

---

## 2. Verified System Verification Matrix

- **Backend:** Spring Boot 3.3.4 compiles cleanly with zero Maven/Gradle errors.
- **Frontend:** React 19 + TypeScript compiles cleanly with zero Vite/TypeScript errors.
- **ML Service:** FastAPI application loads Random Forest artifact (`random_forest_pipeline.joblib`) with 11 input features and passes unit tests.
- **Data Integrity:** All numbers in the UI are dynamically queried from REST APIs or clearly indicate "NO DATA" / "DATA UNAVAILABLE" states.
- **Data Scope:** 100% synthetic/simulated data. No real banking customer data, secrets, or proprietary enterprise intellectual property are present.
