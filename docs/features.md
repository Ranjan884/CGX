# ChangeGuard — Complete Feature Documentation

This document describes all functional capabilities implemented across the ChangeGuard platform.

---

## 1. Banking Service Catalog
- **Purpose:** Central inventory of all microservices operating within the simulated banking ecosystem.
- **Input:** Database entities loaded from PostgreSQL `services` table.
- **Processing:** Exposes REST endpoints (`GET /api/services`, `GET /api/services/{id}`) with criticality filtering (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
- **Output:** Structured JSON containing service ID, name, architectural type (`FRONTEND`, `GATEWAY`, `SECURITY`, `CORE`, `PAYMENT`, `SECURITY_ML`, `DATABASE`, `MESSAGING`, `BATCH`, `ANALYTICS`), running version, and status (`ACTIVE`).
- **Limitations:** Synthetic banking catalog; does not synchronize with live cloud service registries (e.g., Consul, Eureka).

---

## 2. Directed Dependency Graph
- **Purpose:** Models synchronous and asynchronous call links between microservices.
- **Input:** Source service ID, target service ID, protocol type, and link criticality.
- **Processing:** In-memory adjacency list built in Spring Boot `DependencyService`; supports cycle detection via three-color graph coloring (White, Gray, Black).
- **Output:** Directed node-edge topology rendered via React Flow with distinct protocol labels (`REST_API`, `gRPC`, `JDBC_POOL`, `KAFKA_TOPIC`, `EVENT_STREAM`).
- **Limitations:** Static configuration links; does not parse dynamic distributed trace spans (e.g., OpenTelemetry span tags) in real time.

---

## 3. Algorithmic BFS & DFS Traversal
- **Purpose:** Tracing exact failure propagation paths from any originating node.
- **Input:** Starting service ID.
- **Processing:**
  - **BFS:** Queue-based shortest-hop reachability calculation ($O(V + E)$).
  - **DFS:** Recursive deep path traversal with visited set tracking ($O(V + E)$).
- **Output:** Ordered visitation sequence, reachability depth per node, and cycle validation flag.
- **Limitations:** Assumes static edge weights; does not factor in transient circuit breaker states (e.g., Resilience4j half-open state).

---

## 4. Blast-Radius Calculation Engine
- **Purpose:** Quantifying the blast radius of a failure originating at a specific service.
- **Input:** Target service ID and topology graph.
- **Processing:** Traverses downstream dependents, categorizes nodes into direct (Tier 1) and indirect (Tier 2+) dependencies, counts critical services, and computes a normalized blast score (0–100).
- **Output:** `BlastRadiusResult` DTO with score, total affected count, critical affected count, and hop depth mapping.
- **Limitations:** Mathematical formula based on graph topology; does not simulate database connection pool saturation under real load.

---

## 5. Multi-Factor Rule-Based Risk Scoring
- **Purpose:** Providing a deterministic, auditable baseline risk score for proposed changes.
- **Input:** `RiskAnalysisRequest` (service ID, change type, complexity, version shift).
- **Processing:** Applies weighted formula: Dependency Impact (25%), Criticality (20%), Historical Failure Rate (20%), Complexity (20%), Blast Radius (15%).
- **Output:** Consolidated risk score (0.00–1.00), risk percentage (0–100%), and risk level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **Limitations:** Weights are configurable project assumptions, not banking industry regulatory constants.

---

## 6. Machine Learning Failure Prediction
- **Purpose:** Probabilistic circuit breaker identifying subtle multivariate risk combinations.
- **Input:** 11-dimensional feature vector.
- **Processing:** Supervised Random Forest pipeline in FastAPI scoring failure probability.
- **Output:** Continuous failure probability (0.00–1.00), discrete prediction (0/1), and risk level.
- **Limitations:** Trained on synthetic dataset (2,000 samples); does not represent empirical production bank incident logs.

---

## 7. What-If Change Simulator
- **Purpose:** Zero-mutation sandbox for modeling architectural and technical changes before committing tickets.
- **Input:** Target service, proposed complexity, proposed versions, and in-memory topology alterations (ADD / REMOVE edges).
- **Processing:** Clones graph state in-memory, mutates temporary edges, re-runs BFS/DFS and blast radius, and computes comparative deltas.
- **Output:** Current state vs. Proposed state comparison, with delta risk score, delta blast radius, and new nodes affected.
- **Limitations:** Transient in-memory state; does not persist simulated edges to the database.

---

## 8. Continuous Risk History & Post-Deployment Monitoring
- **Purpose:** Longitudinal tracking of pre-deployment analyses and realized outcomes.
- **Input:** Pre-deployment analysis events and post-deployment outcome updates.
- **Processing:** Logs records to `risk_analysis_history` table; calculates realized confusion matrix (TP, FP, TN, FN).
- **Output:** History table, trend aggregations, and high-risk service rankings.
- **Limitations:** Outcomes are manually or programmatically recorded; does not ingest live PagerDuty webhook payloads.

---

## 9. Intelligent Change Recommendations
- **Purpose:** Advisory decision support translating quantitative scores into actionable safeguards.
- **Input:** Risk score, blast radius, change type, and historical incident records.
- **Processing:** Rule-and-evidence engine generating prioritized safeguards (Integration Testing, Canary Rollout, Rollback Prep).
- **Output:** List of actionable recommendations with priority, justification, and historical evidence.
- **Limitations:** Purely advisory decision support; does not autonomously block CI/CD pipelines.

---

## 10. Security, RBAC & Governance Audit Trail
- **Purpose:** Regulatory compliance, access control, and tamper-evident event logging.
- **Input:** Request headers (`X-User-Role`), user actions.
- **Processing:** Enforces RBAC permissions (`ADMIN`, `ENGINEER`, `VIEWER`), records events in decoupled transactions (`audit_logs` table), sanitizes exception responses.
- **Output:** Audit log table with filterable action categories and system diagnostics.
- **Limitations:** Educational RBAC header simulation; does not integrate with enterprise SAML / Okta SSO identity providers.
