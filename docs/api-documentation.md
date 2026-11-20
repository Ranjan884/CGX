# ChangeGuard REST API Specification

This document details all verified Spring Boot and FastAPI endpoints currently exposed in the ChangeGuard platform.

---

## 1. System Health & Diagnostics

### `GET /api/health`
Checks Spring Boot backend liveness and probes ML microservice connectivity.
- **Method**: `GET`
- **Response**: `200 OK`
```json
{
  "status": "UP",
  "service": "ChangeGuard Spring Boot Backend",
  "timestamp": "2026-09-28T16:15:00Z",
  "components": {
    "database": { "status": "UP" },
    "mlService": { "status": "UP", "available": true }
  }
}
```

---

## 2. Microservice Registry APIs

### `GET /api/services`
Retrieves all registered banking microservices.
- **Method**: `GET`
- **Response**: `200 OK`
```json
[
  {
    "id": 5,
    "name": "Payment Service",
    "type": "CORE_TRANSACTION",
    "criticality": "CRITICAL",
    "version": "2.1.0",
    "status": "ACTIVE"
  }
]
```

### `GET /api/services/{id}`
Retrieves metadata for a specific microservice.
- **Parameters**: `id` (Long, path variable)
- **Response**: `200 OK` or `404 NOT_FOUND`

---

## 3. Topological Graph & Traversal APIs

### `GET /api/dependencies/graph`
Returns all microservice nodes and directed dependency edges for graphical rendering.
- **Method**: `GET`
- **Response**: `200 OK`
```json
{
  "nodes": [
    { "id": "5", "name": "Payment Service", "type": "CORE_TRANSACTION", "criticality": "CRITICAL" }
  ],
  "edges": [
    { "id": "e5-7", "source": "5", "target": "7", "dependencyType": "REST_API", "criticality": "CRITICAL" }
  ]
}
```

### `GET /api/dependencies/service/{serviceId}/bfs`
Executes Breadth-First Search (BFS) to identify cascading downstream dependency levels.
- **Parameters**: `serviceId` (Long)
- **Response**: `200 OK`
```json
{
  "algorithm": "BFS",
  "startingService": "Payment Service",
  "startingServiceId": 5,
  "visitedServices": ["Payment Service", "Core Banking Service", "Fraud Detection Service", "Transaction Database"],
  "totalVisited": 4
}
```

### `GET /api/dependencies/service/{serviceId}/dfs`
Executes Depth-First Search (DFS) returning all exhaustive acyclic propagation paths.
- **Parameters**: `serviceId` (Long)
- **Response**: `200 OK`

---

## 4. Blast Radius Assessment APIs

### `GET /api/blast-radius/service/{serviceId}`
Calculates topological blast radius, hop depth, and affected Tier-1 critical service count.
- **Parameters**: `serviceId` (Long)
- **Response**: `200 OK`
```json
{
  "startingService": { "id": 5, "name": "Payment Service", "criticality": "CRITICAL" },
  "allAffectedServices": ["Fraud Detection Service", "Core Banking Service", "Transaction Database", "Notification Service", "Reconciliation Service", "Reporting Service"],
  "criticalAffectedServices": ["Core Banking Service", "Transaction Database"],
  "totalAffectedServices": 6,
  "maxDependencyDepth": 3,
  "blastRadiusScore": 80.8,
  "blastRadiusRatio": 0.545
}
```

---

## 5. Pre-Deployment Change Risk Evaluation APIs

### `POST /api/risk/analyze`
Submits a proposed technical change for combined Rule-Based and Machine Learning risk evaluation.
- **Method**: `POST`
- **Request Body**:
```json
{
  "serviceId": 5,
  "changeType": "VERSION_UPDATE",
  "oldVersion": "2.0.0",
  "newVersion": "3.0.0",
  "complexity": "HIGH",
  "description": "Upgrade payment processing engine to v3.0"
}
```
- **Response**: `200 OK`
```json
{
  "changeDescription": "Upgrade payment processing engine to v3.0",
  "serviceName": "Payment Service",
  "blastRadiusScore": 80.8,
  "affectedServicesCount": 6,
  "criticalServicesCount": 2,
  "ruleBasedRiskScore": 0.74,
  "ruleBasedRiskLevel": "CRITICAL",
  "mlPrediction": {
    "failureProbability": 0.8124,
    "prediction": 1,
    "riskLevel": "HIGH",
    "model": "RandomForest",
    "modelVersion": "1.0.0"
  },
  "recommendedRollout": "BLUE_GREEN",
  "explanation": "Calculated score exceeds CRITICAL threshold (0.80). Affects 2 Tier-1 services: [Core Banking Service, Transaction Database]."
}
```

### `GET /api/risk/config`
Retrieves configured factor weights and risk level thresholds.
- **Method**: `GET`
- **Response**: `200 OK`

---

## 6. What-If Change Simulator APIs

### `POST /api/simulation/what-if`
Executes an isolated in-memory simulation evaluating tentative dependency link changes or version updates.
- **Method**: `POST`
- **Request Body**:
```json
{
  "serviceId": 5,
  "changeType": "VERSION_UPDATE",
  "oldVersion": "2.0.0",
  "newVersion": "3.0.0",
  "complexity": "HIGH",
  "dependencyChanges": [
    { "action": "ADD", "sourceServiceId": 5, "targetServiceId": 11 }
  ]
}
```
- **Response**: `200 OK`
```json
{
  "currentState": {
    "blastRadiusScore": 80.8,
    "totalAffectedServices": 6,
    "ruleBasedRiskLevel": "CRITICAL"
  },
  "simulatedState": {
    "blastRadiusScore": 86.2,
    "totalAffectedServices": 7,
    "ruleBasedRiskLevel": "CRITICAL"
  },
  "comparison": {
    "newlyAffectedServices": ["Reporting Service"],
    "affectedCountDelta": 1,
    "blastRadiusScoreDelta": 5.4,
    "riskScoreDelta": 0.07,
    "simulationVerdict": "SIMULATION WARNING: The proposed change increases failure risk. Expands blast radius to 1 new service: [Reporting Service]."
  },
  "simulatedAtTimestamp": 1740000000000
}
```

---

## 7. Machine Learning & Research APIs

### `GET /api/ml/health`
Probes FastAPI ML model status through the Spring Boot proxy.
- **Method**: `GET`
- **Response**: `200 OK` (`{"status":"UP","modelLoaded":true}`)

### `POST /api/ml/predict`
Direct feature vector prediction endpoint routed through Spring Boot.
- **Method**: `POST`
- **Response**: `200 OK`
```json
{
  "failureProbability": 0.742,
  "prediction": 1,
  "riskLevel": "HIGH",
  "model": "RandomForest",
  "modelVersion": "1.0.0"
}
```
