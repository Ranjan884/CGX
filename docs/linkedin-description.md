# ChangeGuard — LinkedIn Project Post & Feature Summary

A polished, professional update formatted for LinkedIn to showcase engineering rigor, system architecture, and machine learning integration to recruiters, hiring managers, and developer peers.

---

### LinkedIn Post Copy

🚀 Excited to unveil **ChangeGuard** — a predictive change risk and blast-radius evaluation platform designed for core banking microservice ecosystems.

In financial institutions and distributed architectures, a minor software or configuration change can trigger cascading outages across downstream ledger databases and customer channels. Traditional Change Advisory Boards (CABs) still rely heavily on subjective manual checklists that lack visibility into true multi-hop runtime reachability.

To tackle this, I engineered ChangeGuard as an end-to-end pre-deployment decision-support control center:

🔧 **Core Engineering Highlights:**
1. **Algorithmic Graph Traversal:** Implemented in-memory directed dependency modeling using Breadth-First Search (BFS) and cycle detection ($O(V+E)$) in Spring Boot, computing shortest-hop distances and normalized blast-radius scores across 11 simulated banking microservices.
2. **Hybrid Risk Engine:** Combined deterministic rule-based safety floors (guaranteeing regulatory transparency) with a supervised **Random Forest classifier** trained on 2,000 synthetic records. The model achieved **88.97% Recall** and **80.75% Accuracy**, identifying 140 subtle nonlinear failure combinations missed by linear rule formulas.
3. **In-Memory "What-If" Simulator:** Built an isolated sandbox that clones graph state in heap memory, allowing engineers to simulate architectural mutations (adding/removing dependency edges or shifting versions) with instantaneous delta feedback ($\Delta\text{Risk}$, $\Delta\text{Blast}$) and zero database writes.
4. **Explainable Decision Support:** Generated targeted engineering safeguards (canary rollouts, lock reviews) grounded directly in historical root-cause incident data.
5. **Fintech UI/UX & Governance:** Designed a dark-first control center inspired by Linear and Stripe (React 19, TypeScript, Tailwind CSS) featuring a global Command Palette (`⌘K`), RBAC personas (Admin/Engineer/Viewer), and a decoupled PostgreSQL audit trail.

💻 **Tech Stack:**
Java 17 · Spring Boot 3.3.4 · Python · FastAPI · Scikit-Learn · PostgreSQL 15 · React 19 · TypeScript · Tailwind CSS · Docker

Special thanks to everyone who provided feedback during this build! Check out the architecture documentation and GitHub repository below. 👇

#SoftwareEngineering #Microservices #DistributedSystems #SpringBoot #MachineLearning #Fintech #SystemDesign #React #DataStructures #GraphAlgorithms
