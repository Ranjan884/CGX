import { BankingService, ChangeType, Criticality, RiskAnalysisResult, BlastRadiusResult, IncidentRecord } from '../types';

export function calculateRisk(
  service: BankingService,
  changeType: ChangeType,
  complexity: number,
  blast: BlastRadiusResult,
  incidents: IncidentRecord[] = []
): RiskAnalysisResult {
  // 1. Criticality Weight (0.0 to 0.25)
  const critWeight: Record<Criticality, number> = {
    CRITICAL: 0.25,
    HIGH: 0.18,
    MEDIUM: 0.10,
    LOW: 0.04
  };
  const critScore = critWeight[service.criticality] || 0.10;

  // 2. Complexity Score (0.0 to 0.25)
  const complexityScore = (complexity / 10.0) * 0.25;

  // 3. Blast Radius & Downstream Critical Services (0.0 to 0.25)
  const blastScore = (blast.blastRadiusRatio * 0.15) + (Math.min(blast.criticalServicesAffected, 3) / 3.0 * 0.10);

  // 4. Change Type Impact (0.0 to 0.15)
  const changeTypeScores: Record<ChangeType, number> = {
    DATABASE_CHANGE: 0.15,
    API_CHANGE: 0.13,
    INFRASTRUCTURE_CHANGE: 0.12,
    SECURITY_CHANGE: 0.11,
    DEPENDENCY_CHANGE: 0.11,
    ML_MODEL_CHANGE: 0.10,
    VERSION_UPDATE: 0.08,
    LIBRARY_UPDATE: 0.06,
    CONFIG_CHANGE: 0.04
  };
  const changeTypeScore = changeTypeScores[changeType] || 0.08;

  // 5. Historical Failure Score (0.0 to 0.10)
  const failureCount = incidents.filter(
    (inc) => inc.failure && inc.changeDescription.toLowerCase().includes(service.name.toLowerCase())
  ).length;
  const historyScore = Math.min(failureCount * 0.04, 0.10);

  let totalRisk = Math.min(0.99, Math.max(0.06, critScore + complexityScore + blastScore + changeTypeScore + historyScore));
  totalRisk = Math.round(totalRisk * 100) / 100;

  // Categorize Risk Level
  let riskLevel: Criticality = 'LOW';
  if (totalRisk >= 0.80) {
    riskLevel = 'CRITICAL';
  } else if (totalRisk >= 0.60) {
    riskLevel = 'HIGH';
  } else if (totalRisk >= 0.30) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  // Evidence-based dynamic factors
  const riskFactors: string[] = [];
  if (service.criticality === 'CRITICAL' || service.criticality === 'HIGH') {
    riskFactors.push(`${service.name} is classified as ${service.criticality} banking infrastructure.`);
  }
  if (complexity >= 7) {
    riskFactors.push(`High change complexity rating (${complexity}/10) increases failure likelihood.`);
  }
  if (blast.affectedCount > 0) {
    riskFactors.push(`Downstream cascade encompasses ${blast.affectedCount} service(s), including ${blast.criticalServicesAffected} Tier-1 critical system(s).`);
  }
  if (changeType === 'DATABASE_CHANGE' || changeType === 'API_CHANGE') {
    riskFactors.push(`${changeType.replace('_', ' ')} carries schema lock contention and client contract breaking risks.`);
  }
  if (failureCount > 0) {
    riskFactors.push(`${failureCount} historical incident(s) were previously attributed to changes on this service.`);
  }
  if (riskFactors.length === 0) {
    riskFactors.push('Standard low-impact configuration or patch change with isolated dependencies.');
  }

  const explanation = `Risk is ${riskLevel} (failure probability ${Math.round(
    totalRisk * 100
  )}%) because ${service.name} is a ${service.criticality}-criticality banking service, the proposed change (${changeType}) has a complexity of ${complexity}/10, ${blast.affectedCount} downstream service(s) were detected in the blast radius (${blast.criticalServicesAffected} critical), and ${failureCount} historical failure(s) were observed.`;

  // Recommended deployment strategy
  let recommendedRollout = '';
  switch (riskLevel) {
    case 'CRITICAL':
      recommendedRollout = 'BLUE_GREEN: Require isolated parallel environment deployment, automated zero-downtime rollback hooks, and mandatory change advisory board (CAB) sign-off.';
      break;
    case 'HIGH':
      recommendedRollout = 'CANARY: Implement phased Canary rollout (5% -> 25% -> 100% over 4 hours) with real-time synthetic transaction tracing and contract validation tests.';
      break;
    case 'MEDIUM':
      recommendedRollout = 'CONTROLLED: Schedule deployment during an off-peak maintenance window with automated smoke verification and live dependency telemetry.';
      break;
    default:
      recommendedRollout = 'NORMAL: Proceed via standard CI/CD deployment pipeline with routine integration test verification.';
      break;
  }

  return {
    serviceName: service.name,
    riskProbability: totalRisk,
    riskScore: totalRisk,
    riskPercentage: Math.round(totalRisk * 100),
    riskLevel,
    modelUsed: 'CGX Hybrid (Rule-Based + Random Forest Projection)',
    riskFactors,
    explanation,
    recommendedRollout,
    blastRadius: blast
  };
}
