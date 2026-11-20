# ChangeGuard — Project Objectives

The ChangeGuard platform was conceived and implemented to satisfy the following ten concrete engineering and research objectives:

1. **Model Banking Microservice Dependencies:**
   Construct an in-memory directed dependency graph representing banking microservices, supporting synchronous REST/gRPC calls, message brokers, and shared transactional databases.
2. **Algorithmic Downstream Impact Identification:**
   Implement Breadth-First Search (BFS) and Depth-First Search (DFS) graph traversal algorithms ($O(V + E)$) to trace direct and multi-hop downstream dependencies originating from any changed service.
3. **Calculate Standardized Blast-Radius Metrics:**
   Design and execute a normalized mathematical blast-radius formula factoring in reachable node counts, hop distance, and service criticality tiers (Tier-1 Critical, High, Medium, Low).
4. **Implement Deterministic Rule-Based Risk Scoring:**
   Build a transparent, configurable rule engine evaluating change complexity, service tier, blast radius, and historical failure rate into an auditable risk percentage (0–100%) and discrete tiers (LOW, MEDIUM, HIGH, CRITICAL).
5. **Develop & Integrate Predictive Machine Learning:**
   Train, evaluate, and deploy a supervised Random Forest classifier in a separate Python microservice to predict the probability of change failure based on topological and change features.
6. **Isolated What-If Change Simulation:**
   Provide a high-performance in-memory sandbox enabling engineers to model version shifts, complexity changes, and temporary edge mutations (adding or removing dependencies) with real-time delta scoring.
7. **Continuous Risk History & Post-Deployment Monitoring:**
   Maintain persistent records of pre-deployment risk evaluations and provide mechanisms to log observed post-deployment incident outcomes, establishing an automated feedback loop.
8. **Automated, Explainable Recommendation Generation:**
   Generate targeted advisory recommendations (canary rollouts, additional integration testing, dual-approvals) grounded in empirical historical incident evidence.
9. **Enforce Security Hardening, RBAC & Compliance Auditing:**
   Implement role-based access control personas (ADMIN, ENGINEER, VIEWER), tamper-evident audit logging (`audit_logs`), and sanitized exception handling.
10. **Deliver a Premium Enterprise Engineering Control Center:**
    Design a responsive, dark-first fintech interface inspired by Linear and Stripe, offering global command palette search (`⌘K`), topology visualization, and interactive analytics.
