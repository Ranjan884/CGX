export type Criticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ServiceStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export type ChangeType =
  | 'API_CHANGE'
  | 'DATABASE_CHANGE'
  | 'CONFIG_CHANGE'
  | 'LIBRARY_UPDATE'
  | 'INFRASTRUCTURE_CHANGE'
  | 'SECURITY_CHANGE'
  | 'DEPENDENCY_CHANGE'
  | 'VERSION_UPDATE'
  | 'ML_MODEL_CHANGE';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface BankingService {
  id: number;
  name: string;
  type: string;
  criticality: Criticality;
  version: string;
  status: ServiceStatus;
  createdAt?: string;
  description?: string;
}

export interface Dependency {
  id: number;
  sourceServiceId: number;
  targetServiceId: number;
  sourceServiceName?: string;
  targetServiceName?: string;
  dependencyType: string;
  criticality: Criticality;
}

export interface ChangeRecord {
  id: number;
  serviceId: number;
  serviceName: string;
  changeType: ChangeType;
  description: string;
  oldVersion: string;
  newVersion: string;
  complexity: number;
  createdAt: string;
  status?: 'PROPOSED' | 'APPROVED' | 'DEPLOYED' | 'REJECTED';
}

export interface IncidentRecord {
  id: number;
  changeId: number;
  changeDescription: string;
  severity: Severity;
  failure: boolean;
  affectedServices: string;
  rootCause: string;
  createdAt: string;
}

export interface GraphNode {
  id: string | number;
  name: string;
  type: string;
  criticality: Criticality;
  version: string;
  status: ServiceStatus;
}

export interface GraphEdge {
  id: string | number;
  source: string | number;
  target: string | number;
  sourceName?: string;
  targetName?: string;
  type?: string;
  dependencyType?: string;
  criticality?: Criticality;
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  totalNodes?: number;
  totalEdges?: number;
}

export interface ServiceRef {
  id: number;
  name: string;
  type: string;
  criticality: Criticality;
  version: string;
}

export interface BlastRadiusResult {
  targetService?: string;
  startingService?: ServiceRef;
  directlyAffectedServices?: string[];
  indirectlyAffectedServices?: string[];
  allAffectedServices?: string[];
  affectedServices: string[];
  criticalAffectedServices?: string[];
  criticalServicesAffectedCount?: number;
  criticalServicesAffected: number;
  totalAffectedServices?: number;
  affectedCount: number;
  maxDependencyDepth?: number;
  serviceDepths?: Record<string, number>;
  dependencyPaths?: string[] | string[][];
  paths: string[][];
  blastRadiusScore?: number;
  blastRadiusRatio: number;
}

export interface RiskFactorDetail {
  factorName: string;
  rawValue: any;
  normalizedValue: number;
  weight: number;
  contribution: number;
  description: string;
}

export interface RuleBasedRiskSummary {
  riskScore: number;
  riskPercentage: number;
  riskLevel: RiskLevel | string;
}

export interface MLPrediction {
  failureProbability: number;
  prediction: number;
  riskLevel: RiskLevel | string;
  model: string;
  modelVersion: string;
}

export type MLStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'TIMEOUT' | 'ERROR';

export interface RiskAnalysisResult {
  changeId?: number | null;
  serviceId?: number;
  serviceName: string;
  riskScore: number;
  riskPercentage: number;
  riskLevel: RiskLevel | string;
  riskProbability: number;
  blastRadiusScore?: number;
  totalAffectedServices?: number;
  criticalServicesAffected?: number;
  maxDependencyDepth?: number;
  factors?: Record<string, any>;
  explanation: string;
  blastRadius: BlastRadiusResult;
  ruleBasedRisk?: RuleBasedRiskSummary;
  mlPrediction?: MLPrediction | null;
  mlStatus?: MLStatus | string;
  recommendedRollout?: string;
  modelUsed?: string;
  riskFactors?: string[];
}

export interface MLHealthResponse {
  status: 'UP' | 'DOWN' | string;
  service: string;
  modelLoaded: boolean;
  modelType?: string | null;
  version: string;
}

export interface ConfusionMatrix {
  true_negatives: number;
  false_positives: number;
  false_negatives: number;
  true_positives: number;
}

export interface ModelPerformance {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  confusion_matrix: ConfusionMatrix;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface MLMetricsData {
  dataset_metadata: {
    total_samples: number;
    train_samples: number;
    test_samples: number;
    incident_rate_overall: number;
    random_seed: number;
  };
  selected_model: string;
  selection_reason: string;
  models: {
    logistic_regression: ModelPerformance;
    random_forest: ModelPerformance;
  };
  feature_importances_random_forest: FeatureImportance[];
}

export interface MLMetricComparison {
  dataset_size: number;
  train_size: number;
  test_size: number;
  logistic_regression: {
    model: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    roc_auc: number;
    confusion_matrix: { tn: number; fp: number; fn: number; tp: number };
  };
  random_forest: {
    model: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    roc_auc: number;
    confusion_matrix: { tn: number; fp: number; fn: number; tp: number };
  };
}

export interface DependencyChange {
  action: 'ADD' | 'REMOVE';
  sourceServiceId: number;
  targetServiceId: number;
  dependencyType?: string;
  criticality?: Criticality;
}

export interface WhatIfSimulationRequest {
  serviceId: number;
  changeType?: ChangeType | string;
  oldVersion?: string;
  newVersion?: string;
  complexity?: number | string;
  description?: string;
  dependencyChanges?: DependencyChange[];
}

export interface SimulationState {
  serviceId: number;
  serviceName: string;
  version: string;
  changeType: string;
  complexity: any;
  blastRadiusScore: number;
  totalAffectedServices: number;
  criticalServicesAffectedCount: number;
  maxDependencyDepth: number;
  directlyAffectedServices: string[];
  indirectlyAffectedServices: string[];
  allAffectedServices: string[];
  criticalServicesAffected: string[];
  serviceDepths: Record<string, number>;
  dependencyPaths: string[][];
  ruleBasedRiskScore: number;
  ruleBasedRiskPercentage: number;
  ruleBasedRiskLevel: string;
  riskFactors: Record<string, any>;
  mlPrediction?: MLPrediction | null;
  mlStatus?: MLStatus | string;
  explanation: string;
}

export interface WhatIfComparison {
  newlyAffectedServices: string[];
  noLongerAffectedServices: string[];
  newlyCriticalAffectedServices: string[];
  affectedCountDelta: number;
  criticalAffectedDelta: number;
  maxDepthDelta: number;
  blastRadiusScoreDelta: number;
  riskScoreDelta: number;
  riskPercentageDelta: number;
  riskLevelChanged: boolean;
  currentRiskLevel: string;
  simulatedRiskLevel: string;
  mlProbabilityDelta?: number | null;
  simulationVerdict: string;
}

export interface WhatIfSimulationResponse {
  request: WhatIfSimulationRequest;
  currentState: SimulationState;
  simulatedState: SimulationState;
  comparison: WhatIfComparison;
  simulatedAtTimestamp: number;
}

export interface Phase10EvaluationReport {
  experiment_title: string;
  timestamp: string;
  synthetic_data_scope_statement: string;
  reproducibility: {
    random_seed: number;
    test_split_ratio: number;
    train_samples: number;
    test_samples: number;
    total_samples: number;
    feature_count: number;
    features: string[];
  };
  dataset_validation: {
    total_records: number;
    missing_values_count: number;
    duplicate_records_count: number;
    class_balance: {
      successful_changes_0: number;
      failed_changes_1: number;
      failure_rate: number;
      percentage_failed: number;
    };
    feature_ranges: Record<string, { min: number; max: number; mean: number; std: number }>;
    categorical_distributions: {
      change_type: Record<string, number>;
    };
  };
  models_benchmarked: {
    majority_baseline: {
      model_name: string;
      description: string;
      accuracy: number;
      precision: number;
      recall: number;
      f1: number;
      roc_auc: number;
      confusion_matrix: {
        true_negatives: number;
        false_positives: number;
        false_negatives: number;
        true_positives: number;
      };
    };
    logistic_regression: {
      model_name: string;
      training_time_ms: number;
      single_prediction_time_ms: number;
      accuracy: number;
      precision: number;
      recall: number;
      f1: number;
      roc_auc: number;
      brier_score?: number;
      confusion_matrix: {
        true_negatives: number;
        false_positives: number;
        false_negatives: number;
        true_positives: number;
      };
    };
    random_forest: {
      model_name: string;
      training_time_ms: number;
      single_prediction_time_ms: number;
      accuracy: number;
      precision: number;
      recall: number;
      f1: number;
      roc_auc: number;
      brier_score?: number;
      confusion_matrix: {
        true_negatives: number;
        false_positives: number;
        false_negatives: number;
        true_positives: number;
      };
    };
  };
  rule_based_engine_test_set_evaluation: Record<
    string,
    {
      threshold: number;
      accuracy: number;
      precision: number;
      recall: number;
      f1: number;
      roc_auc: number;
      confusion_matrix: {
        true_negatives: number;
        false_positives: number;
        false_negatives: number;
        true_positives: number;
      };
    }
  >;
  rule_vs_ml_disagreement: {
    total_test_samples: number;
    total_actual_incidents: number;
    agreement_count: number;
    agreement_rate: number;
    both_flagged_incident_correctly: number;
    ml_flagged_but_rule_missed: number;
    rule_flagged_but_ml_missed: number;
    both_missed_incident: number;
    explanation: string;
  };
  feature_importance_ranking: Array<{ feature: string; importance: number }>;
  blast_radius_and_whatif_benchmarks: Array<{
    scenario: string;
    service_id: number;
    starting_service: string;
    downstream_affected_count: number;
    blast_radius_score: number;
    critical_services_affected: number;
    max_dependency_depth: number;
    rule_risk_level: string;
    recommended_rollout: string;
    newly_affected_services?: string[];
    delta_blast_radius?: string;
    delta_risk_score?: string;
  }>;
  tradeoff_analysis: {
    latency: {
      logistic_regression_single_ms: number;
      random_forest_single_ms: number;
      latency_comment: string;
    };
    interpretability: {
      rule_based: string;
      logistic_regression: string;
      random_forest: string;
    };
    recommendation: string;
  };
  synthetic_limitations: string[];
}

// ===================================================
// Phase 12: Risk Analysis History & Outcome Monitoring
// ===================================================

export type OutcomeClassification =
  | 'TRUE_POSITIVE'
  | 'TRUE_NEGATIVE'
  | 'FALSE_POSITIVE'
  | 'FALSE_NEGATIVE'
  | 'UNKNOWN';

export interface RiskHistoryRecord {
  id: number;
  changeId?: number | null;
  serviceId: number;
  serviceName: string;
  serviceCriticality: Criticality;
  riskScore: number;
  riskPercentage: number;
  riskLevel: RiskLevel;
  blastRadiusScore: number;
  affectedServicesCount: number;
  criticalServicesAffected: number;
  dependencyDepth: number;
  mlFailureProbability?: number | null;
  mlPrediction?: number | null;
  mlModelVersion?: string | null;
  analysisTimestamp: string;
  actualIncident?: boolean | null;
  actualIncidentSeverity?: Severity | null;
  outcomeClassification: OutcomeClassification;
  outcomeUpdatedAt?: string | null;
}

export interface OutcomeRecordPayload {
  actualIncident: boolean;
  actualIncidentSeverity?: Severity | null;
}

export interface HighRiskServiceStat {
  serviceId: number;
  serviceName: string;
  criticality: Criticality;
  analyzedChanges: number;
  highRiskChanges: number;
  actualIncidents: number;
  averageRiskScore: number;
  incidentRate: number;
}

export interface RiskTrendPoint {
  date: string;
  averageRiskScore: number;
  totalAnalyses: number;
  highRiskChanges: number;
  incidentsCount: number;
  incidentCount?: number;
}

export interface RiskTrendsResponse {
  points: RiskTrendPoint[];
  totalHistoricalRecords: number;
}

export interface HistoricalMLPerformance {
  status: 'OK' | 'NOT_ENOUGH_DATA';
  labeledSamples: number;
  minRequiredSamples: number;
  threshold?: number;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1?: number;
  truePositives?: number;
  trueNegatives?: number;
  falsePositives?: number;
  falseNegatives?: number;
  message?: string;
}

// ===================================================
// Phase 13: Intelligent Change Recommendations & Decision Support
// ===================================================

export type RecommendationType =
  | 'STANDARD_DEPLOYMENT'
  | 'ADDITIONAL_TESTING'
  | 'INTEGRATION_TESTING'
  | 'PERFORMANCE_TESTING'
  | 'CRITICAL_SERVICE_MONITORING'
  | 'CANARY_ROLLOUT'
  | 'STAGED_ROLLOUT'
  | 'ROLLBACK_PREPARATION'
  | 'DEPENDENCY_REVIEW'
  | 'DATABASE_REVIEW'
  | 'SECURITY_REVIEW'
  | 'OBSERVABILITY_CHECK'
  | 'HISTORICAL_REVIEW';

export interface RecommendationAction {
  type: RecommendationType;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  suggestedAction: string;
  supportingFactors: string[];
  affectedServices: string[];
}

export interface HistoricalSimilarityEvidence {
  status: 'AVAILABLE' | 'INSUFFICIENT_DATA';
  similarChangesCount: number;
  incidentChangesCount: number;
  historicalIncidentRate: number;
  summaryMessage: string;
  pastIncidentsRootCauses: string[];
}

export interface RecommendationResponse {
  serviceId: number;
  serviceName: string;
  serviceCriticality: Criticality;
  changeType: string;
  riskScore: number;
  riskPercentage: number;
  riskLevel: RiskLevel;
  blastRadiusScore: number;
  affectedServicesCount: number;
  criticalServicesAffectedCount: number;
  dependencyDepth: number;
  mlFailureProbability?: number | null;
  mlPrediction?: number | null;
  mlStatus: string;
  decisionSupportNotice: string;
  dataSupportLevel: 'HIGH_DATA_SUPPORT' | 'MODERATE_DATA_SUPPORT' | 'LIMITED_DATA_SUPPORT' | 'INSUFFICIENT_DATA';
  recommendations: RecommendationAction[];
  historicalEvidence: HistoricalSimilarityEvidence;
  simulationComparisonNotice?: string | null;
}

// ===================================================
// Phase 14: Security, RBAC & Governance Audit Logging
// ===================================================

export type UserRole = 'ADMIN' | 'ENGINEER' | 'VIEWER';

export interface AuditLogEntry {
  id: number;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId?: number | null;
  status: 'SUCCESS' | 'FAILED' | 'WARNING' | 'DENIED';
  metadata?: string | null;
  timestamp: string;
}

export interface SystemHealthDiagnostics {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  service: string;
  timestamp: string;
  components: {
    database: { status: 'UP' | 'DOWN' };
    mlService: { status: 'UP' | 'DOWN' | 'DEGRADED'; available: boolean };
  };
}



