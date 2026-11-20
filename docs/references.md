# ChangeGuard — Technical References & Foundations

This document records the foundational computer science, software engineering, and machine learning literature relevant to the algorithms and architectures implemented in ChangeGuard.

---

## 1. Verified Core Technical References

### Graph Algorithms & Data Structures
1. **Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C.** (2009). *Introduction to Algorithms* (3rd ed.). MIT Press.
   - *Direct Application:* Breadth-First Search (BFS), Depth-First Search (DFS), and cycle detection algorithms via vertex discovery and finish times ($O(V + E)$).

2. **Tarjan, R.** (1972). *Depth-First Search and Linear Graph Algorithms*. SIAM Journal on Computing, 1(2), 146–160.
   - *Direct Application:* Graph coloring and traversal principles for cycle identification in directed graphs.

### Machine Learning & Classification
3. **Breiman, L.** (2001). *Random Forests*. Machine Learning, 45(1), 5–32.
   - *Direct Application:* Ensemble learning via bagged decision trees, bootstrap aggregation, and Gini impurity feature importance ranking.

4. **Pedregosa, F., et al.** (2011). *Scikit-learn: Machine Learning in Python*. Journal of Machine Learning Research, 12, 2825–2830.
   - *Direct Application:* Scikit-learn classification pipelines, `StandardScaler`, `OneHotEncoder`, and metrics computation.

### Architectural Frameworks & Distributed Systems
5. **Fowler, M., & Lewis, J.** (2014). *Microservices: a definition of this new architectural term*. martinfowler.com.
   - *Direct Application:* Distributed service boundaries, independent deployability, and cascading failure vulnerability.

6. **Spring Boot Framework Documentation** (v3.3.4). VMware, Inc.
   - *Direct Application:* Application scaffolding, Spring Data JPA, and transaction isolation (`REQUIRES_NEW`).

7. **FastAPI Framework Documentation** (v0.100+). Tiangolo.
   - *Direct Application:* Asynchronous REST inference API endpoints and Pydantic schema validation.

---

## 2. Topic References for Expanded Research [REQUIRES VERIFICATION FOR FORMAL PUBLICATION]
The following topic areas represent foundational concepts in change risk and site reliability engineering; specific citations should be verified against institutional library databases prior to academic journal submission:

- **Google Site Reliability Engineering (SRE):** Post-mortem analysis and incident management practices. [REQUIRES VERIFICATION]
- **ITIL v4 Change Enablement Guidelines:** Standard vs. Normal vs. Emergency change definitions. [REQUIRES VERIFICATION]
- **European Union Digital Operational Resilience Act (DORA):** ICT risk management frameworks for financial entities. [REQUIRES VERIFICATION]
