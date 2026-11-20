import { BankingService, Dependency, ChangeRecord, IncidentRecord, MLMetricComparison } from '../types';

export const INITIAL_SERVICES: BankingService[] = [
  { id: 1, name: 'Customer App', type: 'FRONTEND', criticality: 'HIGH', version: '3.4.1', status: 'ACTIVE', description: 'Customer web and mobile online banking frontend client.' },
  { id: 2, name: 'API Gateway', type: 'GATEWAY', criticality: 'CRITICAL', version: '2.8.0', status: 'ACTIVE', description: 'Central reverse proxy, SSL termination, and rate-limiting ingress.' },
  { id: 3, name: 'Authentication Service', type: 'SECURITY', criticality: 'CRITICAL', version: '1.9.4', status: 'ACTIVE', description: 'OAuth2/OIDC, JWT verification, and MFA credential provider.' },
  { id: 4, name: 'Account Service', type: 'CORE', criticality: 'HIGH', version: '2.1.0', status: 'ACTIVE', description: 'Customer account lifecycle, balances, and limit restrictions.' },
  { id: 5, name: 'Payment Service', type: 'PAYMENT', criticality: 'CRITICAL', version: '2.0.0', status: 'ACTIVE', description: 'High-throughput payment orchestration, wire transfers, and cards.' },
  { id: 6, name: 'Fraud Detection Service', type: 'SECURITY_ML', criticality: 'HIGH', version: '1.5.2', status: 'ACTIVE', description: 'Real-time rule and ML scoring engine for anomalous transactions.' },
  { id: 7, name: 'Core Banking Service', type: 'CORE', criticality: 'CRITICAL', version: '4.2.0', status: 'ACTIVE', description: 'Double-entry general ledger, interest posting, and clearing.' },
  { id: 8, name: 'Transaction Database', type: 'DATABASE', criticality: 'CRITICAL', version: '15.4', status: 'ACTIVE', description: 'PostgreSQL ACID relational persistent ledger storage cluster.' },
  { id: 9, name: 'Notification Service', type: 'MESSAGING', criticality: 'MEDIUM', version: '2.3.1', status: 'ACTIVE', description: 'Customer transactional alerts via SMS, Push, and Email.' },
  { id: 10, name: 'Reconciliation Service', type: 'BATCH', criticality: 'HIGH', version: '1.8.0', status: 'ACTIVE', description: 'End-of-day interbank settlement batch matching engine.' },
  { id: 11, name: 'Reporting Service', type: 'ANALYTICS', criticality: 'LOW', version: '3.0.2', status: 'ACTIVE', description: 'Regulatory, audit, and management reporting pipeline.' }
];

export const INITIAL_DEPENDENCIES: Dependency[] = [
  { id: 1, sourceServiceId: 1, targetServiceId: 2, sourceServiceName: 'Customer App', targetServiceName: 'API Gateway', dependencyType: 'REST_API', criticality: 'CRITICAL' },
  { id: 2, sourceServiceId: 2, targetServiceId: 3, sourceServiceName: 'API Gateway', targetServiceName: 'Authentication Service', dependencyType: 'gRPC', criticality: 'CRITICAL' },
  { id: 3, sourceServiceId: 2, targetServiceId: 4, sourceServiceName: 'API Gateway', targetServiceName: 'Account Service', dependencyType: 'REST_API', criticality: 'HIGH' },
  { id: 4, sourceServiceId: 2, targetServiceId: 5, sourceServiceName: 'API Gateway', targetServiceName: 'Payment Service', dependencyType: 'REST_API', criticality: 'CRITICAL' },
  { id: 5, sourceServiceId: 4, targetServiceId: 7, sourceServiceName: 'Account Service', targetServiceName: 'Core Banking Service', dependencyType: 'gRPC', criticality: 'CRITICAL' },
  { id: 6, sourceServiceId: 5, targetServiceId: 6, sourceServiceName: 'Payment Service', targetServiceName: 'Fraud Detection Service', dependencyType: 'REST_API', criticality: 'HIGH' },
  { id: 7, sourceServiceId: 5, targetServiceId: 7, sourceServiceName: 'Payment Service', targetServiceName: 'Core Banking Service', dependencyType: 'gRPC', criticality: 'CRITICAL' },
  { id: 8, sourceServiceId: 6, targetServiceId: 7, sourceServiceName: 'Fraud Detection Service', targetServiceName: 'Core Banking Service', dependencyType: 'gRPC', criticality: 'CRITICAL' },
  { id: 9, sourceServiceId: 7, targetServiceId: 8, sourceServiceName: 'Core Banking Service', targetServiceName: 'Transaction Database', dependencyType: 'JDBC_POOL', criticality: 'CRITICAL' },
  { id: 10, sourceServiceId: 5, targetServiceId: 9, sourceServiceName: 'Payment Service', targetServiceName: 'Notification Service', dependencyType: 'KAFKA_TOPIC', criticality: 'MEDIUM' },
  { id: 11, sourceServiceId: 7, targetServiceId: 10, sourceServiceName: 'Core Banking Service', targetServiceName: 'Reconciliation Service', dependencyType: 'EVENT_STREAM', criticality: 'HIGH' },
  { id: 12, sourceServiceId: 10, targetServiceId: 11, sourceServiceName: 'Reconciliation Service', targetServiceName: 'Reporting Service', dependencyType: 'BATCH_FILE', criticality: 'LOW' },
  { id: 13, sourceServiceId: 11, targetServiceId: 8, sourceServiceName: 'Reporting Service', targetServiceName: 'Transaction Database', dependencyType: 'JDBC_READONLY', criticality: 'LOW' }
];

export const INITIAL_CHANGES: ChangeRecord[] = [
  { id: 1, serviceId: 5, serviceName: 'Payment Service', changeType: 'API_CHANGE', description: 'Upgrade Payment API from v2 to v3 for ISO20022 compliance', oldVersion: '2.0.0', newVersion: '3.0.0', complexity: 8, createdAt: '2026-08-10 14:20:00', status: 'DEPLOYED' },
  { id: 2, serviceId: 7, serviceName: 'Core Banking Service', changeType: 'DATABASE_CHANGE', description: 'Add partition table to ledger entries for fiscal year close', oldVersion: '4.2.0', newVersion: '4.3.0', complexity: 9, createdAt: '2026-08-17 10:15:00', status: 'DEPLOYED' },
  { id: 3, serviceId: 9, serviceName: 'Notification Service', changeType: 'CONFIG_CHANGE', description: 'Increase SMS broker retry timeout from 3s to 8s', oldVersion: '2.3.1', newVersion: '2.3.2', complexity: 2, createdAt: '2026-08-25 18:30:00', status: 'DEPLOYED' },
  { id: 4, serviceId: 3, serviceName: 'Authentication Service', changeType: 'LIBRARY_UPDATE', description: 'Upgrade Spring Security to resolve CVE-2024 token vulnerability', oldVersion: '1.9.4', newVersion: '1.9.5', complexity: 5, createdAt: '2026-09-01 09:40:00', status: 'DEPLOYED' },
  { id: 5, serviceId: 6, serviceName: 'Fraud Detection Service', changeType: 'ML_MODEL_CHANGE', description: 'Deploy XGBoost v3 fraud classifier with new card-not-present features', oldVersion: '1.5.2', newVersion: '1.6.0', complexity: 7, createdAt: '2026-09-05 16:10:00', status: 'DEPLOYED' },
  { id: 6, serviceId: 2, serviceName: 'API Gateway', changeType: 'INFRASTRUCTURE_CHANGE', description: 'Migrate API Gateway ingress to Kubernetes Gateway API v1', oldVersion: '2.8.0', newVersion: '2.9.0', complexity: 8, createdAt: '2026-09-10 11:00:00', status: 'DEPLOYED' },
  { id: 7, serviceId: 4, serviceName: 'Account Service', changeType: 'API_CHANGE', description: 'Introduce real-time balance streaming endpoint over WebSockets', oldVersion: '2.1.0', newVersion: '2.2.0', complexity: 6, createdAt: '2026-09-15 13:45:00', status: 'DEPLOYED' },
  { id: 8, serviceId: 10, serviceName: 'Reconciliation Service', changeType: 'DATABASE_CHANGE', description: 'Optimize reconciliation settlement index for end-of-day batch', oldVersion: '1.8.0', newVersion: '1.8.1', complexity: 4, createdAt: '2026-09-18 17:20:00', status: 'DEPLOYED' },
  { id: 9, serviceId: 11, serviceName: 'Reporting Service', changeType: 'LIBRARY_UPDATE', description: 'Upgrade Apache POI report exporter library', oldVersion: '3.0.2', newVersion: '3.0.3', complexity: 2, createdAt: '2026-09-21 08:50:00', status: 'DEPLOYED' },
  { id: 10, serviceId: 8, serviceName: 'Transaction Database', changeType: 'INFRASTRUCTURE_CHANGE', description: 'PostgreSQL minor upgrade from 15.4 to 15.6 with WAL replica tuning', oldVersion: '15.4', newVersion: '15.6', complexity: 8, createdAt: '2026-09-24 22:15:00', status: 'DEPLOYED' }
];

export const INITIAL_INCIDENTS: IncidentRecord[] = [
  { id: 1, changeId: 1, changeDescription: 'Upgrade Payment API from v2 to v3 for ISO20022 compliance', severity: 'HIGH', failure: true, affectedServices: 'Fraud Detection Service, Core Banking Service, Notification Service', rootCause: 'API contract breaking change in transaction amount serialization', createdAt: '2026-08-11 02:14:00' },
  { id: 2, changeId: 2, changeDescription: 'Add partition table to ledger entries for fiscal year close', severity: 'CRITICAL', failure: true, affectedServices: 'Core Banking Service, Transaction Database, Reconciliation Service, Reporting Service', rootCause: 'Table lock contention during online index creation stalled transaction pool', createdAt: '2026-08-17 16:30:00' },
  { id: 3, changeId: 3, changeDescription: 'Increase SMS broker retry timeout from 3s to 8s', severity: 'LOW', failure: false, affectedServices: 'None (Graceful retry observed)', rootCause: 'No incident. Notification delivery succeeded with reduced timeout alerts', createdAt: '2026-08-25 21:00:00' },
  { id: 4, changeId: 4, changeDescription: 'Upgrade Spring Security to resolve CVE-2024 token vulnerability', severity: 'MEDIUM', failure: true, affectedServices: 'Authentication Service, API Gateway', rootCause: 'Token cache TTL mismatch caused sporadic 401 Unauthorized spikes on customer login', createdAt: '2026-09-01 14:15:00' },
  { id: 5, changeId: 5, changeDescription: 'Deploy XGBoost v3 fraud classifier with new card-not-present features', severity: 'HIGH', failure: true, affectedServices: 'Fraud Detection Service, Payment Service', rootCause: 'ML inference latency spike (>1200ms) caused payment gateway timeout cascading', createdAt: '2026-09-06 03:22:00' },
  { id: 6, changeId: 6, changeDescription: 'Migrate API Gateway ingress to Kubernetes Gateway API v1', severity: 'HIGH', failure: true, affectedServices: 'API Gateway, Customer App, Payment Service', rootCause: 'Ingress route rewrite rule misconfiguration dropped authorization bearer headers', createdAt: '2026-09-10 15:40:00' },
  { id: 7, changeId: 7, changeDescription: 'Introduce real-time balance streaming endpoint over WebSockets', severity: 'LOW', failure: false, affectedServices: 'None (Isolated feature rollout)', rootCause: 'Successful canary deployment with zero customer impact', createdAt: '2026-09-15 19:10:00' },
  { id: 8, changeId: 8, changeDescription: 'Optimize reconciliation settlement index for end-of-day batch', severity: 'LOW', failure: false, affectedServices: 'None', rootCause: 'Batch job duration decreased by 34%, all reconciliation checks passed', createdAt: '2026-09-18 23:55:00' },
  { id: 9, changeId: 9, changeDescription: 'Upgrade Apache POI report exporter library', severity: 'LOW', failure: false, affectedServices: 'None', rootCause: 'Export library patched without breaking reporting schema', createdAt: '2026-09-21 11:30:00' },
  { id: 10, changeId: 10, changeDescription: 'PostgreSQL minor upgrade from 15.4 to 15.6 with WAL replica tuning', severity: 'CRITICAL', failure: true, affectedServices: 'Core Banking Service, Transaction Database, Payment Service, Account Service', rootCause: 'Connection pooler reset during WAL replay induced read-only mode failover', createdAt: '2026-09-25 04:00:00' }
];

export const ML_METRICS: MLMetricComparison = {
  dataset_size: 1200,
  train_size: 960,
  test_size: 240,
  logistic_regression: {
    model: 'LogisticRegression',
    accuracy: 0.8625,
    precision: 0.6374,
    recall: 1.0000,
    f1: 0.7785,
    roc_auc: 0.8920,
    confusion_matrix: { tn: 149, fp: 33, fn: 0, tp: 58 }
  },
  random_forest: {
    model: 'RandomForest',
    accuracy: 0.9075,
    precision: 0.6894,
    recall: 1.0000,
    f1: 0.8161,
    roc_auc: 0.9340,
    confusion_matrix: { tn: 155, fp: 27, fn: 0, tp: 58 }
  }
};
