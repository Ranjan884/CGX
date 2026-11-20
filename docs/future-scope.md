# ChangeGuard — Future Scope & Research Directions

The following enhancements represent recommended future engineering and academic research directions for the ChangeGuard platform. **These items are explicitly categorized as FUTURE WORK and are not implemented in the current prototype.**

---

## 1. Graph Neural Networks (GNN) for Topology Embedding
- **Current State:** Handcrafted topological features (`dependency_count`, `dependency_depth`, `blast_radius_score`).
- **Future Direction:** Implement Graph Convolutional Networks (GCN) or Graph Attention Networks (GAT) to learn latent vector representations directly from the raw microservice topology graph, capturing complex structural sub-graph patterns without manual feature engineering.

---

## 2. Ingestion of Unstructured Artifacts (NLP & LLM Analysis)
- **Current State:** Structured categorical and numerical change parameters.
- **Future Direction:** Integrate Large Language Model (LLM) embeddings to parse unstructured Git commit diffs, Pull Request discussion threads, and database DDL migration scripts to detect subtle breaking changes (e.g., column drop without deprecation period, regex flaws).

---

## 3. Real-Time Distributed Tracing Integration (eBPF / OpenTelemetry)
- **Current State:** Static dependency links defined in relational database tables.
- **Future Direction:** Ingest real-time OpenTelemetry trace spans or kernel-level eBPF network telemetry (e.g., Cilium, Pixie) to continuously and automatically discover runtime service dependencies, call rates (RPS), and p99 latency degradation.

---

## 4. Automated CI/CD Webhook & Deployment Gating Integration
- **Current State:** Standalone decision-support UI dashboard.
- **Future Direction:** Develop native plugins for GitHub Actions, GitLab CI/CD, ArgoCD, and Spinnaker to automatically post risk evaluation badges on pull requests and conditionally block deployments if risk exceeds configurable enterprise thresholds.

---

## 5. Enterprise Identity & Compliance (SAML 2.0 / OAuth2 / OIDC)
- **Current State:** Request header role simulation (`ADMIN`, `ENGINEER`, `VIEWER`).
- **Future Direction:** Integrate enterprise identity providers (Keycloak, Okta, Azure Active Directory) with JWT token verification and cryptographically signed audit logs stored in write-once-read-many (WORM) compliant object storage.

---

## 6. Continuous Model Monitoring & Drift Detection (MLOps)
- **Current State:** Static serialized model artifacts (`joblib`).
- **Future Direction:** Deploy an automated MLOps pipeline incorporating drift detection (Kolmogorov-Smirnov feature drift tests), automated scheduled retraining on new realized incident records, and shadow canary model deployment.
