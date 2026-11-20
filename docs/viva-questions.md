# ChangeGuard — Viva Voce Questions & Answers (45 Questions)

A comprehensive guide of 45 likely questions and clear, technically sound student answers for academic defense, viva voce examinations, and technical engineering interviews.

---

## Category 1: Project Overview & Motivation

### Q1: What is ChangeGuard?
**A:** ChangeGuard is a pre-deployment decision-support control center that analyzes proposed technical changes in a microservice ecosystem (modeled after core banking architectures) to predict failure probability, quantify cascading blast radius, simulate hypothetical What-If scenarios, and recommend actionable deployment safeguards.

### Q2: Why did you choose the core banking domain?
**A:** Banking systems have strict zero-downtime tolerance, high regulatory scrutiny (such as DORA and PCI-DSS), and tightly coupled, multi-hop dependency topologies. A failure in an API or database partition can cascade into customer apps and clearing networks, making pre-deployment risk estimation exceptionally valuable.

### Q3: Does ChangeGuard use real banking customer data?
**A:** No. To maintain complete security and ethical integrity, ChangeGuard uses 100% synthetic and simulated data. The services, topologies, changelogs, and incidents are synthetic constructs created for academic benchmarking and methodology demonstration.

### Q4: Does ChangeGuard automatically deploy or block changes?
**A:** No. ChangeGuard is strictly an analytical decision-support system. It provides quantitative scores, blast radius perimeters, and advisory recommendations. The final deployment, rollback, and approval authority remains strictly with authorized human engineers and Change Advisory Boards.

---

## Category 2: Data Structures & Graph Algorithms

### Q5: How is the microservice dependency topology modeled?
**A:** The topology is modeled as a directed graph $G = (V, E)$, where vertices $V$ represent microservices and directed edges $E$ represent directional communication links (e.g., $u \rightarrow v$ means service $u$ calls service $v$). In Spring Boot, this is represented using an in-memory adjacency list mapping service IDs to lists of downstream target entities.

### Q6: Why did you choose Breadth-First Search (BFS) for blast-radius calculation?
**A:** BFS traverses graph levels uniformly using a FIFO queue. This ensures that the first time a downstream node is discovered, it is reached via the shortest path. This gives us the exact minimum hop distance from the changed service to all affected downstream nodes in $O(|V| + |E|)$ time.

### Q7: When do you use Depth-First Search (DFS)?
**A:** DFS is used when we want to identify the deepest linear dependency chain and trace recursive downstream execution paths to find the maximum theoretical cascade depth.

### Q8: What is the computational complexity of your graph traversals?
**A:** Both BFS and DFS run in $O(|V| + |E|)$ time complexity, where $|V|$ is the number of services (11 in our benchmark) and $|E|$ is the number of links (13). Space complexity is $O(|V|)$ to maintain visited sets and distance maps.

### Q9: How do you detect and handle circular dependencies?
**A:** We implement a three-color graph coloring algorithm (White = unvisited, Gray = currently visiting in recursion stack, Black = fully explored). If a search encounters a Gray neighbor, a back-edge exists, indicating a cycle. When detected, the cycle flag is raised and the path is returned to prevent infinite loops during traversal.

### Q10: What is the difference between direct and indirect blast radius?
**A:** A direct dependency is a Tier-1 service that the root service directly calls (hop depth = 1). An indirect dependency is a multi-hop service reachable only through intermediary microservices (hop depth $\ge 2$). In an outage, indirect dependencies often fail due to cascading timeouts or connection pool exhaustion.

---

## Category 3: Risk Scoring & Formulations

### Q11: How is the Blast Radius score calculated?
**A:** It uses a normalized formula that sums the criticality weights of all reachable downstream services (Critical=1.0, High=0.75, Medium=0.50, Low=0.25), scaled by the total ecosystem size, plus normalized hop depth and direct dependency ratios, yielding a score between 0.0 and 100.0.

### Q12: How is the rule-based risk score calculated?
**A:** It computes a weighted linear combination of five normalized factors:
$\text{Risk} = (0.25 \cdot \text{Dependency Impact}) + (0.20 \cdot \text{Service Criticality}) + (0.20 \cdot \text{Historical Failure Rate}) + (0.20 \cdot \text{Complexity}) + (0.15 \cdot \text{Blast Radius Score})$. The weights sum to 1.0.

### Q13: Are these weights banking industry standards?
**A:** No. These weights are configurable project assumptions chosen to demonstrate a balanced multi-factor model. In a commercial deployment, institutions would calibrate these weights based on historical operational audit data.

### Q14: How are risk scores converted into discrete risk levels?
**A:** Using configured threshold boundaries: $\ge 0.75$ is CRITICAL, $0.60–0.74$ is HIGH, $0.40–0.59$ is MEDIUM, and $< 0.40$ is LOW.

---

## Category 4: Machine Learning & MLOps

### Q15: What is the machine learning task and target variable?
**A:** It is a supervised binary classification task. The target variable is `incident_occurred`, where `0` represents a successful change deployment and `1` represents an operational incident or failure.

### Q16: What features are passed to the ML model?
**A:** 11 features: change complexity, dependency count, dependency depth, criticality score, historical failure rate, blast radius score, critical services affected, previous incidents, service age, version change size, and change classification category.

### Q17: Why did you compare Logistic Regression and Random Forest?
**A:** Logistic Regression served as a transparent, linear probabilistic baseline. Random Forest was evaluated as a non-parametric ensemble capable of learning non-linear decision boundaries and complex feature interactions.

### Q18: What were the empirical results of your model evaluation?
**A:** On our 400-sample test set (seed=42):
- Random Forest achieved 80.75% accuracy, 82.98% precision, 88.97% recall, and an F1-score of 0.8587.
- Logistic Regression achieved 80.25% accuracy, 84.07% precision, 86.31% recall, and an F1-score of 0.8518.

### Q19: Why was Random Forest selected over Logistic Regression despite slightly lower precision?
**A:** Because of its higher Recall (88.97% vs. 86.31%). In banking outage prevention, False Negatives (missing an outage-causing change) are far more dangerous than False Positives (over-warning on a safe change). Random Forest caught 7 additional catastrophic incidents that Logistic Regression missed.

### Q20: What did the Gini feature importance analysis reveal?
**A:** Topological features dominated the model: `blast_radius_score` was #1 (21.96%), followed by `critical_services_affected` (16.57%) and `dependency_count` (13.12%). Where code is placed in the architecture matters more than the local change type.

### Q21: What is the single-sample inference latency of the ML service?
**A:** 7.48 milliseconds for Random Forest (and 2.35 ms for Logistic Regression), well within the typical 100 ms CI/CD pipeline SLA.

### Q22: What did your rule-versus-ML disagreement analysis prove?
**A:** Across the 400 test records, the ML model caught 140 incidents that the linear rule formula missed. This proved that tree ensembles capture nonlinear threshold effects (e.g., moderate complexity combined with two-hop critical exposure) that fixed linear weights fail to identify.

---

## Category 5: What-If Simulation

### Q23: What is the What-If Simulator and why is it unique?
**A:** It is an isolated in-memory sandbox that allows engineers to evaluate hypothetical architectural changes—such as upgrading versions or temporarily adding/removing dependencies—before touching production databases or committing code.

### Q24: How does the What-If simulator guarantee data isolation?
**A:** It clones the current graph state in heap memory, applies temporary edge mutations to the cloned adjacency list, re-computes BFS and risk metrics on the cloned graph, and discards the transient state without issuing any SQL `INSERT`, `UPDATE`, or `DELETE` statements.

### Q25: What metrics does the What-If simulator return?
**A:** It returns a side-by-side comparison between the Current State and Proposed State, including Delta Risk Score ($\Delta\text{Risk}$), Delta Blast Radius ($\Delta\text{Blast}$), Delta Critical Nodes, and a list of newly affected services.

---

## Category 6: Architecture & Implementation

### Q26: Why use a decoupled architecture (Spring Boot + FastAPI + React)?
**A:** Separation of concerns: Java/Spring Boot provides robust enterprise typing, transaction management, and low-latency graph execution. Python/FastAPI provides native access to the scikit-learn data science ecosystem. React provides a responsive, component-driven client.

### Q27: How does Spring Boot communicate with the ML service?
**A:** Via synchronous HTTP REST requests using Spring's `RestTemplate` (wrapped in `MLServiceClient`). If the ML microservice is slow or unavailable, a fallback circuit breaker gracefully defaults to rule-based scoring without crashing the user request.

### Q28: What database did you use and what is the schema?
**A:** PostgreSQL 15. The schema contains six core tables: `services`, `dependencies`, `changes`, `incidents`, `risk_analysis_history`, and `audit_logs`, with foreign key constraints and B-tree indexes on foreign keys and timestamps.

### Q29: How did you implement dark mode and UI performance?
**A:** We designed a dark-first fintech interface using Tailwind CSS custom tokens (`#090B10`, `#0F1219`, `#131720`). For UI performance, we avoid heavy continuous animations, use hardware-accelerated CSS transforms for drawers, and employ React Flow for virtualized topology canvas rendering.

---

## Category 7: Security, RBAC & Governance

### Q30: What user roles are implemented in ChangeGuard?
**A:** Three RBAC personas: `ADMIN` (full system access, audit logs, configuration), `ENGINEER` (propose changes, run What-If, record outcomes), and `VIEWER` (read-only inspection of dashboards and topology).

### Q31: How is read-only access enforced for VIEWERs?
**A:** In the frontend, mutating action buttons are disabled with informative tooltips. In the backend, controllers inspect the `X-User-Role` header and throw a `SecurityException` (HTTP 403 Forbidden) if a VIEWER attempts to invoke `POST /api/changes` or `PATCH /api/risk-history/{id}/outcome`.

### Q32: How is the audit log implemented?
**A:** Through `AuditLogService` using Spring's `@Transactional(propagation = Propagation.REQUIRES_NEW)`. This ensures that audit records are committed in an independent database transaction even if the parent business transaction fails or is rejected.

### Q33: How do you prevent sensitive stack traces from leaking to clients?
**A:** Our `GlobalExceptionHandler` intercepts unhandled `Exception.class`, logs the full stack trace securely to server logs using SLF4J, and returns a sanitized JSON response with a generic message and standard HTTP 500 status.

---

## Category 8: Recommendations & Continuous Monitoring

### Q34: How are intelligent recommendations generated?
**A:** The `RecommendationService` evaluates the risk tier, blast radius, change type, and past incident root causes on the service. It applies explainable heuristic rules to generate prioritized safeguards (e.g., Mandatory Canary Rollout, Multi-tenant Isolation Test, Database Lock Contention Review).

### Q35: How does the system use historical incident evidence?
**A:** When generating recommendations, the engine queries the `incidents` table for past failures on the target service. If similar past changes caused outages (e.g., API contract mismatches), it extracts their actual root-cause summaries and attaches them as empirical justification.

### Q36: How does post-deployment outcome recording work?
**A:** Operations teams submit a `PATCH /api/risk-history/{id}/outcome` payload specifying whether an incident occurred and its severity. The system updates the historical record and dynamically recomputes the realized confusion classification (True Positive, False Positive, True Negative, False Negative).

---

## Category 9: Limitations & Integrity

### Q37: Can ChangeGuard predict outages caused by third-party cloud failures?
**A:** No. If AWS or a third-party telecom provider suffers an infrastructure blackout unrelated to software changes, ChangeGuard cannot predict it because its scope is pre-deployment change risk, not real-time external cloud monitoring.

### Q38: How does the system handle model drift in production?
**A:** In the current prototype, the model is a static artifact. In an enterprise production deployment, an automated MLOps pipeline with Kolmogorov-Smirnov drift detection and scheduled retraining would be required.

### Q39: Why does the graph assume static link capacities?
**A:** ChangeGuard focuses on logical dependency reachability rather than queuing theory. Simulating dynamic link saturation under bursty network traffic requires live packet-level telemetry (e.g., eBPF), which is identified as future scope.

---

## Category 10: Advanced Engineering & Future Scope

### Q40: What are Graph Neural Networks and why are they listed in your future scope?
**A:** Graph Neural Networks (GNNs) such as GCNs learn vector representations (embeddings) directly from the structural topology of a graph. Instead of manually engineering features like hop count and degree, a GNN could automatically learn subtle graph risk patterns.

### Q41: How would you integrate ChangeGuard into a real CI/CD pipeline?
**A:** By exposing a GitHub Actions or GitLab CI/CD runner step that makes an automated REST call to `POST /api/risk/analyze` during a pull request. If the returned risk score exceeds an organizational policy threshold, the pipeline step exits with non-zero code to block the merge until senior approval is granted.

### Q42: What is the advantage of using React Flow over raw SVG or D3?
**A:** React Flow provides hardware-accelerated canvas pan/zoom, built-in node handle management, virtualization of off-screen nodes, and seamless React state synchronization without messy imperative DOM manipulation.

### Q43: What is the purpose of the Command Palette (⌘K)?
**A:** It provides keyboard-first developer navigation inspired by tools like Linear and Vercel, allowing engineers to instantly search microservices, find change tickets, or jump between analytical views without mouse clicks.

### Q44: What was the hardest engineering challenge in ChangeGuard?
**A:** Designing an in-memory graph mutation mechanism for the What-If simulator that could clone complex object graphs, apply edge insertions/deletions, re-run BFS traversals, and return comparative deltas in under 10 milliseconds without thread contention or database writes.

### Q45: What is the single biggest takeaway from the ChangeGuard project?
**A:** That pre-deployment governance does not have to be an opaque manual bottleneck. By combining graph theory, transparent rules, machine learning, and explainable decision support, engineering teams can achieve high deployment velocity while maintaining core banking safety.
