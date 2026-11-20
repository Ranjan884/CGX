# ChangeGuard — Presentation Speaking Script

This script provides spoken notes for each of the 20 presentation slides, timed at approximately 20 to 40 seconds per slide for a total presentation length of 8 to 10 minutes.

---

### Slide 1: Title & Overview (30s)
> "Good morning, respected professors and committee members. Today I am presenting ChangeGuard, a predictive change risk and blast-radius evaluation platform designed for core banking microservice architectures. Modern banks deploy hundreds of software and configuration updates every week, but understanding the cascading impact across services remains a major challenge. ChangeGuard combines graph algorithms, deterministic rules, and machine learning to give engineers pre-deployment decision support before a change ever hits production."

---

### Slide 2: The Core Problem (30s)
> "In a microservices ecosystem, services are tightly interconnected. If an engineering team updates an API serializer on a Payment Service, that change doesn't stay local. It propagates across the network to Core Banking, to Fraud Detection, and eventually down to the transaction database. If an unexpected contract mismatch or timeout occurs, you don't just lose one service—you trigger a cascading outage across customer-facing banking channels."

---

### Slide 3: Why It Matters (25s)
> "For financial institutions, downtime costs over a million dollars an hour, not to mention regulatory fines under frameworks like DORA and PCI-DSS. Traditionally, banks rely on Change Advisory Boards where engineers manually fill out questionnaires. But human reviewers simply cannot mentally trace five tiers of cascading runtime dependencies, creating a dangerous gap between deployment velocity and risk safety."

---

### Slide 4: Existing Approaches & Gaps (30s)
> "If we look at existing tools, APM solutions like Datadog or Dynatrace only show you problems after code is deployed—which is reactive. CI unit tests verify code syntax in isolation, but they know nothing about the topology. And ticketing tools like Jira just collect text. There is a clear need for an integrated system that analyzes topological blast radius and predicts failure risk before deployment."

---

### Slide 5: The Proposed Solution: ChangeGuard (30s)
> "ChangeGuard fills this gap by acting as a pre-deployment engineering control center. We model the banking topology as a directed graph, run BFS traversals to compute exact blast radius, and evaluate the change through a dual engine: a deterministic rule formula for transparent regulatory safety floors, and a Random Forest machine learning model to catch complex nonlinear failure combinations."

---

### Slide 6: System Architecture & Data Flow (35s)
> "Here is our four-tier architecture. On the client side, we built a dark-first reactive SPA using React 19, TypeScript, and Tailwind CSS. The core backend is Spring Boot 3.3.4 running in Java, which handles the graph algorithms, business logic, and PostgreSQL persistence. For machine learning, we built an asynchronous FastAPI microservice in Python that serves our serialized Random Forest model with sub-10 millisecond latency."

---

### Slide 7: Algorithmic Core: Graph Traversal & Blast Radius (35s)
> "At the algorithmic core, we represent our 11 banking services as an in-memory directed graph. We implemented Breadth-First Search to calculate the shortest hop distance from the changed service to all downstream nodes in O(V + E) time. We also implemented DFS for deep path exploration, and a three-color cycle detection algorithm using white, gray, and black states to prevent circular deadlocks."

---

### Slide 8: Blast-Radius Mathematical Formulation (30s)
> "To quantify exposure, we designed a normalized blast-radius formula. It factors in three things: the total number of reachable downstream services, their architectural criticality tiers—where critical ledger nodes carry four times the weight of low-tier analytics—and the maximum hop depth. The resulting score is normalized from zero to one hundred, giving engineers an immediate quantitative measure of cascading exposure."

---

### Slide 9: Dual-Engine: Deterministic Rule-Based Scoring (30s)
> "Our risk engine uses a hybrid approach. The first layer is a deterministic rule-based calculation that weights dependency impact at 25%, service criticality at 20%, historical failure rate at 20%, change complexity at 20%, and blast radius at 15%. This provides an easily auditable safety floor that banking regulators can inspect without dealing with a black box."

---

### Slide 10: Machine Learning Pipeline (30s)
> "The second layer is machine learning. We trained a supervised Random Forest classifier on 2,000 synthetic banking change records with an 80/20 train-test split using seed 42. We engineer 11 input features, including topological reachability, critical node counts, and version jump size. The goal is to classify whether a proposed change has a high probability of resulting in a production incident."

---

### Slide 11: Empirical Model Comparison & Selection (35s)
> "When comparing Random Forest against our Logistic Regression baseline, Random Forest achieved higher accuracy at 80.75% and, most importantly, a Recall of 88.97%. In banking change management, Recall is our most critical metric because a False Negative means an outage-causing change slips through unflagged. Random Forest successfully caught 234 out of 263 incidents in our test set with an inference latency of just 7.48 milliseconds."

---

### Slide 12: Feature Importance & Key Insights (30s)
> "Analyzing Gini feature importance revealed a major insight: topological factors dominate local parameters. Blast radius score was the number one feature at 21.96% importance, followed by critical services affected at 16.57% and dependency count at 13.12%. In other words, where a change is situated in the microservice network matters much more than whether it is a configuration or library update."

---

### Slide 13: Rule-Based vs. ML Disagreement Study (35s)
> "To prove the value of having both engines, we ran a disagreement study across all 400 test records. We found that the ML model caught 140 incidents that the rule-based engine missed completely. When we inspected those 140 cases, they all had moderate complexity combined with two-hop critical exposure—combinations that linear weights underestimate, but tree ensembles detect. This validates the hybrid architecture."

---

### Slide 14: What-If Change Simulator (35s)
> "One of our most powerful features is the What-If Simulator. It operates as an isolated in-memory sandbox where engineers can test hypothetical changes without touching the database. You can adjust version jumps, change complexity, or even simulate adding or removing dependencies. The system immediately calculates the comparative delta in risk score and blast radius, showing you the exact architectural impact before committing code."

---

### Slide 15: Continuous Risk History & Monitoring (30s)
> "ChangeGuard also maintains a longitudinal risk history. Every evaluation is logged, and after deployment, operations teams can record the actual observed outcome. This calculates realized confusion matrix metrics—True Positives, False Positives, and False Negatives—over time, creating a continuous feedback loop that helps identify chronically high-risk services across release cycles."

---

### Slide 16: Intelligent Decision Support & Recommendations (30s)
> "Rather than just displaying raw numbers, ChangeGuard translates risk scores into explainable engineering recommendations. It suggests actionable safeguards like requiring canary rollouts, additional integration testing, or database lock reviews. Crucially, each recommendation references historical evidence from past incidents, and our system explicitly maintains that final deployment decisions remain with authorized human engineers."

---

### Slide 17: Security Hardening & Compliance Auditing (30s)
> "For enterprise governance, we implemented Role-Based Access Control personas: Admin, Engineer, and Viewer. Viewers have strict read-only access and cannot submit changes. We also maintain a tamper-evident audit log in PostgreSQL using decoupled transactions, and our global exception handler sanitizes all internal stack traces so sensitive database credentials or SQL queries are never leaked."

---

### Slide 18: System Limitations (Integrity Disclosure) (25s)
> "In the spirit of scientific integrity, we explicitly acknowledge our limitations. All data in ChangeGuard is synthetic; we do not use real banking records. The system is strictly decision-support and does not autonomously block deployments. Furthermore, our topology edges currently assume static capacity rather than dynamic runtime saturation."

---

### Slide 19: Future Scope & Roadmap (25s)
> "Looking ahead, we see exciting research directions: implementing Graph Neural Networks to learn topology embeddings directly, using LLMs to inspect raw Git commit diffs for breaking changes, and integrating eBPF for automated runtime dependency discovery directly from Linux kernel network traffic."

---

### Slide 20: Conclusion & Summary (25s)
> "In conclusion, ChangeGuard proves that pre-deployment change risk does not have to be a slow, subjective guesswork process. By bringing together graph theory, deterministic rules, machine learning, and explainable decision support, we can help engineering teams move fast without breaking core banking systems. Thank you very much, and I welcome your questions."
