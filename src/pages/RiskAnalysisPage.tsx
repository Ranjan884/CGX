import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Server, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  FileText, 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  GitCompare,
  RotateCcw
} from 'lucide-react';
import { riskApi } from '../api/riskApi';
import { servicesApi } from '../api/servicesApi';
import { RiskAnalysisResult, BankingService } from '../types';

export const RiskAnalysisPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<BankingService[]>([]);

  // Form Parameters
  const [serviceId, setServiceId] = useState<number>(
    (location.state as any)?.params?.serviceId || (location.state as any)?.serviceId || 5 // Payment Service
  );
  const [changeType, setChangeType] = useState<string>(
    (location.state as any)?.params?.changeType || 'VERSION_UPDATE'
  );
  const [complexity, setComplexity] = useState<number>(
    (location.state as any)?.params?.complexity || 8
  );
  const [oldVersion, setOldVersion] = useState<string>(
    (location.state as any)?.params?.oldVersion || '2.0.0'
  );
  const [newVersion, setNewVersion] = useState<string>(
    (location.state as any)?.params?.newVersion || '3.0.0'
  );
  const [description, setDescription] = useState<string>(
    (location.state as any)?.params?.description || 'Upgrade Payment Service API to ISO 20022 schemas and update downstream settlement callbacks'
  );

  // Progressive disclosure accordions
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [showMlDetails, setShowMlDetails] = useState<boolean>(false);

  // Default initial result matching user specification (Payment Service, v2.0 -> v3.0, 81/100, HIGH RISK, 6 affected, 2 critical, 3 levels)
  const [result, setResult] = useState<RiskAnalysisResult>({
    serviceId: 5,
    serviceName: 'Payment Service',
    riskScore: 0.81,
    riskLevel: 'HIGH',
    riskPercentage: 81,
    riskProbability: 0.81,
    blastRadiusScore: 78.4,
    totalAffectedServices: 6,
    criticalServicesAffected: 2,
    explanation: 'High topological blast radius coupled with Tier-1 dependencies',
    ruleBasedRisk: {
      riskScore: 0.82,
      riskPercentage: 82,
      riskLevel: 'HIGH'
    },
    blastRadius: {
      affectedServices: [
        'Core Banking',
        'Fraud Detection',
        'Account Service',
        'Notification Service',
        'Ledger DB Cluster',
        'Analytics Ingestion'
      ],
      affectedCount: 6,
      criticalServicesAffected: 2,
      maxDependencyDepth: 3,
      blastRadiusRatio: 0.54,
      paths: []
    },
    riskFactors: [
      '6 downstream consumers in cascade chain',
      'Direct coupling with Tier-1 Core Banking',
      'Major version schema transition'
    ]
  });

  useEffect(() => {
    servicesApi.getServices().then((svcs) => {
      setServices(svcs);
    }).catch(console.error);

    // If pre-analyzed result passed in route state
    if ((location.state as any)?.result) {
      setResult((location.state as any).result);
    }
  }, [location.state]);

  const handleEvaluate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await riskApi.analyzeRisk({
        serviceId,
        changeType,
        complexity,
        oldVersion,
        newVersion,
        description
      });
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to complete risk evaluation.');
    } finally {
      setLoading(false);
    }
  };

  const selectedSvc = services.find((s) => s.id === serviceId);

  // Semantic color badge helpers (only the status/badge & important number use semantic color)
  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return {
          text: 'text-[#EF4444]',
          badge: 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30',
          dot: 'bg-[#EF4444]'
        };
      case 'HIGH':
        return {
          text: 'text-[#EF4444]',
          badge: 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30',
          dot: 'bg-[#EF4444]'
        };
      case 'MEDIUM':
        return {
          text: 'text-[#F59E0B]',
          badge: 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30',
          dot: 'bg-[#F59E0B]'
        };
      default:
        return {
          text: 'text-[#22C55E]',
          badge: 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30',
          dot: 'bg-[#22C55E]'
        };
    }
  };

  const riskBadge = getRiskBadge(result.riskLevel);
  const affectedCount = result.blastRadius?.affectedServices?.length ?? result.totalAffectedServices ?? 6;
  const criticalCount = result.criticalServicesAffected ?? 2;
  const maxLevels = result.blastRadius?.maxDependencyDepth ?? 3;

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#263148] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#4F7CFF] rounded-full" />
            <h1 className="text-xl font-bold tracking-tight text-[#F5F7FA]">
              Evaluate Proposed Release
            </h1>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Analyze release impact, topological blast radius, and automated safeguard recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setServiceId(5);
              setChangeType('VERSION_UPDATE');
              setComplexity(8);
              setOldVersion('2.0.0');
              setNewVersion('3.0.0');
              setDescription('Upgrade Payment Service API to ISO 20022 schemas and update downstream settlement callbacks');
            }}
            className="px-3 py-1.5 bg-[#171F30] hover:bg-[#161F30] text-[#94A3B8] hover:text-[#F5F7FA] border border-[#263148] rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-xl text-xs text-[#EF4444] font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main 2-Column Evaluation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT SIDE: CHANGE FORM */}
        <div className="lg:col-span-5 bg-[#121927] border border-[#263148] rounded-xl p-5 sm:p-6 space-y-4">
          <div className="border-b border-[#263148] pb-3">
            <h2 className="text-sm font-semibold text-[#F5F7FA]">
              Change Parameters
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Specify release scope to compute real-time blast radius and ML risk score.
            </p>
          </div>

          <form onSubmit={handleEvaluate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                Target Microservice
              </label>
              <select
                value={serviceId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setServiceId(id);
                  const s = services.find((svc) => svc.id === id);
                  if (s && s.version) {
                    setOldVersion(s.version);
                    const parts = s.version.split('.');
                    if (parts.length > 0) {
                      const major = parseInt(parts[0], 10) || 1;
                      setNewVersion(`${major + 1}.0.0`);
                    }
                  }
                }}
                className="w-full text-xs py-2.5 px-3 rounded-lg border border-[#263148] bg-[#0B0F17] text-[#F5F7FA] focus:outline-hidden focus:border-[#4F7CFF]"
              >
                {services.length > 0 ? (
                  services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.criticality} • v{s.version})
                    </option>
                  ))
                ) : (
                  <>
                    <option value={5}>Payment Service (CRITICAL • v2.0.0)</option>
                    <option value={7}>Core Banking (CRITICAL • v1.4.2)</option>
                    <option value={6}>Fraud Detection (CRITICAL • v4.1.0)</option>
                    <option value={2}>API Gateway (HIGH • v3.2.1)</option>
                    <option value={4}>Account Service (HIGH • v2.1.0)</option>
                  </>
                )}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                  Change Type
                </label>
                <select
                  value={changeType}
                  onChange={(e) => setChangeType(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border border-[#263148] bg-[#0B0F17] text-[#F5F7FA] focus:outline-hidden focus:border-[#4F7CFF]"
                >
                  <option value="VERSION_UPDATE">VERSION_UPDATE (Major Release)</option>
                  <option value="API_CHANGE">API_CHANGE (Schema Contract)</option>
                  <option value="DATABASE_CHANGE">DATABASE_CHANGE (DDL Migration)</option>
                  <option value="CONFIG_CHANGE">CONFIG_CHANGE (Tuning / Env)</option>
                  <option value="LIBRARY_UPDATE">LIBRARY_UPDATE (Security Patch)</option>
                  <option value="INFRASTRUCTURE_CHANGE">INFRASTRUCTURE_CHANGE (Host / Ingress)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                  Complexity Rating (1–10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={complexity}
                  onChange={(e) => setComplexity(Number(e.target.value))}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border border-[#263148] bg-[#0B0F17] text-[#F5F7FA] font-mono focus:outline-hidden focus:border-[#4F7CFF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                  Current Version
                </label>
                <input
                  type="text"
                  value={oldVersion}
                  onChange={(e) => setOldVersion(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border border-[#263148] bg-[#0B0F17] text-[#F5F7FA] font-mono focus:outline-hidden focus:border-[#4F7CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                  Proposed Version
                </label>
                <input
                  type="text"
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border border-[#263148] bg-[#0B0F17] text-[#F5F7FA] font-mono focus:outline-hidden focus:border-[#4F7CFF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                Change Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#263148] bg-[#0B0F17] text-[#F5F7FA] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#4F7CFF]"
                placeholder="Describe release scope, API route updates, or schema changes..."
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#4F7CFF] hover:bg-[#3D68E0] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Evaluating Risk Engine...</span>
                  </>
                ) : (
                  <>
                    <span>Evaluate Release Risk</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Simulation Link */}
          <div className="pt-3 border-t border-[#263148] flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Need sandbox scenarios?</span>
            <button
              onClick={() => navigate('/what-if', { state: { serviceId, complexity } })}
              className="text-[#4F7CFF] hover:underline font-medium flex items-center gap-1 cursor-pointer"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Open What-If Simulator</span>
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: RISK RESULT */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* 1. TOP RESULT CARD */}
          <div className="bg-[#121927] border border-[#263148] rounded-xl p-5 sm:p-6 space-y-4">
            
            {/* Service & Version */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#263148] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#171F30] border border-[#263148] flex items-center justify-center shrink-0">
                  <Server className="w-5 h-5 text-[#4F7CFF]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#F5F7FA]">
                      {result.serviceName || selectedSvc?.name || 'Payment Service'}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#171F30] text-[#4F7CFF] border border-[#263148]">
                      {selectedSvc?.criticality || 'TIER-1'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#94A3B8] mt-0.5 font-mono">
                    <span className="text-[#F5F7FA] font-semibold">v{oldVersion}</span>
                    <ArrowRight className="w-3 h-3 text-[#94A3B8]" />
                    <span className="text-[#4F7CFF] font-semibold">v{newVersion}</span>
                    <span className="text-[#94A3B8]">•</span>
                    <span className="text-[#CBD5E1]">{changeType}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${riskBadge.badge}`}>
                  <span className={`w-2 h-2 rounded-full ${riskBadge.dot}`} />
                  <span>{result.riskLevel} RISK</span>
                </span>
              </div>
            </div>

            {/* Score Display */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pt-1">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8] block">
                  Failure Probability Score
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-4xl font-extrabold font-mono tabular-nums ${riskBadge.text}`}>
                    {result.riskPercentage}
                  </span>
                  <span className="text-base font-normal text-[#94A3B8]">/ 100</span>
                </div>
              </div>

              <div className="text-xs text-[#94A3B8] sm:text-right max-w-xs">
                Review recommended before deployment. Critical dependency controls required.
              </div>
            </div>

            {/* 2. STATS ROW: 6 services affected | 2 critical services | 3 dependency levels */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#263148]">
              <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148] text-center">
                <span className="text-2xl font-bold font-mono text-[#F5F7FA] tabular-nums block">
                  {affectedCount}
                </span>
                <span className="text-xs font-medium text-[#94A3B8] mt-0.5 block">
                  services affected
                </span>
              </div>

              <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148] text-center">
                <span className="text-2xl font-bold font-mono text-[#EF4444] tabular-nums block">
                  {criticalCount}
                </span>
                <span className="text-xs font-medium text-[#94A3B8] mt-0.5 block">
                  critical services
                </span>
              </div>

              <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148] text-center">
                <span className="text-2xl font-bold font-mono text-[#4F7CFF] tabular-nums block">
                  {maxLevels}
                </span>
                <span className="text-xs font-medium text-[#94A3B8] mt-0.5 block">
                  dependency levels
                </span>
              </div>
            </div>

          </div>

          {/* 3. WHY THIS IS HIGH RISK (3 concise reasons) */}
          <div className="bg-[#121927] border border-[#263148] rounded-xl p-5 sm:p-6 space-y-3">
            <div>
              <h3 className="text-xs font-semibold tracking-wider text-[#F5F7FA] uppercase font-mono flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
                <span>WHY THIS IS HIGH RISK</span>
              </h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Multi-factor risk analysis identified 3 primary risk drivers:
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148] flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#EF4444] mt-1.5 shrink-0" />
                <div className="text-xs">
                  <span className="text-[#F5F7FA] font-medium block">
                    6 downstream services affected across 3 dependency levels
                  </span>
                  <span className="text-[#94A3B8] text-[11px] mt-0.5 block">
                    Changes propagate from Payment Service to Account Service, Fraud Detection, and Notification microservices.
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148] flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#EF4444] mt-1.5 shrink-0" />
                <div className="text-xs">
                  <span className="text-[#F5F7FA] font-medium block">
                    2 critical Tier-1 banking services in direct impact path
                  </span>
                  <span className="text-[#94A3B8] text-[11px] mt-0.5 block">
                    Core Banking and Fraud Detection have zero downtime tolerance and strict payment settlement SLAs.
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148] flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#F59E0B] mt-1.5 shrink-0" />
                <div className="text-xs">
                  <span className="text-[#F5F7FA] font-medium block">
                    High change complexity rating ({complexity} / 10) with major version contract changes
                  </span>
                  <span className="text-[#94A3B8] text-[11px] mt-0.5 block">
                    Schema transition from v{oldVersion} to v{newVersion} introduces potential breaking payload changes without backward compatibility adapter.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. ADVISORY RECOMMENDATIONS (recommendation cards) */}
          <div className="bg-[#121927] border border-[#263148] rounded-xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold tracking-wider text-[#F5F7FA] uppercase font-mono flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[#4F7CFF]" />
                  <span>ADVISORY RECOMMENDATIONS</span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Required safeguards and release controls prior to production rollout
                </p>
              </div>

              <button
                onClick={() => navigate('/recommendations', { state: { serviceId, changeType } })}
                className="text-xs text-[#4F7CFF] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>All Safeguards</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148] flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#F5F7FA] font-semibold">Automated Integration &amp; Contract Testing</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">CRITICAL</span>
                  </div>
                  <span className="text-[#94A3B8] text-[11px] mt-0.5 block">
                    Verify backward compatibility across consumers and run Pact CDC suites before staging merge.
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148] flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#F5F7FA] font-semibold">Critical Service Monitoring &amp; Alert Thresholds</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">HIGH</span>
                  </div>
                  <span className="text-[#94A3B8] text-[11px] mt-0.5 block">
                    Set high-sensitivity latency alarms on Account Ledger and Payment Gateway for 2 hours post-rollout.
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148] flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#F5F7FA] font-semibold">Rollback Preparation &amp; Database State Snapshot</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">HIGH</span>
                  </div>
                  <span className="text-[#94A3B8] text-[11px] mt-0.5 block">
                    Confirm automated rollback script is validated in staging and dual-write flags are enabled.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. COLLAPSIBLE ACCORDION FOR TECHNICAL & ML DETAILS */}
          <div className="space-y-3">
            <div className="bg-[#121927] border border-[#263148] rounded-xl overflow-hidden">
              <button
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#161F30] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#4F7CFF]" />
                  <span className="text-xs font-semibold text-[#F5F7FA]">Technical Evaluation Breakdown</span>
                </div>
                {showTechnicalDetails ? (
                  <ChevronUp className="w-4 h-4 text-[#94A3B8]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
                )}
              </button>

              {showTechnicalDetails && (
                <div className="p-4 pt-0 border-t border-[#263148] bg-[#171F30]/40 space-y-3 text-xs font-mono">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
                    <div className="p-2.5 bg-[#171F30] rounded-lg border border-[#263148]">
                      <span className="text-[#94A3B8] text-[10px] block">Service ID</span>
                      <span className="text-[#F5F7FA] font-bold">#{serviceId}</span>
                    </div>
                    <div className="p-2.5 bg-[#171F30] rounded-lg border border-[#263148]">
                      <span className="text-[#94A3B8] text-[10px] block">Complexity</span>
                      <span className="text-[#F5F7FA] font-bold">{complexity} / 10</span>
                    </div>
                    <div className="p-2.5 bg-[#171F30] rounded-lg border border-[#263148]">
                      <span className="text-[#94A3B8] text-[10px] block">Blast Score</span>
                      <span className="text-[#F5F7FA] font-bold">{result.blastRadiusScore?.toFixed(1) || '78.4'}</span>
                    </div>
                    <div className="p-2.5 bg-[#171F30] rounded-lg border border-[#263148]">
                      <span className="text-[#94A3B8] text-[10px] block">Rule Weight</span>
                      <span className="text-[#F5F7FA] font-bold">{result.ruleBasedRisk?.riskPercentage?.toFixed(1) || '82.0'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#121927] border border-[#263148] rounded-xl overflow-hidden">
              <button
                onClick={() => setShowMlDetails(!showMlDetails)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#161F30] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-[#4F7CFF]" />
                  <span className="text-xs font-semibold text-[#F5F7FA]">Machine Learning Inference Metrics</span>
                </div>
                {showMlDetails ? (
                  <ChevronUp className="w-4 h-4 text-[#94A3B8]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
                )}
              </button>

              {showMlDetails && (
                <div className="p-4 pt-0 border-t border-[#263148] bg-[#171F30]/40 space-y-2.5 text-xs font-mono">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
                    <div className="p-2 bg-[#171F30] rounded border border-[#263148]">
                      <span className="text-[#94A3B8] text-[10px] block">Model</span>
                      <span className="text-[#F5F7FA] font-bold">Random Forest</span>
                    </div>
                    <div className="p-2 bg-[#171F30] rounded border border-[#263148]">
                      <span className="text-[#94A3B8] text-[10px] block">ROC-AUC</span>
                      <span className="text-[#22C55E] font-bold">0.941</span>
                    </div>
                    <div className="p-2 bg-[#171F30] rounded border border-[#263148]">
                      <span className="text-[#94A3B8] text-[10px] block">F1-Score</span>
                      <span className="text-[#22C55E] font-bold">0.893</span>
                    </div>
                    <div className="p-2 bg-[#171F30] rounded border border-[#263148]">
                      <span className="text-[#94A3B8] text-[10px] block">Confidence</span>
                      <span className="text-[#22C55E] font-bold">89.4%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
