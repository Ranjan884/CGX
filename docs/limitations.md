# ChangeGuard — System Limitations

To maintain academic and professional integrity, the operational limitations of the ChangeGuard prototype are explicitly documented below.

---

## 1. Synthetic Data & Environment
- **No Real Banking Production Data:** All 2,000 change records, 10 seeded incidents, and 11 microservice topologies are synthetic constructs.
- **Controlled Failure Distributions:** Synthetic incident generation assumes specific parametric distributions (Beta and Bernoulli) that do not replicate the chaotic clustering of real-world enterprise outages (e.g., nationwide telecom blackouts, AWS regional availability zone failures).

---

## 2. Decision Support, Not Autonomous Control
- **No Autonomous Deployment Gating:** ChangeGuard is purely an analytical **decision-support advisory engine**. It does not possess authority to automatically halt CI/CD runners, reject Git pull requests, or trigger autonomous Kubernetes rollback commands.
- **Human Responsibility:** Final change approval, execution, and emergency rollbacks remain strictly with certified engineering personnel and Change Advisory Boards.

---

## 3. Simplified Topology Modeling
- **Static Edge Representations:** The directed graph models protocol types (`REST_API`, `gRPC`, `JDBC_POOL`, `KAFKA_TOPIC`), but assumes infinite link capacity and static availability.
- **No Dynamic Runtime Telemetry Ingestion:** The prototype does not parse real-time distributed tracing spans (e.g., OpenTelemetry, eBPF network packets) or live CPU/memory saturation metrics during the analysis phase.
- **Resilience Mechanisms Not Dynamically Simulated:** Dynamic runtime circuit-breaker trips (e.g., Netflix Hystrix / Resilience4j half-open states) and rate-limiter shedding are not modeled dynamically in the current graph algorithms.

---

## 4. Machine Learning & Model Drift
- **Prototype Feature Dimension:** The model relies on 11 engineered features. It does not ingest unstructured artifacts such as Git commit diffs, pull request comments, or Jira conversation text.
- **Static Model Artifact:** The Random Forest classifier was trained in batch mode. It does not currently implement continuous online learning or automated retraining pipelines in production.
- **Potential Model Drift:** In a real production deployment, changes in microservice architectures or development practices would degrade model accuracy over time unless monitored by automated drift detection pipelines (e.g., Evidently AI, KS-tests).

---

## 5. Security & Authentication Scoping
- **Simulated RBAC Headers:** Role enforcement (`ADMIN`, `ENGINEER`, `VIEWER`) is validated via request headers (`X-User-Role`) for demonstration and audit logging. It does not integrate with enterprise Single Sign-On (SSO) protocols such as SAML 2.0, OpenID Connect, or Okta.
- **In-Memory What-If Isolation:** What-If scenario mutations are confined to JVM heap memory and are not persisted across backend container restarts.
