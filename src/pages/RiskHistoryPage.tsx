import React, { useEffect, useState } from 'react';
import { 
  History, 
  TrendingUp, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  RefreshCw, 
  Filter, 
  BarChart3, 
  Activity, 
  ChevronRight, 
  Server, 
  Edit3,
  Search
} from 'lucide-react';
import { riskHistoryApi } from '../api/riskHistoryApi';
import { 
  RiskHistoryRecord, 
  RiskTrendsResponse, 
  RiskTrendPoint,
  HistoricalMLPerformance, 
  HighRiskServiceStat, 
  Severity 
} from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export const RiskHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<RiskHistoryRecord[]>([]);
  const [trends, setTrends] = useState<RiskTrendsResponse | null>(null);
  const [mlPerformance, setMlPerformance] = useState<HistoricalMLPerformance | null>(null);
  const [highRiskServices, setHighRiskServices] = useState<HighRiskServiceStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected item for modal
  const [selectedRecord, setSelectedRecord] = useState<RiskHistoryRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Modal editing state for outcome
  const [updatingOutcome, setUpdatingOutcome] = useState(false);
  const [incidentRadio, setIncidentRadio] = useState<boolean | null>(null);
  const [severitySelect, setSeveritySelect] = useState<Severity>('MEDIUM');
  const [outcomeSuccessMsg, setOutcomeSuccessMsg] = useState<string | null>(null);
  const [outcomeErrorMsg, setOutcomeErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [hData, tData, mlData, rankingData] = await Promise.all([
        riskHistoryApi.getAllHistory(),
        riskHistoryApi.getRiskTrends(),
        riskHistoryApi.getMLPerformance(),
        riskHistoryApi.getHighRiskServices()
      ]);
      setHistory(hData);
      setTrends(tData);
      setMlPerformance(mlData);
      setHighRiskServices(rankingData);
    } catch (err: any) {
      console.error('Failed to load risk history data:', err);
      setError(err?.message || 'Failed to load historical risk records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openDetails = (record: RiskHistoryRecord) => {
    setSelectedRecord(record);
    setIncidentRadio(record.actualIncident ?? null);
    setSeveritySelect(record.actualIncidentSeverity || 'MEDIUM');
    setOutcomeSuccessMsg(null);
    setOutcomeErrorMsg(null);
    setModalOpen(true);
  };

  const handleSaveOutcome = async () => {
    if (!selectedRecord || incidentRadio === null) return;
    setUpdatingOutcome(true);
    setOutcomeSuccessMsg(null);
    setOutcomeErrorMsg(null);
    try {
      const updated = await riskHistoryApi.recordOutcome(
        selectedRecord.id,
        {
          actualIncident: incidentRadio,
          actualIncidentSeverity: incidentRadio ? severitySelect : undefined
        }
      );
      setSelectedRecord(updated);
      setOutcomeSuccessMsg('Observed deployment outcome recorded and model dataset synchronized.');
      setHistory(prev => prev.map(item => item.id === updated.id ? updated : item));
      riskHistoryApi.getMLPerformance().then(setMlPerformance).catch(console.error);
    } catch (err: any) {
      setOutcomeErrorMsg(err.message || 'Failed to record actual outcome.');
    } finally {
      setUpdatingOutcome(false);
    }
  };

  const filteredHistory = history.filter(item => {
    if (serviceFilter !== 'ALL' && item.serviceName !== serviceFilter) return false;
    if (outcomeFilter !== 'ALL') {
      if (outcomeFilter === 'INCIDENT' && item.actualIncident !== true) return false;
      if (outcomeFilter === 'NO_INCIDENT' && item.actualIncident !== false) return false;
      if (outcomeFilter === 'UNKNOWN' && item.actualIncident !== null) return false;
      if (outcomeFilter === 'TRUE_POSITIVE' && item.outcomeClassification !== 'TRUE_POSITIVE') return false;
      if (outcomeFilter === 'FALSE_POSITIVE' && item.outcomeClassification !== 'FALSE_POSITIVE') return false;
      if (outcomeFilter === 'FALSE_NEGATIVE' && item.outcomeClassification !== 'FALSE_NEGATIVE') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSvc = item.serviceName.toLowerCase().includes(q);
      const matchId = String(item.id).includes(q);
      const matchChg = item.changeId ? String(item.changeId).includes(q) : false;
      if (!matchSvc && !matchId && !matchChg) return false;
    }
    return true;
  });

  const totalAnalyses = history.length;
  const highRiskCount = history.filter(h => h.riskLevel === 'HIGH' || h.riskLevel === 'CRITICAL').length;
  const knownIncidentsCount = history.filter(h => h.actualIncident === true).length;
  const labeledOutcomesCount = history.filter(h => h.actualIncident !== null).length;
  const uniqueServices = Array.from(new Set(history.map(h => h.serviceName))).sort();

  if (loading && history.length === 0) {
    return <LoadingSpinner message="Loading historical risk evaluations &amp; longitudinal outcomes..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#263148] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#4F7CFF] rounded-full" />
            <h1 className="text-xl font-bold tracking-tight text-[#F5F7FA]">
              Risk History &amp; Outcome Telemetry
            </h1>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1 max-w-3xl">
            Audit historical pre-deployment change evaluations, record actual observed production outcomes, track longitudinal service stability trends, and validate ML prediction fidelity.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#F5F7FA] bg-transparent hover:bg-[#161F30] border border-[#263148] rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh History</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadData} />}

      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121927] p-4 rounded-xl border border-[#263148]">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-medium uppercase tracking-wider mb-2">
            <span>Total Risk Analyses</span>
            <Activity className="w-4 h-4 text-[#4F7CFF]" />
          </div>
          <div className="text-2xl font-bold text-[#F5F7FA] tabular-nums">{totalAnalyses}</div>
          <p className="text-xs text-[#94A3B8] mt-1">Recorded pre-deployment reviews</p>
        </div>

        <div className="bg-[#121927] p-4 rounded-xl border border-[#263148]">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-medium uppercase tracking-wider mb-2">
            <span>High &amp; Critical Changes</span>
            <ShieldAlert className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-bold text-[#F59E0B] tabular-nums">{highRiskCount}</div>
          <p className="text-xs text-[#94A3B8] mt-1">
            {totalAnalyses > 0 ? `${Math.round((highRiskCount / totalAnalyses) * 100)}% of analyzed changes` : 'No data'}
          </p>
        </div>

        <div className="bg-[#121927] p-4 rounded-xl border border-[#263148]">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-medium uppercase tracking-wider mb-2">
            <span>Observed Incidents</span>
            <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
          </div>
          <div className="text-2xl font-bold text-[#EF4444] tabular-nums">{knownIncidentsCount}</div>
          <p className="text-xs text-[#94A3B8] mt-1">Verified post-deploy outages</p>
        </div>

        <div className="bg-[#121927] p-4 rounded-xl border border-[#263148]">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-medium uppercase tracking-wider mb-2">
            <span>Labeled ML Outcomes</span>
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl font-bold text-[#22C55E] tabular-nums">{labeledOutcomesCount}</div>
          <p className="text-xs text-[#94A3B8] mt-1">Verified ground-truth samples</p>
        </div>
      </div>

      {/* 2. Top Row: Historical Risk Trends & Live ML Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Trend Chart */}
        <div className="lg:col-span-2 bg-[#121927] p-5 rounded-xl border border-[#263148]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#4F7CFF]" />
                <span>Historical Change Risk Trend</span>
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Average risk score and incident occurrences aggregated over time
              </p>
            </div>
            <span className="text-xs font-mono text-[#94A3B8]">
              {trends?.points.length || 0} Data Points
            </span>
          </div>

          {trends && trends.points.length > 0 ? (
            <div className="space-y-3 pt-2">
              <div className="h-44 flex items-end gap-2 sm:gap-3 px-2 border-b border-[#263148] pb-2">
                {trends.points.slice(-8).map((pt, idx) => {
                  const heightPercent = Math.max(12, Math.round(pt.averageRiskScore * 100));
                  const incidentNum = pt.incidentsCount ?? (pt as any).incidentCount ?? 0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {incidentNum > 0 && (
                        <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" title={`${incidentNum} incident(s)`} />
                      )}
                      <div className="w-full bg-[#171F30] rounded-t hover:bg-[#4F7CFF]/30 transition-all flex items-end justify-center relative overflow-hidden" style={{ height: '120px' }}>
                        <div 
                          className={`w-full rounded-t transition-all ${
                            pt.averageRiskScore >= 0.7 ? 'bg-[#EF4444]' :
                            pt.averageRiskScore >= 0.4 ? 'bg-[#F59E0B]' : 'bg-[#22C55E]'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#94A3B8] font-mono truncate max-w-full">
                        {pt.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#94A3B8] pt-1">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#22C55E] rounded" /> Low</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#F59E0B] rounded" /> High</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#EF4444] rounded" /> Critical</span>
                </div>
                <span>Bar height represents average risk score</span>
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-xs text-[#94A3B8]">
              No trend data recorded yet.
            </div>
          )}
        </div>

        {/* Historical ML Performance from Actual Outcomes */}
        <div className="bg-[#121927] p-5 rounded-xl border border-[#263148] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#4F7CFF]" />
                <span>Historical ML Fidelity</span>
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                mlPerformance?.status === 'OK' 
                  ? 'bg-[#22C55E]/15 border-[#22C55E]/30 text-[#22C55E]' 
                  : 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#F59E0B]'
              }`}>
                {mlPerformance?.status === 'OK' ? 'VALIDATED' : 'COLLECTING DATA'}
              </span>
            </div>

            <p className="text-xs text-[#94A3B8] mb-4">
              Realized model accuracy and confusion breakdown computed strictly from confirmed deployment incident logs.
            </p>

            {mlPerformance?.status === 'OK' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded bg-[#171F30] border border-[#263148]">
                    <div className="text-xs text-[#94A3B8]">Accuracy</div>
                    <div className="text-lg font-bold text-[#F5F7FA] tabular-nums">
                      {Math.round((mlPerformance.accuracy || 0) * 100)}%
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-[#171F30] border border-[#263148]">
                    <div className="text-xs text-[#94A3B8]">Catch Rate</div>
                    <div className="text-lg font-bold text-[#22C55E] tabular-nums">
                      {Math.round((mlPerformance.recall || 0) * 100)}%
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-[#171F30] border border-[#263148]">
                    <div className="text-xs text-[#94A3B8]">Precision</div>
                    <div className="text-lg font-bold text-[#4F7CFF] tabular-nums">
                      {Math.round((mlPerformance.precision || 0) * 100)}%
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-[#171F30] border border-[#263148]">
                    <div className="text-xs text-[#94A3B8]">F1 Score</div>
                    <div className="text-lg font-bold text-[#F5F7FA] tabular-nums">
                      {mlPerformance.f1?.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Confusion Matrix Mini Table */}
                <div className="border border-[#263148] rounded-lg p-3 text-xs bg-[#0B0F17]">
                  <div className="font-semibold text-[#94A3B8] mb-2 text-[11px] uppercase tracking-wider">
                    Observed Deployment Outcomes:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                    <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 p-1.5 rounded text-[#22C55E]">
                      <div className="font-bold text-sm tabular-nums">{mlPerformance.truePositives}</div>
                      True Positives (Caught)
                    </div>
                    <div className="bg-[#4F7CFF]/10 border border-[#4F7CFF]/20 p-1.5 rounded text-[#4F7CFF]">
                      <div className="font-bold text-sm tabular-nums">{mlPerformance.trueNegatives}</div>
                      True Negatives (Clean)
                    </div>
                    <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 p-1.5 rounded text-[#F59E0B]">
                      <div className="font-bold text-sm tabular-nums">{mlPerformance.falsePositives}</div>
                      False Positives
                    </div>
                    <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 p-1.5 rounded text-[#EF4444]">
                      <div className="font-bold text-sm tabular-nums">{mlPerformance.falseNegatives}</div>
                      False Negatives (Missed)
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 text-center bg-[#171F30] border border-[#263148] rounded-lg text-xs">
                <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-[#F59E0B]" />
                <div className="font-semibold text-[#F5F7FA] mb-1">Collecting Labeled Data</div>
                <p className="text-[#94A3B8] leading-relaxed">
                  {mlPerformance?.message || 'A minimum of labeled historical outcomes is required to report statistical ML accuracy.'}
                </p>
                <div className="mt-2.5 font-mono text-[11px] text-[#94A3B8]">
                  Current samples: {mlPerformance?.labeledSamples || 0} / {mlPerformance?.minRequiredSamples || 5}
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-[#94A3B8] mt-3 pt-2 border-t border-[#263148] font-mono">
            Threshold: {mlPerformance?.threshold || 0.50} | Model: Random Forest v2.0
          </div>
        </div>
      </div>

      {/* 3. High-Risk Services Ranking */}
      <div className="bg-[#121927] p-5 rounded-xl border border-[#263148]">
        <h2 className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2 mb-1">
          <Server className="w-4 h-4 text-[#EF4444]" />
          <span>High-Risk Microservices Ranking</span>
        </h2>
        <p className="text-xs text-[#94A3B8] mb-4">
          Services with frequent high-risk release reviews and past incident correlations
        </p>

        <div className="overflow-x-auto rounded-lg border border-[#263148]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#171F30] text-[#94A3B8] uppercase text-[10px] tracking-wider border-b border-[#263148]">
              <tr>
                <th className="py-2.5 px-3">Service Name</th>
                <th className="py-2.5 px-3">Tier</th>
                <th className="py-2.5 px-3">Total Reviews</th>
                <th className="py-2.5 px-3">High-Risk Releases</th>
                <th className="py-2.5 px-3">Past Incidents</th>
                <th className="py-2.5 px-3">Average Risk Score</th>
                <th className="py-2.5 px-3">Failure Frequency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263148] text-[#F5F7FA]">
              {highRiskServices.map(svc => (
                <tr key={svc.serviceId} className="hover:bg-[#161F30] transition-colors">
                  <td className="py-2.5 px-3 font-medium text-[#F5F7FA]">
                    {svc.serviceName}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      svc.criticality === 'CRITICAL' ? 'border-[#EF4444]/30 bg-[#EF4444]/15 text-[#EF4444]' :
                      svc.criticality === 'HIGH' ? 'border-[#F59E0B]/30 bg-[#F59E0B]/15 text-[#F59E0B]' :
                      'border-[#263148] bg-[#171F30] text-[#94A3B8]'
                    }`}>
                      {svc.criticality}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono tabular-nums">{svc.analyzedChanges}</td>
                  <td className="py-2.5 px-3 font-semibold text-[#F59E0B] tabular-nums">
                    {svc.highRiskChanges}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-[#EF4444] tabular-nums">
                    {svc.actualIncidents}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold tabular-nums">
                    {(svc.averageRiskScore * 100).toFixed(0)}%
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-[#171F30] rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-[#EF4444] h-1.5 rounded-full" 
                          style={{ width: `${Math.min(100, Math.round(svc.incidentRate * 100))}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-[#94A3B8]">
                        {(svc.incidentRate * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Complete Risk Evaluations History */}
      <div className="bg-[#121927] p-5 rounded-xl border border-[#263148] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2">
              <History className="w-4 h-4 text-[#4F7CFF]" />
              <span>Evaluated Changes Log ({filteredHistory.length})</span>
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Historical change records with observed production outcome labeling
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-2.5 py-1.5 bg-[#0B0F17] border border-[#263148] rounded-lg text-xs text-[#F5F7FA] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#4F7CFF]"
              />
            </div>

            <select
              value={serviceFilter}
              onChange={e => setServiceFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-[#0B0F17] border border-[#263148] rounded-lg text-[#94A3B8] focus:outline-hidden"
            >
              <option value="ALL">All Microservices</option>
              {uniqueServices.map(svc => (
                <option key={svc} value={svc}>{svc}</option>
              ))}
            </select>

            <select
              value={outcomeFilter}
              onChange={e => setOutcomeFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-[#0B0F17] border border-[#263148] rounded-lg text-[#94A3B8] focus:outline-hidden"
            >
              <option value="ALL">All Outcomes</option>
              <option value="INCIDENT">Incident Occurred</option>
              <option value="NO_INCIDENT">Clean / No Incident</option>
              <option value="UNKNOWN">Pending / Unknown</option>
              <option value="TRUE_POSITIVE">True Positives</option>
              <option value="FALSE_POSITIVE">False Positives</option>
              <option value="FALSE_NEGATIVE">False Negatives</option>
            </select>
          </div>
        </div>

        {/* Changelog Table */}
        <div className="overflow-x-auto rounded-lg border border-[#263148]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#171F30] text-[#94A3B8] uppercase text-[10px] tracking-wider border-b border-[#263148]">
              <tr>
                <th className="py-2.5 px-3">Record ID</th>
                <th className="py-2.5 px-3">Service</th>
                <th className="py-2.5 px-3">Rule Risk</th>
                <th className="py-2.5 px-3">Blast Radius</th>
                <th className="py-2.5 px-3">ML Prediction</th>
                <th className="py-2.5 px-3">Actual Outcome</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">Evaluated At</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263148] text-[#F5F7FA]">
              {filteredHistory.map(item => (
                <tr 
                  key={item.id} 
                  className="hover:bg-[#161F30] cursor-pointer transition-colors"
                  onClick={() => openDetails(item)}
                >
                  <td className="py-3 px-3 font-mono text-[#4F7CFF]">
                    #{item.id}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-[#F5F7FA]">{item.serviceName}</div>
                    <div className="text-[10px] text-[#94A3B8] font-mono">
                      {item.changeId ? `Change #${item.changeId}` : 'Proposed Change'}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <RiskBadge level={item.riskLevel} />
                    <div className="text-[10px] font-mono text-[#94A3B8] mt-0.5">
                      Score: {item.riskScore.toFixed(2)}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-[#F5F7FA] tabular-nums">
                      {item.blastRadiusScore.toFixed(1)} / 100
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">
                      {item.affectedServicesCount} svcs ({item.criticalServicesAffected} crit)
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    {item.mlPrediction !== null && item.mlPrediction !== undefined ? (
                      <div>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          item.mlPrediction === 1 ? 'border-[#EF4444]/30 bg-[#EF4444]/15 text-[#EF4444]' : 'border-[#22C55E]/30 bg-[#22C55E]/15 text-[#22C55E]'
                        }`}>
                          {item.mlPrediction === 1 ? 'PREDICTED RISK' : 'PREDICTED SAFE'}
                        </span>
                        <div className="text-[10px] font-mono text-[#94A3B8] mt-0.5">
                          Prob: {Math.round((item.mlFailureProbability || 0) * 100)}%
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#94A3B8] italic">Offline</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {item.actualIncident === true ? (
                      <span className="inline-flex items-center gap-1 text-[#EF4444] font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Incident ({item.actualIncidentSeverity || 'SEV'})
                      </span>
                    ) : item.actualIncident === false ? (
                      <span className="inline-flex items-center gap-1 text-[#22C55E] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Clean Deploy
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#94A3B8]">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Pending Outcome
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px]">
                    {item.outcomeClassification === 'TRUE_POSITIVE' && (
                      <span className="text-[#22C55E] font-bold">TRUE POSITIVE</span>
                    )}
                    {item.outcomeClassification === 'TRUE_NEGATIVE' && (
                      <span className="text-[#4F7CFF] font-bold">TRUE NEGATIVE</span>
                    )}
                    {item.outcomeClassification === 'FALSE_POSITIVE' && (
                      <span className="text-[#F59E0B] font-bold">FALSE POSITIVE</span>
                    )}
                    {item.outcomeClassification === 'FALSE_NEGATIVE' && (
                      <span className="text-[#EF4444] font-bold">FALSE NEGATIVE</span>
                    )}
                    {item.outcomeClassification === 'UNKNOWN' && (
                      <span className="text-[#94A3B8] italic">UNKNOWN</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-[#94A3B8] whitespace-nowrap text-[11px] font-mono">
                    {item.analysisTimestamp ? item.analysisTimestamp.replace('T', ' ').slice(0, 16) : 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openDetails(item); }}
                      className="p-1 rounded hover:bg-[#171F30] text-[#94A3B8] hover:text-[#F5F7FA] cursor-pointer"
                      title="View &amp; Edit Outcome"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredHistory.length === 0 && (
            <div className="p-8 text-center text-[#94A3B8] text-xs">
              No historical risk analyses matched the selected filters.
            </div>
          )}
        </div>
      </div>

      {/* 5. Details & Record Outcome Modal */}
      {modalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#121927] border border-[#263148] rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#263148] pb-3">
              <div>
                <span className="text-xs font-mono text-[#94A3B8]">Analysis Record #{selectedRecord.id}</span>
                <h3 className="text-lg font-bold text-[#F5F7FA] flex items-center gap-2 mt-0.5">
                  <Server className="w-5 h-5 text-[#4F7CFF]" />
                  <span>{selectedRecord.serviceName}</span>
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#F5F7FA] text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#171F30] border border-[#263148]">
                <div className="text-[#94A3B8] text-[10px] uppercase">Rule Risk Level</div>
                <div className="font-bold text-sm text-[#F5F7FA] mt-0.5">
                  {selectedRecord.riskLevel} ({(selectedRecord.riskScore * 100).toFixed(0)}%)
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#171F30] border border-[#263148]">
                <div className="text-[#94A3B8] text-[10px] uppercase">Blast Radius</div>
                <div className="font-bold text-sm text-[#F5F7FA] mt-0.5">
                  {selectedRecord.blastRadiusScore.toFixed(1)} / 100
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#171F30] border border-[#263148]">
                <div className="text-[#94A3B8] text-[10px] uppercase">ML Probability</div>
                <div className="font-bold text-sm text-[#F5F7FA] mt-0.5">
                  {selectedRecord.mlFailureProbability !== null && selectedRecord.mlFailureProbability !== undefined
                    ? `${Math.round(selectedRecord.mlFailureProbability * 100)}%`
                    : 'N/A'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#171F30] border border-[#263148]">
                <div className="text-[#94A3B8] text-[10px] uppercase">ML Prediction</div>
                <div className="font-bold text-sm text-[#F5F7FA] mt-0.5">
                  {selectedRecord.mlPrediction === 1 ? 'INCIDENT' : selectedRecord.mlPrediction === 0 ? 'CLEAN' : 'OFFLINE'}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-[#171F30] rounded-lg border border-[#263148] text-xs space-y-1.5">
              <div className="font-semibold text-[#94A3B8]">Topology Reach at Analysis Time:</div>
              <div className="grid grid-cols-3 gap-2 text-[#94A3B8] text-[11px]">
                <div>Affected Services: <span className="font-bold text-[#F5F7FA]">{selectedRecord.affectedServicesCount}</span></div>
                <div>Critical Services: <span className="font-bold text-[#EF4444]">{selectedRecord.criticalServicesAffected}</span></div>
                <div>Dependency Depth: <span className="font-bold text-[#F5F7FA]">{selectedRecord.dependencyDepth} layers</span></div>
              </div>
            </div>

            <div className="border border-[#263148] bg-[#0B0F17] rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#4F7CFF]" />
                <h4 className="text-sm font-bold text-[#F5F7FA]">
                  Record Observed Production Deployment Outcome
                </h4>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Did this release result in an unexpected production outage or customer degradation? Updating this outcome provides verified ground truth for model retraining.
              </p>

              {outcomeSuccessMsg && (
                <div className="p-2.5 rounded bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{outcomeSuccessMsg}</span>
                </div>
              )}

              {outcomeErrorMsg && (
                <div className="p-2.5 rounded bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{outcomeErrorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                    Actual Incident Result:
                  </label>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="incidentResult"
                        checked={incidentRadio === true}
                        onChange={() => setIncidentRadio(true)}
                        className="text-[#EF4444] accent-[#EF4444]"
                      />
                      <span className="font-semibold text-[#EF4444]">Incident Occurred</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="incidentResult"
                        checked={incidentRadio === false}
                        onChange={() => setIncidentRadio(false)}
                        className="text-[#22C55E] accent-[#22C55E]"
                      />
                      <span className="font-semibold text-[#22C55E]">Clean / No Incident</span>
                    </label>
                  </div>
                </div>

                {incidentRadio && (
                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                      Incident Severity:
                    </label>
                    <select
                      value={severitySelect}
                      onChange={e => setSeveritySelect(e.target.value as Severity)}
                      className="w-full text-xs p-1.5 bg-[#121927] border border-[#263148] rounded-lg text-[#F5F7FA]"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#94A3B8] hover:text-[#F5F7FA] hover:bg-[#171F30] rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveOutcome}
                  disabled={updatingOutcome}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#4F7CFF] hover:bg-[#3D68E0] disabled:opacity-50 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {updatingOutcome ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save Outcome</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
