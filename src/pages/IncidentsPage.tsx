import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  X,
  Calendar,
  Layers,
  FileText,
  Activity,
  Server,
  ArrowRight
} from 'lucide-react';
import { incidentApi } from '../api/incidentApi';
import { changesApi } from '../api/changesApi';
import { servicesApi } from '../api/servicesApi';
import { IncidentRecord, ChangeRecord, BankingService, Severity } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const IncidentsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [changes, setChanges] = useState<ChangeRecord[]>([]);
  const [services, setServices] = useState<BankingService[]>([]);

  // Filters & sorting
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [failureFilter, setFailureFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');

  // Selected incident for detail view
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [incRes, chgRes, svcRes] = await Promise.all([
        incidentApi.getIncidents(),
        changesApi.getChanges(),
        servicesApi.getServices()
      ]);
      setIncidents(incRes);
      setChanges(chgRes);
      setServices(svcRes);
    } catch (err: any) {
      setError(err?.message || 'Failed to load historical incident logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredIncidents = incidents
    .filter((inc) => {
      const matchesSearch =
        inc.changeDescription.toLowerCase().includes(search.toLowerCase()) ||
        inc.rootCause.toLowerCase().includes(search.toLowerCase()) ||
        inc.affectedServices.toLowerCase().includes(search.toLowerCase()) ||
        String(inc.id).includes(search);

      const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
      const matchesFailure =
        failureFilter === 'ALL' ||
        (failureFilter === 'FAILED' && inc.failure) ||
        (failureFilter === 'SUCCESS' && !inc.failure);

      return matchesSearch && matchesSeverity && matchesFailure;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'NEWEST' ? dateB - dateA : dateA - dateB;
    });

  if (loading) {
    return <LoadingSpinner message="Loading historical change incidents from CGX..." />;
  }

  const relatedChange = selectedIncident
    ? changes.find((c) => c.id === selectedIncident.changeId)
    : null;
  const relatedService = relatedChange
    ? services.find((s) => s.id === relatedChange.serviceId)
    : null;

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#263148] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider uppercase bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
              POST-MORTEM ARCHIVE
            </span>
            <span className="text-xs text-[#94A3B8] font-mono">
              Historical Outcomes &amp; Root Causes
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F5F7FA] mt-1 font-sans">
            Incident Register &amp; Failure Timeline
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5 font-sans">
            Empirical incident outcomes, outage cascades, root-cause analyses, and historical failure correlations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search root cause, services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#121927] border border-[#263148] rounded-lg text-[#F5F7FA] placeholder:text-[#94A3B8] focus:outline-hidden focus:border-[#4F7CFF] w-44 sm:w-56"
            />
          </div>

          {/* Severity filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="py-1.5 px-2.5 rounded-lg border border-[#263148] bg-[#121927] text-[#CBD5E1] focus:outline-hidden"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          {/* Failure filter */}
          <select
            value={failureFilter}
            onChange={(e) => setFailureFilter(e.target.value)}
            className="py-1.5 px-2.5 rounded-lg border border-[#263148] bg-[#121927] text-[#CBD5E1] focus:outline-hidden"
          >
            <option value="ALL">All Outcomes</option>
            <option value="FAILED">Outages / Failures</option>
            <option value="SUCCESS">Smooth Rollouts</option>
          </select>

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="py-1.5 px-2.5 rounded-lg border border-[#263148] bg-[#121927] text-[#CBD5E1] focus:outline-hidden"
          >
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
          </select>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#121927] rounded-xl border border-[#263148] space-y-1">
          <div className="text-[10px] font-mono text-[#94A3B8] uppercase">Total Historical Records</div>
          <div className="text-2xl font-bold font-mono text-[#F5F7FA]">{incidents.length}</div>
        </div>
        <div className="p-3.5 bg-[#121927] rounded-xl border border-[#263148] space-y-1">
          <div className="text-[10px] font-mono text-[#EF4444] uppercase">Unplanned Outages</div>
          <div className="text-2xl font-bold font-mono text-[#EF4444]">
            {incidents.filter((i) => i.failure).length}
          </div>
        </div>
        <div className="p-3.5 bg-[#121927] rounded-xl border border-[#263148] space-y-1">
          <div className="text-[10px] font-mono text-[#22C55E] uppercase">Incident-Free Releases</div>
          <div className="text-2xl font-bold font-mono text-[#22C55E]">
            {incidents.filter((i) => !i.failure).length}
          </div>
        </div>
        <div className="p-3.5 bg-[#121927] rounded-xl border border-[#263148] space-y-1">
          <div className="text-[10px] font-mono text-[#F59E0B] uppercase">Critical Tier Affected</div>
          <div className="text-2xl font-bold font-mono text-[#F59E0B]">
            {incidents.filter((i) => i.severity === 'CRITICAL').length}
          </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-3">
        {filteredIncidents.length === 0 ? (
          <div className="p-12 text-center bg-[#121927] rounded-xl border border-[#263148] text-xs text-[#94A3B8] font-mono">
            No incidents match the specified filter criteria.
          </div>
        ) : (
          filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => setSelectedIncident(inc)}
              className="p-4 bg-[#121927] hover:bg-[#161F30] rounded-xl border border-[#263148] hover:border-[#4F7CFF]/40 transition-colors cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono pb-2 border-b border-[#263148]">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-[#4F7CFF]">INC-#{inc.id}</span>
                  <RiskBadge level={inc.severity} size="sm" />
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    inc.failure ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30' : 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30'
                  }`}>
                    {inc.failure ? 'OUTAGE OCCURRED' : 'NOMINAL DEPLOYMENT'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[#94A3B8] text-[11px]">
                  <span>{new Date(inc.createdAt).toLocaleString()}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#4F7CFF] transition-colors" />
                </div>
              </div>

              <div className="pt-3 space-y-2">
                <div>
                  <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
                    Change Context
                  </span>
                  <p className="text-xs text-[#F5F7FA] font-medium mt-0.5">
                    {inc.changeDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-2.5 bg-[#171F30] rounded-lg border border-[#263148]">
                    <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
                      Root Cause Attribution
                    </span>
                    <span className="text-xs text-[#CBD5E1] mt-0.5 block font-mono">
                      {inc.rootCause}
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#171F30] rounded-lg border border-[#263148]">
                    <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
                      Affected Downstream Services
                    </span>
                    <span className="text-xs text-[#F5F7FA] mt-0.5 block font-mono font-medium">
                      {inc.affectedServices}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Incident Slide-in Detail Drawer */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs">
          <div className="absolute inset-0" onClick={() => setSelectedIncident(null)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#121927] border-l border-[#263148] text-[#F5F7FA] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
              <div className="p-5 border-b border-[#263148] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold tracking-tight text-[#F5F7FA]">
                      Incident #{selectedIncident.id}
                    </h2>
                    <span className="text-xs text-[#94A3B8] font-mono">
                      Severity: {selectedIncident.severity}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedIncident(null)}
                  className="p-1.5 text-[#94A3B8] hover:text-[#F5F7FA] rounded-md transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-mono">
                <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148] space-y-1">
                  <span className="text-[#94A3B8] text-[10px] uppercase block">Change Description</span>
                  <p className="text-[#F5F7FA] font-sans font-medium text-xs leading-relaxed">
                    {selectedIncident.changeDescription}
                  </p>
                </div>

                <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148] space-y-1">
                  <span className="text-[#94A3B8] text-[10px] uppercase block">Investigated Root Cause</span>
                  <p className="text-[#F59E0B] font-mono text-xs leading-relaxed">
                    {selectedIncident.rootCause}
                  </p>
                </div>

                <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148] space-y-1">
                  <span className="text-[#94A3B8] text-[10px] uppercase block">Cascade Blast Radius</span>
                  <p className="text-[#F5F7FA] font-mono text-xs">
                    {selectedIncident.affectedServices}
                  </p>
                </div>

                {relatedChange && (
                  <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148] space-y-2">
                    <span className="text-[#4F7CFF] text-[10px] uppercase block font-semibold">
                      Associated Change Record #CHG-{relatedChange.id}
                    </span>
                    <div className="text-[#CBD5E1] text-[11px] space-y-1 font-mono">
                      <div>Type: {relatedChange.changeType}</div>
                      <div>Complexity: {relatedChange.complexity}/10</div>
                      <div>Version: v{relatedChange.oldVersion} → v{relatedChange.newVersion}</div>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148] text-[11px] text-[#94A3B8]">
                  Recorded on: {new Date(selectedIncident.createdAt).toUTCString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
