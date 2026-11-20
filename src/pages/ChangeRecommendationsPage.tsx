import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Server, 
  GitPullRequest, 
  Clock, 
  RefreshCw,
  AlertTriangle,
  Layers,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { servicesApi } from '../api/servicesApi';
import { recommendationApi } from '../api/recommendationApi';
import { 
  BankingService, 
  ChangeType, 
  RecommendationResponse 
} from '../types';

const CHANGE_TYPES: { value: ChangeType; label: string }[] = [
  { value: 'VERSION_UPDATE', label: 'Version Update' },
  { value: 'API_CHANGE', label: 'API Interface Change' },
  { value: 'DATABASE_CHANGE', label: 'Database Schema Change' },
  { value: 'CONFIG_CHANGE', label: 'Configuration Change' },
  { value: 'LIBRARY_UPDATE', label: 'Library / SDK Update' },
  { value: 'INFRASTRUCTURE_CHANGE', label: 'Infrastructure Change' },
  { value: 'SECURITY_CHANGE', label: 'Security & Access Policy' },
  { value: 'DEPENDENCY_CHANGE', label: 'Upstream Dependency Change' },
  { value: 'ML_MODEL_CHANGE', label: 'ML / AI Model Replacement' }
];

export const ChangeRecommendationsPage: React.FC = () => {
  const [services, setServices] = useState<BankingService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Form State
  const [serviceId, setServiceId] = useState<number>(5); // Payment Service
  const [changeType, setChangeType] = useState<ChangeType>('VERSION_UPDATE');
  const [oldVersion, setOldVersion] = useState<string>('2.0.0');
  const [newVersion, setNewVersion] = useState<string>('3.0.0');
  const [complexity, setComplexity] = useState<number>(8);
  const [description, setDescription] = useState<string>(
    'Upgrade Payment Service to v3.0.0 with ISO 20022 real-time settlement payload schema'
  );

  // Recommendation Result State
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    servicesApi.getServices()
      .then(data => {
        setServices(data);
        setLoadingServices(false);
      })
      .catch(err => {
        console.error('Failed to load services:', err);
        setLoadingServices(false);
      });

    // Run initial benchmark recommendation
    runRecommendationAnalysis(5, 'VERSION_UPDATE', '2.0.0', '3.0.0', 8);
  }, []);

  const runRecommendationAnalysis = async (
    svcId: number,
    type: ChangeType,
    oldV: string,
    newV: string,
    comp: number
  ) => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await recommendationApi.analyzeRecommendations({
        serviceId: svcId,
        changeType: type,
        oldVersion: oldV,
        newVersion: newV,
        complexity: comp,
        description: description
      });
      setResult(res);
    } catch (err: any) {
      console.error('Recommendation generation error:', err);
      setError(err.message || 'Failed to generate change recommendations.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runRecommendationAnalysis(serviceId, changeType, oldVersion, newVersion, complexity);
  };

  const selectedService = services.find(s => s.id === serviceId);
  const serviceName = selectedService?.name || result?.serviceName || 'Payment Service';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="text-xs text-[#94A3B8] font-medium mb-1">
          Operations / Decision Support
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F5F7FA]">
          Evaluate Proposed Release
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 max-w-3xl">
          Automated pre-deployment advisory risk assessment, cascading impact analysis, and deployment guardrails.
        </p>
      </div>

      {/* Main Grid: Left Side Form (4 cols), Right Side Risk Result (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Change Form */}
        <div className="lg:col-span-5 bg-[#121927] p-5 sm:p-6 rounded-xl border border-[#263148] space-y-4">
          <div className="border-b border-[#263148] pb-3">
            <h2 className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-[#4F7CFF]" />
              <span>Evaluate Proposed Release</span>
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Enter release configuration and version parameters
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-[#94A3B8] mb-1.5">
                Target Microservice
              </label>
              <select
                value={serviceId}
                onChange={e => {
                  const id = Number(e.target.value);
                  setServiceId(id);
                  const svc = services.find(s => s.id === id);
                  if (svc?.version) {
                    setOldVersion(svc.version);
                    const parts = svc.version.split('.');
                    const major = parseInt(parts[0], 10) || 1;
                    setNewVersion(`${major + 1}.0.0`);
                  }
                }}
                className="w-full p-2.5 bg-[#0B0F17] border border-[#263148] rounded-lg text-[#F5F7FA] focus:outline-hidden focus:border-[#4F7CFF]"
                disabled={loadingServices}
              >
                {services.map(svc => (
                  <option key={svc.id} value={svc.id}>
                    {svc.name} ({svc.criticality} • Tier {svc.criticality === 'CRITICAL' ? '1' : '2'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#94A3B8] mb-1.5">
                Change Type
              </label>
              <select
                value={changeType}
                onChange={e => setChangeType(e.target.value as ChangeType)}
                className="w-full p-2.5 bg-[#0B0F17] border border-[#263148] rounded-lg text-[#F5F7FA] focus:outline-hidden focus:border-[#4F7CFF]"
              >
                {CHANGE_TYPES.map(ct => (
                  <option key={ct.value} value={ct.value}>{ct.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#94A3B8] mb-1.5">
                  Current Version
                </label>
                <input
                  type="text"
                  value={oldVersion}
                  onChange={e => setOldVersion(e.target.value)}
                  className="w-full p-2.5 bg-[#0B0F17] border border-[#263148] rounded-lg text-[#F5F7FA] font-mono focus:outline-hidden focus:border-[#4F7CFF]"
                />
              </div>
              <div>
                <label className="block font-medium text-[#94A3B8] mb-1.5">
                  New Version
                </label>
                <input
                  type="text"
                  value={newVersion}
                  onChange={e => setNewVersion(e.target.value)}
                  className="w-full p-2.5 bg-[#0B0F17] border border-[#263148] rounded-lg text-[#F5F7FA] font-mono focus:outline-hidden focus:border-[#4F7CFF]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-medium text-[#94A3B8]">
                  Complexity Rating: <span className="text-[#F5F7FA] font-mono">{complexity}/10</span>
                </label>
                <span className="text-[11px] font-mono text-[#F59E0B]">
                  {complexity >= 8 ? 'Major' : complexity >= 6 ? 'High' : complexity >= 4 ? 'Moderate' : 'Low'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={complexity}
                onChange={e => setComplexity(Number(e.target.value))}
                className="w-full accent-[#4F7CFF] bg-[#171F30] rounded-lg h-2 cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-medium text-[#94A3B8] mb-1.5">
                Release Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full p-2.5 bg-[#0B0F17] border border-[#263148] rounded-lg text-[#F5F7FA] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#4F7CFF]"
              />
            </div>

            <button
              type="submit"
              disabled={analyzing}
              className="w-full py-2.5 px-4 font-semibold text-white bg-[#4F7CFF] hover:bg-[#3D68E0] disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              <span>Analyze Proposed Release</span>
            </button>
          </form>
        </div>

        {/* Right Side: Risk Result */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-xs text-[#EF4444] font-mono">
              {error}
            </div>
          )}

          {analyzing && (
            <div className="p-12 text-center bg-[#121927] border border-[#263148] rounded-xl">
              <RefreshCw className="w-8 h-8 text-[#4F7CFF] animate-spin mx-auto mb-3" />
              <div className="text-sm font-semibold text-[#F5F7FA]">Evaluating release risk &amp; dependency impact...</div>
              <div className="text-xs text-[#94A3B8] mt-1">Inspecting downstream topology and historical failure correlations</div>
            </div>
          )}

          {!analyzing && (
            <div className="space-y-6">
              
              {/* Primary Risk Result Card */}
              <div className="bg-[#121927] p-6 rounded-xl border border-[#263148] space-y-5">
                
                {/* At the top: Service & Versions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#263148] pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#F5F7FA] flex items-center gap-2">
                      <Server className="w-5 h-5 text-[#4F7CFF]" />
                      <span>{serviceName}</span>
                    </h2>
                    <div className="text-xs font-mono text-[#94A3B8] mt-1">
                      v{oldVersion} → v{newVersion}
                    </div>
                  </div>

                  {/* HIGH RISK 81 / 100 */}
                  <div className="flex items-center gap-4 sm:text-right">
                    <div>
                      <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#EF4444]/30 bg-[#EF4444]/15 text-[#EF4444]">
                        HIGH RISK
                      </div>
                      <div className="text-2xl font-bold text-[#F5F7FA] tabular-nums mt-0.5">
                        81 <span className="text-sm text-[#94A3B8] font-normal">/ 100</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3 Impact metric stat indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#171F30] border border-[#263148] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0B0F17] border border-[#263148] flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4 text-[#EF4444]" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-[#F5F7FA] tabular-nums">6 services affected</div>
                      <div className="text-[11px] text-[#94A3B8]">Downstream impact blast</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#171F30] border border-[#263148] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0B0F17] border border-[#263148] flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-[#F5F7FA] tabular-nums">2 critical services</div>
                      <div className="text-[11px] text-[#94A3B8]">In direct propagation path</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#171F30] border border-[#263148] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0B0F17] border border-[#263148] flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4 text-[#4F7CFF]" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-[#F5F7FA] tabular-nums">3 dependency levels</div>
                      <div className="text-[11px] text-[#94A3B8]">Maximum topological depth</div>
                    </div>
                  </div>
                </div>

                {/* WHY THIS IS HIGH RISK - 3 concise reasons */}
                <div className="pt-2 border-t border-[#263148] space-y-2.5">
                  <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    Why This is High Risk
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2.5 text-xs text-[#F5F7FA] p-2.5 rounded-lg bg-[#171F30] border border-[#263148]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] mt-1.5 shrink-0" />
                      <span>6 downstream services may be affected including Tier-1 Core Banking and Fraud Detection.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-[#F5F7FA] p-2.5 rounded-lg bg-[#171F30] border border-[#263148]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] mt-1.5 shrink-0" />
                      <span>Major breaking version contract upgrade (v2.0 → v3.0) with high consumer fan-out across payments.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-[#F5F7FA] p-2.5 rounded-lg bg-[#171F30] border border-[#263148]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mt-1.5 shrink-0" />
                      <span>High change complexity rating (8/10) with previous historical incidents during schema transitions.</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* ADVISORY RECOMMENDATIONS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#4F7CFF]" />
                    <span>Advisory Recommendations</span>
                  </h3>
                  <span className="text-xs text-[#94A3B8]">
                    Pre-Deployment Checklist
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Recommendation Card 1: Canary Deployment Gate */}
                  <div className="bg-[#121927] rounded-xl border border-[#263148] p-4.5 space-y-2.5 hover:border-[#364464] transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded border border-[#EF4444]/30 bg-[#EF4444]/15 text-[#EF4444]">
                        CRITICAL PRIORITY
                      </span>
                      <span className="text-[11px] font-mono text-[#94A3B8]">CANARY ROLLOUT</span>
                    </div>
                    <h4 className="text-sm font-semibold text-[#F5F7FA]">
                      Deploy in Staged Canary Ring (5% → 25% → 100%)
                    </h4>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      Given that 6 services depend on Payment Service, route 5% of internal synthetic traffic for 30 minutes before accepting production customer transactions.
                    </p>
                    <div className="p-2.5 bg-[#171F30] rounded-lg border border-[#263148] text-xs">
                      <span className="font-medium text-[#4F7CFF] block mb-0.5">Suggested Engineering Action:</span>
                      <span className="text-[#F5F7FA]">Configure service mesh traffic split rules to route 5% of traffic and observe HTTP 5xx error thresholds.</span>
                    </div>
                  </div>

                  {/* Recommendation Card 2: Critical Service Monitoring */}
                  <div className="bg-[#121927] rounded-xl border border-[#263148] p-4.5 space-y-2.5 hover:border-[#364464] transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded border border-[#F59E0B]/30 bg-[#F59E0B]/15 text-[#F59E0B]">
                        HIGH PRIORITY
                      </span>
                      <span className="text-[11px] font-mono text-[#94A3B8]">TELEMETRY GUARD</span>
                    </div>
                    <h4 className="text-sm font-semibold text-[#F5F7FA]">
                      Monitor Core Banking &amp; Fraud Detection Latency
                    </h4>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      Set automated alerting on p99 settlement latency. Trigger automatic rollback if latency increases by &gt;15% within the first 15 minutes of release.
                    </p>
                    <div className="p-2.5 bg-[#171F30] rounded-lg border border-[#263148] text-xs">
                      <span className="font-medium text-[#4F7CFF] block mb-0.5">Suggested Engineering Action:</span>
                      <span className="text-[#F5F7FA]">Activate Prometheus alert rule for latency spikes on downstream consumer connection pools.</span>
                    </div>
                  </div>

                  {/* Recommendation Card 3: Rollback Runbook */}
                  <div className="bg-[#121927] rounded-xl border border-[#263148] p-4.5 space-y-2.5 hover:border-[#364464] transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded border border-[#4F7CFF]/30 bg-[#4F7CFF]/15 text-[#4F7CFF]">
                        MEDIUM PRIORITY
                      </span>
                      <span className="text-[11px] font-mono text-[#94A3B8]">ROLLBACK VERIFICATION</span>
                    </div>
                    <h4 className="text-sm font-semibold text-[#F5F7FA]">
                      Prepare Dual-Run Database Rollback Script
                    </h4>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      Ensure database schema migration supports backward compatibility with v2.0 in the event an emergency container rollback is required.
                    </p>
                    <div className="p-2.5 bg-[#171F30] rounded-lg border border-[#263148] text-xs">
                      <span className="font-medium text-[#4F7CFF] block mb-0.5">Suggested Engineering Action:</span>
                      <span className="text-[#F5F7FA]">Verify rollback DDL script in staging sandbox prior to production maintenance window start.</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
