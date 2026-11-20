# ChangeGuard — Live Demonstration Script (5–10 Minutes)

A structured step-by-step walkthrough for demonstrating the ChangeGuard platform live to examiners, interviewers, or engineering leaders.

---

## 1. Demo Preparation & Verification (Pre-Flight)
Before starting the presentation:
1. Ensure the application is loaded in the browser.
2. Confirm the top header indicators show:
   - `Backend: Operational` (Green)
   - `ML: Available` (Green)
3. Ensure persona is set to `ADMIN` or `ENGINEER`.

---

## 2. Step-by-Step Demonstration Flow

### Phase 1: Risk Overview & High-Level Executive Dashboard (1.5 Minutes)
- **Action:** Open root URL `/` (Risk Overview).
- **Showcase:**
  - **Compact KPI Strip:** Point out 11 monitored services, 5 Tier-1 Critical services, High-risk change counts, historical incidents, and the active Random Forest ML model.
  - **Risk Trend Visualization:** Hover over the rolling 30-day risk trend chart; explain how risk peaks correlate with major release windows.
  - **System Risk Summary Hero:** Show the overall composite risk score (72 / 100) and the downstream exposure breakdown.
  - **Service Risk Exposure Bar Chart:** Click on `Payment Service` to trigger the **Service Detail Slide-Over Drawer**.
- **What to say:**
  > "Here is our main executive control center. The dashboard gives engineering managers an immediate 5-second pulse of the ecosystem: overall system risk, critical exposure, and active changes requiring review."

---

### Phase 2: Directed Microservice Dependency Topology (1.5 Minutes)
- **Action:** Navigate to **Topology** (`/dependency-graph`) using the sidebar or pressing `G` then `G`.
- **Showcase:**
  - **Topology Canvas:** Pan and zoom the 11-node graph; point out color-coded service tiers (Red = Critical, Orange = High, Green = Low).
  - **Node Selection:** Click on `Payment Service (Node #5)`.
  - **Downstream Traversal Highlight:** Point out that edges leading downstream to Core Banking, Fraud Detection, and Transaction DB are dynamically highlighted.
  - **Run BFS Traversal:** Click the **BFS Impact Traversal** button. Show the visited order sequence in the side panel.
  - **Dedicated Blast Radius:** Click "Dedicated Blast Radius" to navigate to `/blast-radius` and inspect the hierarchical cascade tiers.
- **What to say:**
  > "Instead of looking at isolated code repositories, ChangeGuard models the real communication topology. When I click Payment Service, the system runs an O(V + E) BFS traversal, instantly tracing every downstream service that could suffer cascading timeouts."

---

### Phase 3: Multi-Stage Risk Analysis Pipeline (2 Minutes)
- **Action:** Navigate to **Analyze Change** (`/risk-analysis`).
- **Showcase:**
  - **Step 1 (Change Proposal Form):** Select `Payment Service`, Change Type: `API_CHANGE`, Complexity: `8 / 10`, Version jump: `2.0.0` to `3.0.0`.
  - **Step 2 (Staged Pipeline Execution):** Click **Execute Risk Analysis Pipeline**.
    - Watch the visual progress checklist:
      1. Parsing microservice topological dependencies... ✓
      2. Calculating BFS blast radius & cascading depth... ✓
      3. Evaluating Phase 5 rule-based weights & formulas... ✓
      4. FastAPI Random Forest failure probability scoring... ✓
  - **Step 3 (Risk Decision Reveal):**
    - Point out the large composite score: `74 / 100 (HIGH)`.
    - Show the ML Failure Probability: `76%`.
    - Point out the factor breakdown explaining *why* the change is risky (Dependency Impact, Criticality, Complexity, ML Pattern Correlation).
- **What to say:**
  > "Now let's simulate proposing a real change. Notice the staged processing pipeline—it executes our graph traversals, deterministic rules, and Python ML model asynchronously. In the result view, engineers don't just get an opaque number; they see an explainable breakdown of the exact factors driving the risk."

---

### Phase 4: In-Memory What-If Simulation Sandbox (2 Minutes)
- **Action:** Click **Simulate in What-If** (or navigate to `/what-if`).
- **Showcase:**
  - Select quick scenario preset: **"Payment Service v3.0 Upgrade + Reconciliation Dependency"**.
  - Review the active topological mutation: `+ ADD: Payment Service → Reconciliation Service`.
  - Click **Run What-If Simulation**.
  - **Executive Verdict:** Point out the comparative Delta badges ($\Delta\text{Risk: +7%}$, $\Delta\text{Blast: +5.4}$).
  - Point out that this mutation occurred purely in-memory—no SQL writes were made to production tables.
- **What to say:**
  > "What if an engineer wants to test an architectural refactoring before creating a ticket? In our What-If sandbox, we can simulate adding a new dependency link. The engine clones the graph in heap memory and gives us instantaneous delta feedback, showing that adding this link increases the blast radius by 5.4 points."

---

### Phase 5: Intelligent Safeguards & Governance Audit Logs (1.5 Minutes)
- **Action:** Navigate to **Recommendations** (`/recommendations`), then to **Governance & Audit** (`/audit-logs`).
- **Showcase:**
  - **Decision Support:** Show the prioritized advisory actions (e.g., Mandatory Canary Rollout, Database Lock Reviews) backed by historical incident root causes.
  - **Audit Logs:** Switch role persona in the header from `ENGINEER` to `VIEWER`. Point out that "+ Propose Change" is instantly disabled with read-only badges.
  - Show the audit log table recording timestamped actions, user personas, and success/denial statuses.
- **What to say:**
  > "ChangeGuard closes the loop by turning analytical data into actionable safeguards grounded in past incidents. Finally, our compliance audit trail guarantees tamper-evident governance with role-based access control, ensuring full audit readiness for financial regulators."

---

## 3. Wrap-Up & Closing Statement (30 Seconds)
- "That concludes our demonstration of ChangeGuard: a unified pre-deployment control center that replaces subjective change management with automated graph traversals, machine learning, and explainable decision support. Thank you, and I look forward to your questions."
