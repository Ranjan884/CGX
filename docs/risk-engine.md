# ChangeGuard Rule-Based Risk Engine Specification

This specification documents the deterministic calculation model, factor weightings, and decision boundaries of the ChangeGuard Phase 5 Rule-Based Risk Engine.

---

## 1. Engine Objective

The Rule-Based Risk Engine provides an **auditable, deterministic safety baseline**. Unlike purely statistical models, its scoring rules are transparent, explainable to financial regulators and IT auditors, and enforce strict minimum deployment constraints when Tier-1 critical systems are exposed.

---

## 2. Risk Factors & Normalized Weightings

The composite risk score $R \in [0.0, 1.0]$ is computed as:

$$R = \sum_{i=1}^{8} (w_i \times f_i)$$

Where $\sum w_i = 1.00$.

| Factor ($f_i$) | Weight ($w_i$) | Input Domain | Normalization Formula | Description |
|---|---|---|---|---|
| **Complexity** | `0.15` | `1` to `10` (or `0.1 - 1.0`) | $\min(1.0, \frac{\text{complexity}}{10.0})$ | Code and architectural scope of the change |
| **Dependency Reach** | `0.10` | $\ge 0$ count | $\min(1.0, \frac{\text{downstreamCount}}{10.0})$ | Reachable microservices in downstream path |
| **Hop Depth** | `0.10` | $\ge 0$ tiers | $\min(1.0, \frac{\text{maxDepth}}{5.0})$ | Maximum distance in the dependency graph |
| **Criticality Tier** | `0.15` | Enum | `CRITICAL`=1.0, `HIGH`=0.75, `MEDIUM`=0.5, `LOW`=0.25 | Architectural priority of target microservice |
| **Target Failure Rate** | `0.15` | $0.0 - 1.0$ | Direct ratio (default: 0.20) | Historical empirical incident rate on target service |
| **Change Category** | `0.10` | Enum | DB=0.80, INFRA=0.75, DEP=0.70, SEC/ML=0.65, API=0.60, VER/LIB=0.50, CFG=0.40 | Inherent risk profile of the change type |
| **Tier-1 Critical Services** | `0.10` | Count of `CRITICAL` | 0 svcs = 0.0, 1 svc = 0.50, $\ge 2$ svcs = 1.00 | Number of Tier-1 systems reachable in blast radius |
| **Blast Radius Score** | `0.15` | $0.0 - 100.0$ | $\min(1.0, \frac{\text{blastRadiusScore}}{100.0})$ | Topology traversal score from Phase 4 |

---

## 3. Risk Level Thresholds & Deployment Actions

| Risk Score Range ($R$) | Risk Level | Recommended Deployment Strategy | Governance Gate |
|---|---|---|---|
| **$0.00 \le R < 0.30$** | `LOW` | **NORMAL_ROLLOUT** | Automated CI/CD pipeline deployment with standard post-deploy smoke tests |
| **$0.30 \le R < 0.60$** | `MEDIUM` | **CANARY_ROLLOUT** | Deploy to 5% canary traffic; evaluate synthetic transaction latency for 30 minutes |
| **$0.60 \le R < 0.80$** | `HIGH` | **PHASED_CANARY_ROLLOUT** | 10% canary traffic step-up with automated synthetic rollback gates |
| **$0.80 \le R \le 1.00$** | `CRITICAL` | **BLUE_GREEN** | Full Blue-Green parallel deployment; **Mandatory Change Advisory Board (CAB) Sign-Off** required before traffic shift |

---

## 4. Hard Safety Override

If a proposed change exposes **$\ge 2$ Tier-1 Critical Services** (e.g., Core Banking and Transaction Database) or exhibits a **Blast Radius Score $\ge 85.0$**, the engine automatically escalates the deployment recommendation to `BLUE_GREEN` with mandatory CAB sign-off regardless of individual factor scores.
