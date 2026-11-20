# ChangeGuard: A Predictive IT Change Risk & Blast-Radius Platform for Core Banking Microservices

**Author:** ChangeGuard Engineering Team  
**Institution:** Computer Engineering Department  
**Date:** September 2026  
**Document Classification:** Comprehensive Technical Research Report  

---

## 1. Title
**ChangeGuard: A Predictive IT Change Risk and Blast-Radius Evaluation Platform for Core Banking Systems Combining Topological Graph Traversals, Deterministic Safety Floors, and Machine Learning Classifiers**

---

## 2. Abstract
Modern financial institutions rely on complex, distributed microservice architectures to process high-throughput, mission-critical transactions. In these environments, software, schema, and configuration updates represent significant operational and regulatory risks, as localized failures frequently cascade across interconnected services. This report documents the architecture, algorithmic methodology, and empirical evaluation of **ChangeGuard**, an enterprise pre-deployment decision-support platform designed to quantify cascading blast radius and predict change failure risk. Evaluated on a synthetic benchmark of 2,000 core banking changes under strict train/test isolation (`random_state=42`), the platform's champion Random Forest classifier achieved an accuracy of **80.75%**, a precision of **82.98%**, an F1-score of **0.8587**, and a recall of **88.97%**, successfully intercepting 234 out of 263 simulated deployment failures with an inference latency of **7.48 ms**. The system demonstrates how topological reachability ($O(V+E)$), deterministic rule-based safety floors, in-memory What-If simulation, and explainable recommendations can be integrated into an auditable pre-deployment control center.

---

## 3. Introduction
Financial software ecosystems are subject to opposing pressures: the demand for rapid feature delivery driven by open banking and regulatory mandates (e.g., ISO 20022), contrasted with strict zero-downtime tolerance. While automated continuous integration (CI) pipelines effectively evaluate syntactic correctness and isolated unit functionality, they lack visibility into the broader runtime topology of distributed systems. Consequently, unintended cascading failures continue to cause severe service disruptions.

ChangeGuard addresses this challenge by providing pre-deployment analytical visibility. By modeling the microservice ecosystem as a directed dependency graph, ChangeGuard computes downstream reachability, evaluates risk using a hybrid dual engine (deterministic rules plus machine learning), and offers an in-memory What-If simulation sandbox to test architectural refactoring prior to production deployment.

---

## 4. Problem Statement
In core banking operations, services such as payment gateways, fraud detection classifiers, customer authentication portals, and general ledgers exhibit tight directional coupling. Traditional pre-deployment change governance relies heavily on manual Change Advisory Boards (CABs) and subjective textual checklists. Reviewers cannot mentally evaluate multi-hop dependency reachability or perceive subtle multivariate risk interactions. When an unmitigated contract change or timeout modification is deployed, cascading failures propagate across downstream services, triggering customer-facing outages and violating service level agreements (SLAs).

---

## 5. Motivation
1. **Financial and Regulatory Costs:** Unplanned financial downtime costs exceeding $1M per hour, coupled with regulatory penalties under frameworks such as DORA (Digital Operational Resilience Act) and PCI-DSS.
2. **Cascading Vulnerability:** Microservice topologies amplify localized faults into systemic failures through thread pool starvation, retry storms, and message broker backpressure.
3. **Operational Velocity:** Traditional manual review boards create artificial engineering bottlenecks without providing data-driven risk guarantees.

---

## 6. Objectives
1. Model directed microservice communication links across synchronous and asynchronous protocols.
2. Implement Breadth-First Search (BFS) and Depth-First Search (DFS) graph traversals ($O(V+E)$) to trace exact cascading reachability.
3. Formulate a normalized mathematical blast-radius metric incorporating service criticality tiers.
4. Develop an auditable, deterministic rule-based risk scoring engine.
5. Train, evaluate, and serve a supervised Random Forest classifier for probabilistic failure prediction.
6. Provide an isolated in-memory What-If simulation sandbox with real-time delta feedback.
7. Maintain longitudinal risk history and post-deployment outcome monitoring.
8. Deliver an explainable recommendation engine grounded in empirical incident root causes.
9. Enforce Role-Based Access Control (RBAC) and tamper-evident audit logging.
10. Implement a dark-first, developer-centric control center with global command palette search (`⌘K`).

---

## 7. Existing Approaches
- **IT Service Management (ITSM) / Ticketing (Jira, ServiceNow):** Collects qualitative risk descriptions; lacks runtime topological awareness.
- **Application Performance Monitoring (APM) (Datadog, Dynatrace):** Traces runtime dependencies reactively *after* code is deployed to production.
- **CI/CD Unit Testing Suites:** Tests functions in isolation without visibility into cross-service cascading impacts.

---

## 8. Proposed System: ChangeGuard
ChangeGuard is structured as a multi-tier pre-deployment control center combining graph theory, deterministic formulas, and supervised learning. It intercepts change proposals during the planning and staging phase, calculates exact reachability, produces dual-engine risk scores, and provides interactive simulation without modifying production databases.

---

## 9. Architecture
The ChangeGuard platform is organized into four decoupled tiers:
1. **Client Presentation Tier (React 19 + TypeScript):** Modern single-page application utilizing Vite, Tailwind CSS, Motion for React, and React Flow.
2. **Backend Core Gateway (Spring Boot 3.3.4 / Java 17):** Executes graph traversals, calculates blast radii, manages business rules, coordinates REST communications, and enforces security policies.
3. **Persistent Database (PostgreSQL 15):** Relational storage maintaining six core tables: `services`, `dependencies`, `changes`, `incidents`, `risk_analysis_history`, and `audit_logs`.
4. **Machine Learning Microservice (FastAPI / Python 3.10):** Asynchronous microservice serving the serialized Scikit-learn Random Forest model pipeline (`joblib`).

---

## 10. Methodology
Change proposals are evaluated sequentially through:
1. Graph parsing and adjacency list mapping.
2. BFS downstream reachability traversal.
3. Blast radius score calculation.
4. Parallel execution of the deterministic rule formula and the FastAPI Random Forest classifier.
5. Correlation with historical incident records.
6. Recommendation and safeguard synthesis.

---

## 11. Dependency Graph Modeling
The topology is represented as a directed graph $G = (V, E)$, with 11 banking services and 13 directed protocol links (`REST_API`, `gRPC`, `JDBC_POOL`, `KAFKA_TOPIC`, `EVENT_STREAM`). In-memory adjacency representations enable $O(V+E)$ BFS queue traversals and three-color (White, Gray, Black) cycle detection.

---

## 12. Blast Radius Formulation
$$\text{BlastRadiusScore}(s) = \min\left(100.0, \; \left( \frac{\sum_{v \in \text{Downstream}(s)} W_{\text{criticality}}(v)}{|V| \times W_{\text{max}}} \times 60 \right) + \left( \frac{D_{\text{max}}}{D_{\text{norm}}} \times 20 \right) + \left( \frac{|\text{Direct}(s)|}{|\text{Downstream}(s)| + 1} \times 20 \right) \right)$$
Criticality weights $W_{\text{criticality}}$ are assigned as: Critical (1.0), High (0.75), Medium (0.50), Low (0.25).

---

## 13. Rule-Based Risk Engine
$$\text{RiskScore} = (0.25 \cdot \text{DepImpact}) + (0.20 \cdot \text{Criticality}) + (0.20 \cdot \text{FailureRate}) + (0.20 \cdot \text{Complexity}) + (0.15 \cdot \text{BlastScore})$$
The score is mapped to discrete regulatory tiers: LOW ($<0.40$), MEDIUM ($0.40–0.59$), HIGH ($0.60–0.74$), and CRITICAL ($\ge 0.75$).

---

## 14. Machine Learning Implementation
- **Algorithm:** Scikit-learn `RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)`.
- **Pipeline:** `ColumnTransformer` applying `StandardScaler` to 10 numerical features and `OneHotEncoder` to the categorical `change_type` feature.
- **Inference Latency:** 7.48 ms per prediction.

---

## 15. What-If Simulation Engine
An in-memory sandbox that deep-clones graph state in JVM heap memory. Users can apply hypothetical version upgrades or edge additions/removals (e.g., adding a direct link between Payment Service and Reconciliation Service). The engine recomputes BFS traversals and returns comparative deltas ($\Delta\text{Risk}$, $\Delta\text{Blast}$) in under 10 ms with zero database writes.

---

## 16. Historical Analysis & Outcome Monitoring
Continuous change monitoring logs every pre-deployment analysis to the `risk_analysis_history` table. Post-deployment outcome updates (`PATCH /api/risk-history/{id}/outcome`) dynamically classify records into realized confusion outcomes (True Positive, False Positive, True Negative, False Negative), maintaining longitudinal model validity.

---

## 17. Recommendation Engine
Translates quantitative scores into prioritized operational safeguards:
- **Mandatory Canary Rollouts:** Triggered for high blast-radius changes on critical services.
- **Integration Testing Requirements:** Triggered when downstream critical nodes are reachable.
- **Historical Evidence Linking:** Directly attaches historical incident root causes from identical services to justify recommendations.

---

## 18. Security & RBAC Governance
- **Role-Based Access Control:** Three personas (`ADMIN`, `ENGINEER`, `VIEWER`).
- **Read-Only Enforcement:** Controllers intercept `X-User-Role` headers and reject mutating calls from Viewers with HTTP 403 Forbidden.
- **Audit Logging:** Decoupled transactions (`@Transactional(propagation = Propagation.REQUIRES_NEW)`) guarantee audit persistence even during failed operations.
- **Sanitized Errors:** Production exceptions are logged internally via SLF4J, while generic non-leaking error responses are returned to clients.

---

## 19. MLOps & System Productionization
- **Artifact Versioning:** Serialized model artifacts stored with metadata in `ml-service/models/`.
- **Multi-Stage Containerization:** Docker configurations (`Dockerfile.backend`, `Dockerfile.ml`, `Dockerfile.frontend`) orchestrated via `docker-compose.yml`.
- **Health Checks:** Multi-tier diagnostic endpoint (`GET /api/health`) tracking database, backend, and inference engine connectivity.

---

## 20. Experimental Setup
- **Dataset:** 2,000 synthetic banking change records (seed=42).
- **Split:** 1,600 training samples (80%), 400 held-out test samples (20%).
- **Class Balance (Test Set):** 137 successful changes ($y=0$), 263 failed changes ($y=1$).
- **Hardware:** Standard containerized environment (Linux x86_64, 4 vCPU, 8GB RAM).

---

## 21. Empirical Results & Findings
- **Model Benchmark (Test Partition, $N=400$):**
  - **Random Forest:** Accuracy: **80.75%**, Precision: **82.98%**, Recall: **88.97%**, F1-Score: **0.8587**, ROC-AUC: **0.8441**.
  - **Logistic Regression:** Accuracy: 80.25%, Precision: 84.07%, Recall: 86.31%, F1-Score: 0.8518, ROC-AUC: 0.8477.
- **Feature Importance Ranking:**
  1. `blast_radius_score` (21.96%)
  2. `critical_services_affected` (16.57%)
  3. `dependency_count` (13.12%)
  4. `change_complexity` (9.32%)
  5. `criticality_score` (7.66%)
- **Disagreement Finding:** Random Forest detected 140 non-linear failure combinations that the linear rule formula missed, proving the value of the dual-engine architecture.

---

## 22. Limitations
1. **Synthetic Data:** The dataset is synthetic and does not represent live bank telemetry.
2. **Decision Support Only:** The system does not autonomously halt CI/CD pipelines.
3. **Static Links:** Network link capacities and dynamic CPU queuing are not simulated.
4. **Static ML Artifact:** Periodic retraining is required to mitigate potential model drift.

---

## 23. Future Scope
1. **Graph Neural Networks (GNN):** Automated topology embedding extraction via Graph Convolutional Networks (GCN).
2. **NLP Diff Analysis:** Parsing raw Git commit diffs and database migration scripts using Large Language Models (LLMs).
3. **eBPF Tracing:** Automated runtime dependency discovery directly from Linux kernel network traffic.
4. **CI/CD Plugins:** Native GitHub Actions and GitLab CI/CD runner integration for automated PR gating.

---

## 24. Conclusion
ChangeGuard demonstrates that pre-deployment change governance can be transformed from a subjective manual bottleneck into an automated, data-driven discipline. By integrating $O(V+E)$ graph algorithms, deterministic regulatory safety floors, an 88.97% recall Random Forest classifier, and an in-memory What-If simulation sandbox, ChangeGuard provides a solid engineering foundation for safeguarding core banking architectures against cascading change-induced outages.

---

## 25. References
1. Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2009). *Introduction to Algorithms* (3rd ed.). MIT Press.
2. Tarjan, R. (1972). *Depth-First Search and Linear Graph Algorithms*. SIAM Journal on Computing, 1(2), 146–160.
3. Breiman, L. (2001). *Random Forests*. Machine Learning, 45(1), 5–32.
4. Pedregosa, F., et al. (2011). *Scikit-learn: Machine Learning in Python*. Journal of Machine Learning Research, 12, 2825–2830.
5. Fowler, M., & Lewis, J. (2014). *Microservices: a definition of this new architectural term*. martinfowler.com.
6. Spring Boot Framework Documentation (v3.3.4). VMware, Inc.
7. FastAPI Framework Documentation (v0.100+). Tiangolo.
