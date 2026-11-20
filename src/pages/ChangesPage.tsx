import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GitPullRequest, 
  Search, 
  Plus, 
  ChevronRight,
  Layers
} from 'lucide-react';
import { changesApi } from '../api/changesApi';
import { servicesApi } from '../api/servicesApi';
import { ChangeRecord, BankingService, RiskLevel } from '../types';
import { ChangeDrawer } from '../components/ChangeDrawer';

export const ChangesPage: React.FC = () => {
  const navigate = useNavigate();
  const [changes, setChanges] = useState<ChangeRecord[]>([]);
  const [services, setServices] = useState<BankingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected change for detail drawer
  const [selectedChange, setSelectedChange] = useState<ChangeRecord | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [chgData, svcData] = await Promise.all([
        changesApi.getChanges(),
        servicesApi.getServices()
      ]);
      setChanges(chgData);
      setServices(svcData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load changes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute realistic risk and affected count
  const getChangeMeta = (c: ChangeRecord) => {
    const svc = services.find((s) => s.id === c.serviceId);
    const isCrit = svc?.criticality === 'CRITICAL';
    const isHigh = svc?.criticality === 'HIGH';

    let level: RiskLevel = 'LOW';
    let affectedCount = 2;
    let statusText = 'Approved';
    let timeText = '5h ago';

    if (c.complexity >= 8 && isCrit) {
      level = 'CRITICAL';
      affectedCount = 7;
      statusText = 'Needs review';
      timeText = '14m ago';
    } else if (c.complexity >= 7 || (c.complexity >= 5 && isCrit)) {
      level = 'HIGH';
      affectedCount = 6;
      statusText = 'Needs review';
      timeText = '1h ago';
    } else if (c.complexity >= 4 || isHigh) {
      level = 'MEDIUM';
      affectedCount = 4;
      statusText = 'Analyzed';
      timeText = '3h ago';
    } else {
      level = 'LOW';
      affectedCount = 2;
      statusText = 'Approved';
      timeText = '5h ago';
    }

    return { level, affectedCount, statusText, timeText, svc };
  };

  const filteredChanges = useMemo(() => {
    return changes.filter((c) => {
      const { level, statusText, svc } = getChangeMeta(c);

      if (serviceFilter !== 'ALL' && c.serviceId !== Number(serviceFilter)) return false;
      if (riskFilter !== 'ALL' && level !== riskFilter) return false;
      if (statusFilter !== 'ALL' && statusText !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = c.description.toLowerCase().includes(q);
        const matchId = `chg-${c.id}`.includes(q) || String(c.id).includes(q);
        const matchSvc = svc?.name.toLowerCase().includes(q) || false;
        const matchType = c.changeType.toLowerCase().includes(q);
        return matchDesc || matchId || matchSvc || matchType;
      }

      return true;
    });
  }, [changes, services, serviceFilter, riskFilter, statusFilter, searchQuery]);

  const renderRiskPill = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border border-[#EF4444]/30 bg-[#EF4444]/15 text-[#EF4444]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border border-[#F59E0B]/30 bg-[#F59E0B]/15 text-[#F59E0B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border border-[#F59E0B]/30 bg-[#F59E0B]/15 text-[#F59E0B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border border-[#22C55E]/30 bg-[#22C55E]/15 text-[#22C55E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#263148] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#4F7CFF] rounded-full" />
            <h1 className="text-xl font-bold tracking-tight text-[#F5F7FA]">
              Technical Changes
            </h1>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1 font-sans">
            Central operational register of proposed architecture changes, risk evaluations, and blast footprints.
          </p>
        </div>

        <button
          onClick={() => navigate('/submit-change')}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#4F7CFF] hover:bg-[#3D68E0] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Propose a Change</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#121927] border border-[#263148] rounded-xl text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search change ID, service, or desc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#0B0F17] border border-[#263148] rounded-lg text-xs text-[#F5F7FA] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#4F7CFF] font-mono"
            />
          </div>

          {/* Service filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#0B0F17] border border-[#263148] rounded-lg text-[#CBD5E1] focus:outline-hidden text-xs"
          >
            <option value="ALL">All Services</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Risk filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#0B0F17] border border-[#263148] rounded-lg text-[#CBD5E1] focus:outline-hidden text-xs"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#0B0F17] border border-[#263148] rounded-lg text-[#CBD5E1] focus:outline-hidden text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="Needs review">Needs review</option>
            <option value="Analyzed">Analyzed</option>
            <option value="Approved">Approved</option>
          </select>
        </div>

        <div className="text-[11px] text-[#94A3B8] font-mono">
          Showing {filteredChanges.length} changes
        </div>
      </div>

      {/* Main Table: Change | Service | Version | Risk | Impact | Status | Created */}
      <div className="bg-[#121927] border border-[#263148] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#171F30] border-b border-[#263148] text-[#94A3B8] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Change</th>
                <th className="py-3 px-4 font-semibold">Service</th>
                <th className="py-3 px-4 font-semibold">Version</th>
                <th className="py-3 px-4 font-semibold">Risk</th>
                <th className="py-3 px-4 font-semibold">Impact</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Created</th>
                <th className="py-3 px-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263148] text-[#F5F7FA]">
              {filteredChanges.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#94A3B8] text-xs">
                    No change records match your active search filters.
                  </td>
                </tr>
              ) : (
                filteredChanges.map((c) => {
                  const { level, affectedCount, statusText, timeText, svc } = getChangeMeta(c);

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedChange(c)}
                      className="hover:bg-[#161F30] transition-colors cursor-pointer group"
                    >
                      {/* Change Title & ID */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[#4F7CFF] font-semibold text-xs shrink-0">
                            CHG-{c.id}
                          </span>
                          <span className="font-medium text-[#F5F7FA] truncate max-w-xs block" title={c.description}>
                            {c.description}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#94A3B8] font-mono mt-0.5">
                          {c.changeType}
                        </div>
                      </td>

                      {/* Service Name & Criticality */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#F5F7FA]">
                          {svc?.name || `Service #${c.serviceId}`}
                        </div>
                        <div className="text-[11px] text-[#94A3B8]">
                          Tier: {svc?.criticality || 'Standard'}
                        </div>
                      </td>

                      {/* Version Shift (v2.0 → v3.0) */}
                      <td className="py-3 px-4 font-mono text-xs">
                        <span className="text-[#CBD5E1]">v{c.oldVersion}</span>
                        <span className="text-[#94A3B8] mx-1.5">→</span>
                        <span className="text-[#F5F7FA] font-semibold">v{c.newVersion}</span>
                      </td>

                      {/* Risk Level Badge */}
                      <td className="py-3 px-4">
                        {renderRiskPill(level)}
                      </td>

                      {/* Impact (e.g. "6 services affected") */}
                      <td className="py-3 px-4 font-mono text-xs text-[#CBD5E1]">
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#94A3B8]" />
                          <span>{affectedCount} services affected</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          statusText === 'Needs review' ? 'text-[#F59E0B]' :
                          statusText === 'Approved' ? 'text-[#22C55E]' : 'text-[#4F7CFF]'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            statusText === 'Needs review' ? 'bg-[#F59E0B]' :
                            statusText === 'Approved' ? 'bg-[#22C55E]' : 'bg-[#4F7CFF]'
                          }`} />
                          {statusText}
                        </span>
                      </td>

                      {/* Created Time */}
                      <td className="py-3 px-4 text-[#94A3B8] text-xs font-mono">
                        {timeText}
                      </td>

                      {/* Chevron Action */}
                      <td className="py-3 px-3 text-right">
                        <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F5F7FA] transition-colors inline-block" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Inspector Drawer for Selected Change */}
      <ChangeDrawer
        change={selectedChange}
        service={services.find((s) => s.id === selectedChange?.serviceId)}
        isOpen={!!selectedChange}
        onClose={() => setSelectedChange(null)}
      />
    </div>
  );
};
