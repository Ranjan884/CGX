# ChangeGuard Presentation Notes

These notes are structured for a technical project presentation, academic defense, or engineering review.

---

## Slide 1: Title & Introduction
- **Title**: ChangeGuard: Predictive IT Change Risk & Blast-Radius Platform for Banking Systems
- **Speaker Introduction**: Presenting a platform engineered to prevent catastrophic software deployment outages in interconnected microservice architectures.

---

## Slide 2: The Problem in Core Banking IT
- **The Core Dilemma**: High-frequency feature releases vs. zero-downtime banking compliance.
- **The Reality**: Core banking systems (payments, account ledgers, fraud detection) have deep, multi-tiered dependency graphs.
- **The Failure Mode**: A minor change to a seemingly innocuous downstream library or service cascades through hidden dependencies, triggering payment gateway outages or database deadlocks.
- **The Cost**: Production incidents cost banks millions per hour, violate SLA regulations, and damage consumer trust.

---

## Slide 3: The ChangeGuard Solution
- Instead of relying on manual change approval boards (CAB) reading static documents, ChangeGuard:
  1. **Discovers Dependency Topologies**: Maps live microservice relationships.
  2. **Traverses Propagation Paths**: Uses BFS and DFS to calculate exact cascading blast radius.
  3. **Evaluates Risk Deterministically**: Weighted rules identify Tier-1 critical service exposure.
  4. **Predicts Failure Probabilistically**: A trained machine-learning model catches subtle multivariate risk patterns.
  5. **Simulates What-If Scenarios**: Sandboxes topological changes in memory before real commits occur.

---

## Slide 4: System Architecture
- **Multi-Tier Separation**:
  - *Frontend*: React SPA with React Flow for visual graph layout.
  - *Backend Gateway*: Java 17 + Spring Boot 3 handling graph traversal and security barriers.
  - *Persistence*: PostgreSQL 15 storing services, dependencies, and past incident records.
  - *ML Microservice*: Python FastAPI serving a trained Random Forest model.
- **Security Rule**: The frontend never connects to PostgreSQL or FastAPI directly; all calls flow through Spring Boot.

---

## Slide 5: Graph Engine & Blast Radius (Phase 3 & 4)
- **Algorithms**:
  - *Breadth-First Search (BFS)*: Computes hop distances and level-order cascading spread.
  - *Depth-First Search (DFS)*: Traces all acyclic propagation routes.
  - *Cycle Protection*: Visited set tracking prevents infinite recursion loops.
- **Blast Radius Scoring Formula**:
  - Spread ($40\%$) + Critical Tier-1 Exposure ($35\%$) + Depth ($15\%$) + Path Count ($10\%$).

---

## Slide 6: Rule Engine vs Machine Learning (Phase 5, 6, 7 & 10)
- **Deterministic Rules**: Provide auditable, transparent safety floors (e.g. mandatory CAB review if Core Banking is touched).
- **Machine Learning (Random Forest)**: Catches nonlinear risk interactions that linear rules miss (e.g. moderate blast radius combined with high complexity on established services).
- **Empirical Results (Phase 10 Benchmark)**:
  - Random Forest achieved **88.97% Recall** on held-out test data ($N=400$), successfully intercepting 234 out of 263 incidents.
  - Low latency: Single prediction in **7.48 ms**, comfortably satisfying CI/CD SLAs (<100 ms).

---

## Slide 7: What-If Change Simulator (Phase 9)
- **Interactive Sandbox**:
  - Allows engineers to test: "What if Payment Service adds a dependency to Reporting Service?" or "What if we upgrade from v2.0 to v3.0?"
- **Database Mutation Isolation**:
  - State cloned into memory. Traversal and risk recalculate live.
  - PostgreSQL database record count remains completely untouched: `Simulation Database Mutation: PASS`.

---

## Slide 8: Live Demonstration Workflow
1. Open Dashboard (`/`): Show the 11 banking services and overall network health.
2. View Dependency Graph (`/dependency-graph`): Visualize payment processing dependencies.
3. Submit a Change (`/submit-change`): Propose Payment Service upgrade to v3.0.
4. Review Risk Analysis (`/risk-analysis`): Observe CRITICAL risk level, blast radius score of 80.8, and Blue-Green rollout recommendation.
5. What-If Simulation (`/what-if`): Test decoupling an edge and observe immediate blast radius reduction.
6. Research Evaluation (`/evaluation`): Show confusion matrix, ROC curves, and test benchmarks.

---

## Slide 9: Limitations & Academic Scope
- The evaluation dataset consists of 2,000 synthetic banking changes generated under fixed random seed (`seed=42`).
- The project demonstrates methodology and software architecture validity; it does not claim to represent empirical production data from a commercial financial institution.

---

## Slide 10: Conclusion & Q&A
- ChangeGuard proves that combining topological graph traversal, deterministic safety rules, and machine learning creates a powerful pre-deployment safety net for financial software delivery.
- Ready for questions.
