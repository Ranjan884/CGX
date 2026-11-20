# ChangeGuard — Presentation Deck (20-Slide Structure)

A comprehensive 20-slide presentation structure designed for final college viva, engineering capstone presentations, and technical interviews.

---

### Slide 1: Title & Overview
- **Title:** ChangeGuard — Predictive IT Change Risk & Blast-Radius Platform for Banking Systems
- **Presenter:** [Student Name] · Computer Engineering Department
- **Subtitle:** Combining Graph Theory, Machine Learning, and In-Memory Simulation for Pre-Deployment Decision Support
- **Visual:** ChangeGuard Shield Logo + Dark Enterprise Topology Visual
- **Speaker Guidance:** Introduce project, scope, and technical domain (banking microservices).

---

### Slide 2: The Core Problem
- **Points:**
  - Modern banking platforms deploy hundreds of software, database, and configuration changes weekly.
  - Microservices are tightly coupled via synchronous and asynchronous dependencies.
  - A minor change in one service can trigger catastrophic cascading outages downstream.
- **Visual:** Illustration of a single API change causing a 3-hop cascade into a core ledger database.
- **Speaker Guidance:** Emphasize that outages rarely stay isolated to the deploying service.

---

### Slide 3: Why It Matters (Financial & Regulatory Stakes)
- **Points:**
  - Average cost of financial IT downtime exceeds $1M+ per hour.
  - Regulatory mandates (DORA, PCI-DSS, Basel Committee guidelines) demand operational resilience.
  - Manual Change Advisory Board (CAB) reviews are slow, subjective, and prone to human oversight.
- **Visual:** High-impact metrics on financial downtime and regulatory compliance icons.
- **Speaker Guidance:** Contrast manual review bottlenecks with automated topological verification.

---

### Slide 4: Existing Approaches & Gaps
- **Points:**
  - **ITSM/Jira/ServiceNow:** Static questionnaires, no live dependency reachability.
  - **APM Tools (Datadog/Dynatrace):** Trace issues post-deployment (reactive, after failure occurs).
  - **CI/CD Unit Tests:** Test syntax and function in isolation, ignoring ecosystem blast radius.
- **Visual:** Timeline comparing "Where Existing Tools Act" (reactive) vs. "Where ChangeGuard Acts" (pre-deployment).
- **Speaker Guidance:** Point out that ChangeGuard provides pre-deployment analytical visibility.

---

### Slide 5: The Proposed Solution: ChangeGuard
- **Points:**
  - Pre-deployment decision-support control center.
  - Automated graph traversal across 11 banking microservices.
  - Hybrid evaluation: Deterministic Rule Safety Floor + Supervised Random Forest Classifier.
  - Zero-mutation in-memory What-If sandbox modeling.
- **Visual:** High-level platform block diagram showing the 7 core pillars.
- **Speaker Guidance:** Clearly state that ChangeGuard is a decision-support advisory system.

---

### Slide 6: System Architecture & Data Flow
- **Points:**
  - **Frontend:** React 19 + TypeScript + Tailwind CSS (Linear/Stripe-inspired dark-first UI).
  - **Backend Core:** Spring Boot 3.3.4 (REST API, graph algorithms, JPA persistence).
  - **ML Service:** Python FastAPI (scikit-learn Random Forest model artifact).
  - **Database:** PostgreSQL 15 (ACID storage for services, changes, incidents, and audit logs).
- **Visual:** Multi-tier architectural flow diagram.
- **Speaker Guidance:** Explain the decoupled architecture and REST communication between tiers.

---

### Slide 7: Algorithmic Core: Graph Traversal & Blast Radius
- **Points:**
  - Directed graph representation with in-memory adjacency lists.
  - Breadth-First Search (BFS) computes shortest hop distances in $O(V + E)$ time.
  - Depth-First Search (DFS) identifies deep multi-hop cascading chains.
  - Three-color cycle detection prevents infinite loops and circular deadlock.
- **Visual:** Step-by-step BFS queue expansion diagram with hop distances.
- **Speaker Guidance:** Explain why BFS is optimal for shortest hop-depth calculation.

---

### Slide 8: Blast-Radius Mathematical Formulation
- **Points:**
  - Normalized score (0.0 to 100.0) combining downstream volume, depth, and tier.
  - Criticality weights: Critical (1.0), High (0.75), Medium (0.50), Low (0.25).
  - Distinguishes between direct Tier-1 dependencies and multi-hop indirect cascades.
- **Visual:** The Blast Radius mathematical equation broken down into weighted components.
- **Speaker Guidance:** Emphasize that Tier-1 critical nodes contribute disproportionately to the score.

---

### Slide 9: Dual-Engine: Deterministic Rule-Based Scoring
- **Points:**
  - Weighted composite formula: Dependency (25%), Criticality (20%), Failure Rate (20%), Complexity (20%), Blast Score (15%).
  - Categorizes proposals into 4 auditable risk tiers: LOW, MEDIUM, HIGH, CRITICAL.
  - Guaranteed transparency: fully auditable for regulatory compliance and safety floors.
- **Visual:** Pie chart of factor weights summing to 100%.
- **Speaker Guidance:** Explain that rules provide explainable safety floors that never drift.

---

### Slide 10: Machine Learning Pipeline
- **Points:**
  - Problem: Supervised Binary Classification (`0` = Success, `1` = Incident).
  - 11 engineered features (blast radius, critical nodes, hop depth, complexity, version jump, etc.).
  - Evaluated on 2,000 synthetic banking records (1,600 train / 400 test, seed=42).
  - Scaled numerical features + One-Hot Encoded change categories.
- **Visual:** Pipeline diagram: Raw Features $\rightarrow$ ColumnTransformer $\rightarrow$ Random Forest.
- **Speaker Guidance:** Disclose that data is synthetic and explain the feature engineering process.

---

### Slide 11: Empirical Model Comparison & Selection
- **Points:**
  - **Random Forest:** Accuracy: 80.75%, Recall: 88.97%, F1: 0.8587, ROC-AUC: 0.8441.
  - **Logistic Regression Baseline:** Accuracy: 80.25%, Recall: 86.31%, F1: 0.8518, ROC-AUC: 0.8477.
  - Selected Random Forest because higher Recall prevents 7 additional catastrophic outages.
  - Inference Latency: 7.48 ms (well under 100ms CI/CD SLA).
- **Visual:** Confusion Matrix and ROC Curve comparison plots.
- **Speaker Guidance:** Explain why Recall is the prioritized metric in banking outage prevention.

---

### Slide 12: Feature Importance & Key Insights
- **Points:**
  - Top 1: `blast_radius_score` (21.96% Gini contribution).
  - Top 2: `critical_services_affected` (16.57% Gini contribution).
  - Top 3: `dependency_count` (13.12% Gini contribution).
  - Key finding: Topological graph position dominates local code-level parameters.
- **Visual:** Horizontal bar chart of top 10 feature importances.
- **Speaker Guidance:** Highlight that where code lives in the network matters more than who wrote it.

---

### Slide 13: Rule-Based vs. ML Disagreement Study
- **Points:**
  - Agreement rate of 55.5% on 400 test samples.
  - ML caught 140 subtle incident cases that the linear rule formula missed.
  - Rules missed cases with moderate complexity combined with multi-hop critical exposure.
  - Proves the necessity of a hybrid dual-engine architecture.
- **Visual:** 2x2 comparison matrix showing the 140 non-linear detections.
- **Speaker Guidance:** Explain how the ensemble catches non-linear threshold effects.

---

### Slide 14: What-If Change Simulator
- **Points:**
  - In-memory sandbox: zero live database mutations.
  - Test hypothetical version upgrades and complexity shifts.
  - Temporarily add or remove dependency links (architectural mutation).
  - Instantaneous comparative delta feedback: $\Delta$Risk, $\Delta$Blast Radius, $\Delta$Nodes.
- **Visual:** Side-by-side screenshot: Current State vs. Proposed State with Delta badges.
- **Speaker Guidance:** Describe how engineers can test architecture changes before staging code.

---

### Slide 15: Continuous Risk History & Monitoring
- **Points:**
  - Longitudinal tracking of all pre-deployment risk evaluations.
  - Post-deployment outcome recording (Actual Incident: Yes/No, Severity).
  - Real-time confusion matrix monitoring (True Positives, False Positives, False Negatives).
  - Identifies chronically high-risk services across release cycles.
- **Visual:** Risk History table and outcome classification badge breakdown.
- **Speaker Guidance:** Explain how this creates a closed feedback loop to improve future models.

---

### Slide 16: Intelligent Decision Support & Recommendations
- **Points:**
  - Converts quantitative risk scores into explainable engineering safeguards.
  - Examples: Additional Integration Testing, Canary Rollout, Database Lock Reviews.
  - Links recommendations directly to historical root-cause evidence from past incidents.
  - Clear governance disclaimer: Final deployment decision remains with authorized humans.
- **Visual:** Recommendation action cards with priority and supporting factors.
- **Speaker Guidance:** Emphasize explainability and historical evidence backing each recommendation.

---

### Slide 17: Security Hardening & Compliance Auditing
- **Points:**
  - Role-Based Access Control (RBAC): ADMIN, ENGINEER, VIEWER personas.
  - Read-only protection for VIEWER persona against mutating actions.
  - Tamper-evident audit logging in PostgreSQL (`audit_logs`) via decoupled transactions (`REQUIRES_NEW`).
  - Zero sensitive stack-trace leakage in production error handling.
- **Visual:** Audit Logs table showing timestamped user actions, status, and personas.
- **Speaker Guidance:** Highlight compliance readiness with banking audit standards.

---

### Slide 18: System Limitations (Integrity Disclosure)
- **Points:**
  - Synthetic data and simulated banking ecosystem (no live banking customer records).
  - Advisory decision support only; does not autonomously halt CI/CD runners.
  - Static link capacities; does not model live CPU saturation or network packet loss.
  - Static model artifact requiring periodic retraining in real enterprise settings.
- **Visual:** Clear boundary chart separating Prototype Scope from Production Requirements.
- **Speaker Guidance:** Walk through limitations clearly to demonstrate engineering rigor.

---

### Slide 19: Future Scope & Roadmap
- **Points:**
  - Graph Neural Networks (GNN) for automated topological feature embedding.
  - Large Language Model (LLM) parsing of raw Git commit diffs and database migration scripts.
  - eBPF / OpenTelemetry kernel tracing for dynamic real-time dependency discovery.
  - Native CI/CD gating plugins for GitHub Actions, ArgoCD, and GitLab.
- **Visual:** 4-quadrant future technology roadmap.
- **Speaker Guidance:** Explain where the research naturally progresses next.

---

### Slide 20: Conclusion & Summary
- **Points:**
  - Successfully demonstrated unified pre-deployment change risk control.
  - $O(V + E)$ graph algorithms + 88.97% Recall Random Forest + sub-10ms What-If simulation.
  - Replaces subjective CAB guesswork with transparent, data-driven engineering decision support.
  - Thank you — Open for Questions.
- **Visual:** ChangeGuard platform hero summary with GitHub repository links.
- **Speaker Guidance:** Reiterate the central accomplishment and open the floor for committee questions.
