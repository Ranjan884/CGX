# ChangeGuard — Research & Engineering Gap

## 1. Context of Existing Systems
Enterprise IT organizations operate multiple sophisticated tools across the software development lifecycle:
- **Change Management Systems (e.g., ServiceNow, Jira Service Management):** Capture change requests, approvals, and schedules through manual forms and textual questionnaires.
- **Application Performance Monitoring & Distributed Tracing (e.g., OpenTelemetry, Jaeger, Dynatrace):** Trace live runtime requests and map service topologies post-deployment during active operations.
- **Continuous Integration / Continuous Deployment (CI/CD) Gates:** Execute unit tests, integration tests, and static code analysis (SonarQube) in isolated build environments.
- **Incident Response Platforms (e.g., PagerDuty, Opsgenie):** Manage alerts and post-mortem logs after an incident has already manifested in production.

---

## 2. The Project's Technical Focus
The engineering and research focus of ChangeGuard is **not** to claim that dependency analysis or risk scoring does not exist in industry. Rather, the focus is the **synthesized integration of seven traditionally isolated engineering disciplines into a cohesive, pre-deployment decision-support control center**:

```
[1. Topology Modeling] (Adjacency Matrix / In-Memory Graph)
          +
[2. Blast-Radius Cascade Traversal] (BFS/DFS Reachability)
          +
[3. Rule-Based Safety Floors] (Deterministic Weighted Scoring)
          +
[4. Supervised Machine Learning] (Random Forest Classifier)
          +
[5. In-Memory What-If Simulation] (Topological Mutation Sandbox)
          +
[6. Continuous Outcome Monitoring] (Post-Deployment Feedback Loop)
          +
[7. Explainable Decision Support] (Actionable Testing & Rollout Safeguards)
```

---

## 3. Detailed Comparative Gap Analysis

| Capability | Traditional CAB / ITSM | Runtime APMs | ChangeGuard Approach |
|:---|:---|:---|:---|
| **Timing** | Pre-deployment, but manual and subjective | Post-deployment (runtime observability) | Pre-deployment analytical decision support |
| **Dependency Analysis** | Stale static CMDB spreadsheets | Live trace graphs, but reactive to production traffic | Pre-computed directed graph with simulated edge mutations |
| **Blast Radius** | Guessed by change owner | Discovered during the outage | Algorithmic shortest-path reachability ($O(V + E)$) |
| **Risk Scoring** | Subjective Likert scales (1–5 low/medium/high) | Anomaly alerts during production regressions | Dual-engine: deterministic formula + calibrated ML probability |
| **Nonlinear Failure Detection** | Ignored; rules are static | Observes failure in progress | Random Forest captures multi-feature interaction (Recall: 0.8897) |
| **Scenario Modeling** | Untestable without staging deployment | Impractical on production networks | Zero-mutation in-memory sandbox with comparative deltas |
| **Governance & Auditability** | Textual ticket history | Log telemetry | Structured compliance audit trail with persona RBAC |

---

## 4. Research Questions Addressed by the Prototype
1. **Can pre-computed topological dependency traversals significantly enhance the accuracy of pre-deployment risk estimation compared to single-service evaluation?**
   - *Finding:* Yes. Incorporating downstream cascade depth and critical node exposure was ranked by Gini feature importance as the dominant risk driver (`blast_radius_score`: 21.96%, `critical_services_affected`: 16.57%).
2. **What are the tradeoffs between transparent rule-based scoring and supervised machine learning classifiers in pre-deployment risk prediction?**
   - *Finding:* The rule-based engine provides guaranteed deterministic safety baselines easily auditable by regulators, while the Random Forest classifier captures complex nonlinear interactions that linear rules miss (agreement rate of 55.5%; ML flagged 140 subtle high-risk interactions that rule thresholds alone failed to catch).
3. **Can an in-memory simulation sandbox provide instantaneous (<100ms) comparative feedback for architectural changes without touching live databases?**
   - *Finding:* Yes. In-memory graph cloning and synthetic edge mutation executed simulation queries with sub-10ms response times.
