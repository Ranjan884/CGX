-- ===================================================
-- ChangeGuard: Seed Data for Banking Environment
-- NOTE: All data is synthetic for simulation purposes.
-- ===================================================

-- 1. SEED SERVICES (11 Core Banking Ecosystem Services)
INSERT INTO services (id, name, type, criticality, version, status) VALUES
(1, 'Customer App', 'FRONTEND', 'HIGH', '3.4.1', 'ACTIVE'),
(2, 'API Gateway', 'GATEWAY', 'CRITICAL', '2.8.0', 'ACTIVE'),
(3, 'Authentication Service', 'SECURITY', 'CRITICAL', '1.9.4', 'ACTIVE'),
(4, 'Account Service', 'CORE', 'HIGH', '2.1.0', 'ACTIVE'),
(5, 'Payment Service', 'PAYMENT', 'CRITICAL', '2.0.0', 'ACTIVE'),
(6, 'Fraud Detection Service', 'SECURITY_ML', 'HIGH', '1.5.2', 'ACTIVE'),
(7, 'Core Banking Service', 'CORE', 'CRITICAL', '4.2.0', 'ACTIVE'),
(8, 'Transaction Database', 'DATABASE', 'CRITICAL', '15.4', 'ACTIVE'),
(9, 'Notification Service', 'MESSAGING', 'MEDIUM', '2.3.1', 'ACTIVE'),
(10, 'Reconciliation Service', 'BATCH', 'HIGH', '1.8.0', 'ACTIVE'),
(11, 'Reporting Service', 'ANALYTICS', 'LOW', '3.0.2', 'ACTIVE');

-- Reset identity sequence
SELECT setval('services_id_seq', (SELECT MAX(id) FROM services));

-- 2. SEED DEPENDENCIES (Realistic Banking Microservice Topology)
INSERT INTO dependencies (id, source_service_id, target_service_id, dependency_type, criticality) VALUES
(1, 1, 2, 'REST_API', 'CRITICAL'),     -- Customer App -> API Gateway
(2, 2, 3, 'gRPC', 'CRITICAL'),         -- API Gateway -> Authentication Service
(3, 2, 4, 'REST_API', 'HIGH'),         -- API Gateway -> Account Service
(4, 2, 5, 'REST_API', 'CRITICAL'),     -- API Gateway -> Payment Service
(5, 4, 7, 'gRPC', 'CRITICAL'),         -- Account Service -> Core Banking Service
(6, 5, 6, 'REST_API', 'HIGH'),         -- Payment Service -> Fraud Detection Service
(7, 5, 7, 'gRPC', 'CRITICAL'),         -- Payment Service -> Core Banking Service
(8, 6, 7, 'gRPC', 'CRITICAL'),         -- Fraud Detection Service -> Core Banking Service
(9, 7, 8, 'JDBC_POOL', 'CRITICAL'),    -- Core Banking Service -> Transaction Database
(10, 5, 9, 'KAFKA_TOPIC', 'MEDIUM'),   -- Payment Service -> Notification Service
(11, 7, 10, 'EVENT_STREAM', 'HIGH'),   -- Core Banking Service -> Reconciliation Service
(12, 10, 11, 'BATCH_FILE', 'LOW'),     -- Reconciliation Service -> Reporting Service
(13, 11, 8, 'JDBC_READONLY', 'LOW');   -- Reporting Service -> Transaction Database

SELECT setval('dependencies_id_seq', (SELECT MAX(id) FROM dependencies));

-- 3. SEED CHANGES (10 Realistic Historical & Proposed Changes)
INSERT INTO changes (id, service_id, change_type, description, old_version, new_version, complexity, created_at) VALUES
(1, 5, 'API_CHANGE', 'Upgrade Payment API from v2 to v3 for ISO20022 compliance', '2.0.0', '3.0.0', 8, NOW() - INTERVAL '45 days'),
(2, 7, 'DATABASE_CHANGE', 'Add partition table to ledger entries for fiscal year close', '4.2.0', '4.3.0', 9, NOW() - INTERVAL '38 days'),
(3, 9, 'CONFIG_CHANGE', 'Increase SMS broker retry timeout from 3s to 8s', '2.3.1', '2.3.2', 2, NOW() - INTERVAL '30 days'),
(4, 3, 'LIBRARY_UPDATE', 'Upgrade Spring Security to resolve CVE-2024 token vulnerability', '1.9.4', '1.9.5', 5, NOW() - INTERVAL '24 days'),
(5, 6, 'ML_MODEL_CHANGE', 'Deploy XGBoost v3 fraud classifier with new card-not-present features', '1.5.2', '1.6.0', 7, NOW() - INTERVAL '20 days'),
(6, 2, 'INFRASTRUCTURE_CHANGE', 'Migrate API Gateway ingress to Kubernetes Gateway API v1', '2.8.0', '2.9.0', 8, NOW() - INTERVAL '15 days'),
(7, 4, 'API_CHANGE', 'Introduce real-time balance streaming endpoint over WebSockets', '2.1.0', '2.2.0', 6, NOW() - INTERVAL '10 days'),
(8, 10, 'DATABASE_CHANGE', 'Optimize reconciliation settlement index for end-of-day batch', '1.8.0', '1.8.1', 4, NOW() - INTERVAL '7 days'),
(9, 11, 'LIBRARY_UPDATE', 'Upgrade Apache POI report exporter library', '3.0.2', '3.0.3', 2, NOW() - INTERVAL '4 days'),
(10, 8, 'INFRASTRUCTURE_CHANGE', 'PostgreSQL minor upgrade from 15.4 to 15.6 with WAL replica tuning', '15.4', '15.6', 8, NOW() - INTERVAL '1 day');

SELECT setval('changes_id_seq', (SELECT MAX(id) FROM changes));

-- 4. SEED SIMULATED INCIDENTS (Historical Change Outcomes)
INSERT INTO incidents (id, change_id, severity, failure, affected_services, root_cause, created_at) VALUES
(1, 1, 'HIGH', true, 'Fraud Detection Service, Core Banking Service, Notification Service', 'API contract breaking change in transaction amount serialization', NOW() - INTERVAL '44 days'),
(2, 2, 'CRITICAL', true, 'Core Banking Service, Transaction Database, Reconciliation Service, Reporting Service', 'Table lock contention during online index creation stalled transaction pool', NOW() - INTERVAL '37 days'),
(3, 3, 'LOW', false, 'None (Graceful retry observed)', 'No incident. Notification delivery succeeded with reduced timeout alerts', NOW() - INTERVAL '29 days'),
(4, 4, 'MEDIUM', true, 'Authentication Service, API Gateway', 'Token cache TTL mismatch caused sporadic 401 Unauthorized spikes on customer login', NOW() - INTERVAL '23 days'),
(5, 5, 'HIGH', true, 'Fraud Detection Service, Payment Service', 'ML inference latency spike (>1200ms) caused payment gateway timeout cascading', NOW() - INTERVAL '19 days'),
(6, 6, 'HIGH', true, 'API Gateway, Customer App, Payment Service', 'Ingress route rewrite rule misconfiguration dropped authorization bearer headers', NOW() - INTERVAL '14 days'),
(7, 7, 'LOW', false, 'None (Isolated feature rollout)', 'Successful canary deployment with zero customer impact', NOW() - INTERVAL '9 days'),
(8, 8, 'LOW', false, 'None', 'Batch job duration decreased by 34%, all reconciliation checks passed', NOW() - INTERVAL '6 days'),
(9, 9, 'LOW', false, 'None', 'Export library patched without breaking reporting schema', NOW() - INTERVAL '3 days'),
(10, 10, 'CRITICAL', true, 'Core Banking Service, Transaction Database, Payment Service, Account Service', 'Connection pooler reset during WAL replay induced read-only mode failover', NOW() - INTERVAL '1 day');

SELECT setval('incidents_id_seq', (SELECT MAX(id) FROM incidents));

-- 5. SEED AUDIT LOGS (Phase 14 Security & Governance Trail)
INSERT INTO audit_logs (id, user_role, action, entity_type, entity_id, status, metadata, timestamp) VALUES
(1, 'ADMIN', 'SYSTEM_INIT', 'SYSTEM', 0, 'SUCCESS', 'ChangeGuard platform initialized with 11 banking services and topology graph', NOW() - INTERVAL '45 days'),
(2, 'ENGINEER', 'RISK_ANALYSIS', 'SERVICE', 5, 'SUCCESS', 'Evaluated VERSION_UPDATE change on service ID 5 -> Risk HIGH (78%)', NOW() - INTERVAL '45 days'),
(3, 'ENGINEER', 'RECOMMENDATION_ANALYSIS', 'SERVICE', 5, 'SUCCESS', 'Generated 5 advisory recommendations for Payment Service v3 rollout', NOW() - INTERVAL '45 days'),
(4, 'ADMIN', 'OUTCOME_RECORDED', 'RISK_HISTORY', 1, 'SUCCESS', 'Recorded actual incident outcome: incident=true, severity=HIGH', NOW() - INTERVAL '44 days'),
(5, 'ENGINEER', 'WHATIF_SIMULATION', 'SERVICE', 5, 'SUCCESS', 'Simulated topological change: added dependency Payment Service -> Reconciliation Service', NOW() - INTERVAL '30 days'),
(6, 'VIEWER', 'VIEW_RISK_REPORT', 'CHANGE', 2, 'SUCCESS', 'Read-only access: viewed risk breakdown for Core Banking database partition change', NOW() - INTERVAL '15 days'),
(7, 'ENGINEER', 'RISK_ANALYSIS', 'SERVICE', 7, 'SUCCESS', 'Evaluated DATABASE_CHANGE on Core Banking Service -> Risk CRITICAL (84%)', NOW() - INTERVAL '7 days');

SELECT setval('audit_logs_id_seq', (SELECT MAX(id) FROM audit_logs));
