# ChangeGuard — Algorithms & Mathematical Formulations

This document provides formal algorithmic descriptions, mathematical formulations, and computational complexity analyses for all core algorithms implemented in ChangeGuard.

---

## 1. Breadth-First Search (BFS) Reachability & Shortest Hop Depth

### Purpose
Calculates downstream reachability and the shortest hop distance from the changed root service to all affected downstream microservices.

### Implementation
- **Queue-based traversal:** Maintained via FIFO queue `ArrayDeque<Long>`.
- **Visited Set:** `HashSet<Long>` prevents infinite loops and redundant vertex exploration.
- **Distance Map:** `HashMap<Long, Integer>` tracks the minimum edge count from origin to each visited node.

### Pseudocode
```text
Algorithm: ComputeDownstreamBFS(graph G=(V,E), rootId s)
Input: Directed graph G, starting service ID s
Output: Visited vertex sequence, distance mapping D

1.  Initialize Queue Q ← EmptyQueue()
2.  Initialize Visited ← { s }
3.  Initialize DistanceMap D ← { s : 0 }
4.  Initialize OrderedList L ← [ s ]
5.  Q.enqueue(s)
6.  While Q is not empty do:
7.      u ← Q.dequeue()
8.      currentDepth ← D[u]
9.      For each directed edge (u, v) in G.outgoingEdges(u) do:
10.         If v ∉ Visited then:
11.             Visited.add(v)
12.             D[v] ← currentDepth + 1
13.             L.append(v)
14.             Q.enqueue(v)
15. Return (L, D)
```

### Computational Complexity
- **Time Complexity:** $O(|V| + |E|)$ where $|V|$ is the number of services and $|E|$ is the number of dependency connections. Every vertex and edge is processed at most once.
- **Space Complexity:** $O(|V|)$ for the queue, visited set, and distance map.

---

## 2. Depth-First Search (DFS) Recursive Deep Path Exploration

### Purpose
Explores maximum dependency chains and identifies deep cascading paths.

### Pseudocode
```text
Algorithm: DFSExplore(graph G=(V,E), currentId u, Visited, PathList)
1.  Visited.add(u)
2.  PathList.append(u)
3.  For each directed edge (u, v) in G.outgoingEdges(u) do:
4.      If v ∉ Visited then:
5.          DFSExplore(G, v, Visited, PathList)
```

### Computational Complexity
- **Time Complexity:** $O(|V| + |E|)$
- **Space Complexity:** $O(|V|)$ auxiliary call stack depth in the worst case (linear chain).

---

## 3. Directed Graph Cycle Detection (Three-Color Marking)

### Purpose
Detects circular dependencies in microservice topologies (e.g., Service A $\rightarrow$ Service B $\rightarrow$ Service C $\rightarrow$ Service A) which can cause cascading deadlock or unresolvable startup order.

### State Colors
- **WHITE (0):** Unvisited vertex.
- **GRAY (1):** Currently being processed in active recursion stack (if a neighbor is GRAY, a back-edge / cycle exists).
- **BLACK (2):** Fully processed vertex and all descendants.

### Computational Complexity
- **Time Complexity:** $O(|V| + |E|)$
- **Space Complexity:** $O(|V|)$ color array and recursion stack.

---

## 4. Blast-Radius Calculation Formula

### Purpose
Quantifies the cascading exposure of a microservice into a normalized score between 0.0 and 100.0.

### Mathematical Formulation
$$\text{BlastRadiusScore}(s) = \min\left(100.0, \; \left( \frac{\sum_{v \in \text{Downstream}(s)} W_{\text{criticality}}(v)}{|V| \times W_{\text{max}}} \times 60 \right) + \left( \frac{D_{\text{max}}}{D_{\text{norm}}} \times 20 \right) + \left( \frac{|\text{Direct}(s)|}{|\text{Downstream}(s)| + 1} \times 20 \right) \right)$$

Where:
- $W_{\text{criticality}}(v)$ is the criticality weight of dependent node $v$:
  - $\text{CRITICAL} = 1.0$
  - $\text{HIGH} = 0.75$
  - $\text{MEDIUM} = 0.50$
  - $\text{LOW} = 0.25$
- $|V|$ is the total number of ecosystem services (11 in benchmark banking topology).
- $D_{\text{max}}$ is the maximum downstream hop depth.
- $D_{\text{norm}}$ is the normalizer for graph depth (set to 5.0).

*Disclaimer:* These weights and scaling coefficients are configurable project assumptions and do not represent formal regulatory banking constants.

---

## 5. Multi-Factor Rule-Based Risk Scoring Formula

### Mathematical Formulation
$$\text{RiskScore} = (w_1 \cdot \text{DepImpact}) + (w_2 \cdot \text{Criticality}) + (w_3 \cdot \text{FailRate}) + (w_4 \cdot \text{Complexity}) + (w_5 \cdot \text{BlastScore})$$

### Configured Benchmark Weights
- $w_1 = 0.25$ (Downstream Dependency Impact)
- $w_2 = 0.20$ (Originating Service Criticality: Low=0.25, Med=0.50, High=0.75, Critical=1.0)
- $w_3 = 0.20$ (Historical Service Failure Rate: $\frac{\text{Historical Failures}}{\text{Historical Changes}}$)
- $w_4 = 0.20$ (Change Complexity: $\frac{\text{Complexity Rating (1--10)}}{10.0}$)
- $w_5 = 0.15$ (Normalized Blast Radius Score: $\frac{\text{BlastRadiusScore}}{100.0}$)

$$\sum_{i=1}^5 w_i = 0.25 + 0.20 + 0.20 + 0.20 + 0.15 = 1.00$$

### Risk Level Categorization
$$\text{Risk Level} = \begin{cases} 
\text{CRITICAL} & \text{if } \text{RiskScore} \ge 0.75 \\
\text{HIGH} & \text{if } 0.60 \le \text{RiskScore} < 0.75 \\
\text{MEDIUM} & \text{if } 0.40 \le \text{RiskScore} < 0.60 \\
\text{LOW} & \text{if } \text{RiskScore} < 0.40 
\end{cases}$$

---

## 6. Machine Learning Inference Pipeline

### Model Pipeline Architecture
1. **Column Transformer:**
   - Numerical Features (10): Imputed with median and scaled via `StandardScaler`.
   - Categorical Feature (1: `change_type`): Encoded via `OneHotEncoder(handle_unknown='ignore')`.
2. **Classifier:** Scikit-learn `RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)`.
3. **Inference Latency:** Average single-record inference time is $7.48\text{ ms}$, comfortably meeting synchronous CI/CD gateway SLAs ($<100\text{ ms}$).
