# ChangeGuard — Screenshot Capture Plan

A planned list of 15 high-fidelity screenshots for the final documentation package, project report, slide deck, and GitHub portfolio.

---

| # | View / Feature | Page Route | Visible Elements | Documentation / Presentation Purpose |
|:---:|:---|:---|:---|:---|
| **1** | **Risk Overview Dashboard** | `/` | Compact KPI strip (11 services, 5 critical), rolling risk trend chart, system risk summary hero, service exposure bar chart. | Hero image for README, Slide 1 & Slide 5 of presentation, Technical Report Section 8. |
| **2** | **Service Detail Slide-Over Drawer** | `/` | Open drawer on right showing Payment Service metadata, running version, direct dependencies, and historical changes. | Demonstrates Linear/Stripe-level UX polish and in-context inspection without page reloads. |
| **3** | **Microservice Dependency Topology** | `/dependency-graph` | Dark canvas, 11 color-coded service nodes, directional protocol edges, selected Payment Service node with animated cascades. | Core algorithmic demonstration for Slide 7 & 9, DSA defense. |
| **4** | **BFS Traversal Path Visualizer** | `/dependency-graph` | Traversal mode active, visited order list in side panel showing shortest-hop reachability from Payment Service. | Demonstrates $O(V + E)$ BFS traversal implementation. |
| **5** | **Blast-Radius Cascade Hierarchy** | `/blast-radius` | Blast-radius score card (80.8/100), hierarchical tree breakdown (Root $\rightarrow$ Tier 1 $\rightarrow$ Tier 2+), exact hop-depth cascade table. | Technical report Section 12, Slide 8. |
| **6** | **Change Proposal Workflow (Step 1)** | `/risk-analysis` | 3-step stepper at top, target service dropdown, complexity slider, version jump inputs, description narrative. | Shows clean enterprise form controls and structured input parameters. |
| **7** | **Staged Pipeline Processing (Step 2)** | `/risk-analysis` | Progress bar and checklist animating through graph parsing, blast calculation, rule scoring, and ML inference. | Demonstrates multi-tier asynchronous pipeline integration. |
| **8** | **Risk Assessment Decision Reveal (Step 3)** | `/risk-analysis` | Large risk percentage (74/100), level badge, ML failure probability (76%), factor breakdown with explainable attribution. | Decision support showcase for Slide 9 & 10. |
| **9** | **What-If Simulator Sandbox** | `/what-if` | Scenario presets, topological alteration controls (+ADD edge to Reconciliation Service), in-memory isolation notice. | Demonstrates architectural sandbox modeling for Slide 14. |
| **10** | **What-If Delta Comparison Verdict** | `/what-if` | Executive verdict callout, delta badges ($\Delta\text{Risk: +7%}$, $\Delta\text{Blast: +5.4}$), side-by-side current vs. proposed state. | Core research contribution showing pre-deployment delta calculation. |
| **11** | **Intelligent Recommendations** | `/recommendations` | Prioritized safeguard action cards (Canary rollout, Integration test), historical root-cause incident evidence quotes. | Demonstrates explainable decision support for Slide 16. |
| **12** | **Continuous Risk History & Outcomes** | `/risk-history` | Timeline and table of past change analyses, recorded actual deployment outcomes (Outage: Yes/No), realized confusion classification. | Proves closed feedback loop and monitoring capabilities. |
| **13** | **ML Performance & Evaluation** | `/evaluation` | Benchmark metrics (Accuracy 80.75%, Recall 88.97%, F1 0.8587), Confusion matrix heatmap, Gini feature importance ranking. | Research paper Table 3 & Slide 11/12. |
| **14** | **Governance & Compliance Audit Trail** | `/audit-logs` | Filterable table of audit logs, user personas (`ADMIN`, `ENGINEER`, `VIEWER`), status badges (`SUCCESS`, `DENIED`), decoupled transaction metadata. | Demonstrates Phase 14 enterprise compliance and RBAC for Slide 17. |
| **15** | **Global Command Palette (⌘K)** | Any route | Centered modal backdrop, fuzzy search input, categorized navigation commands, microservice quick-links, keyboard shortcuts. | Highlights developer-first keyboard navigation and modern SaaS design. |
