import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Server, 
  Search, 
  X, 
  Plus
} from 'lucide-react';
import { servicesApi } from '../api/servicesApi';
import { dependencyApi } from '../api/dependencyApi';
import { blastRadiusApi } from '../api/blastRadiusApi';
import { changesApi } from '../api/changesApi';
import { incidentApi } from '../api/incidentApi';
import { BankingService, Dependency, BlastRadiusResult, ChangeRecord, IncidentRecord } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';

export const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [services, setServices] = useState<BankingService[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [changes, setChanges] = useState<ChangeRecord[]>([]);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);

  // Filtering states
  const [search, setSearch] = useState('');
  const [criticalityFilter, setCriticalityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Selected Service for Details Drawer/Panel
  const [selectedService, setSelectedService] = useState<BankingService | null>(null);
  const [serviceBlastRadius, setServiceBlastRadius] = useState<BlastRadiusResult | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [svcRes, depRes, chgRes, incRes] = await Promise.all([
        servicesApi.getServices(),
        dependencyApi.getAllDependencies(),
        changesApi.getChanges(),
        incidentApi.getIncidents()
      ]);
      setServices(svcRes);
      setDependencies(depRes);
      setChanges(chgRes);
      setIncidents(incRes);
    } catch (err: any) {
      setError(err?.message || 'Failed to load banking microservices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectService = async (service: BankingService) => {
    setSelectedService(service);
    setLoadingDetails(true);
    try {
      const blast = await blastRadiusApi.getBlastRadiusForService(service.id);
      setServiceBlastRadius(blast);
    } catch (err) {
      console.error('Error fetching blast radius for service:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const serviceTypes = Array.from(new Set(services.map((s) => s.type))).sort();

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.type.toLowerCase().includes(search.toLowerCase()) ||
      String(s.id).includes(search);

    const matchesCrit = criticalityFilter === 'ALL' || s.criticality === criticalityFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || s.type === typeFilter;

    return matchesSearch && matchesCrit && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#263148] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#4F7CFF] rounded-full" />
            <h1 className="text-xl font-bold tracking-tight text-[#F5F7FA]">
              Services Catalog
            </h1>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Registered microservices, tier classifications, topology dependencies, and versions.
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
              placeholder="Search services or types..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#0B0F17] border border-[#263148] rounded-lg text-xs text-[#F5F7FA] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#4F7CFF] font-mono"
            />
          </div>

          {/* Criticality Filter */}
          <select
            value={criticalityFilter}
            onChange={(e) => setCriticalityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#0B0F17] border border-[#263148] rounded-lg text-[#CBD5E1] focus:outline-hidden text-xs"
            aria-label="Filter by Criticality"
          >
            <option value="ALL">All Criticalities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#0B0F17] border border-[#263148] rounded-lg text-[#CBD5E1] focus:outline-hidden text-xs"
            aria-label="Filter by Service Type"
          >
            <option value="ALL">All Types</option>
            {serviceTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#0B0F17] border border-[#263148] rounded-lg text-[#CBD5E1] focus:outline-hidden text-xs"
            aria-label="Filter by Status"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
          </select>
        </div>

        <span className="text-[11px] text-[#94A3B8] font-mono">
          Showing {filteredServices.length} of {services.length} services
        </span>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadData} showFallbackNotice />}

      {/* Main Content: Table + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Table Column */}
        <div className={`${selectedService ? 'lg:col-span-8' : 'lg:col-span-12'} bg-[#121927] border border-[#263148] rounded-xl overflow-hidden`}>
          {filteredServices.length === 0 ? (
            <EmptyState
              title="No microservices found"
              description="No services match the current filter or search criteria."
              actionText="Reset Filters"
              onAction={() => {
                setSearch('');
                setCriticalityFilter('ALL');
                setStatusFilter('ALL');
                setTypeFilter('ALL');
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#171F30] text-[#94A3B8] text-[10px] uppercase font-semibold tracking-wider border-b border-[#263148]">
                  <tr>
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Service Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Criticality</th>
                    <th className="py-2.5 px-3">Version</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#263148] text-[#F5F7FA]">
                  {filteredServices.map((s) => {
                    const isSelected = selectedService?.id === s.id;
                    return (
                      <tr
                        key={s.id}
                        onClick={() => handleSelectService(s)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#171F30]'
                            : 'hover:bg-[#161F30]'
                        }`}
                      >
                        <td className="py-3 px-3 font-mono text-[#4F7CFF]">
                          #{s.id}
                        </td>
                        <td className="py-3 px-3 font-semibold text-[#F5F7FA]">
                          {s.name}
                        </td>
                        <td className="py-3 px-3 text-[#94A3B8]">
                          {s.type}
                        </td>
                        <td className="py-3 px-3">
                          <RiskBadge level={s.criticality} size="sm" />
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-[#94A3B8]">
                          v{s.version}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[11px] text-[#22C55E] font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectService(s);
                            }}
                            className="text-[#4F7CFF] hover:underline text-xs cursor-pointer font-medium"
                          >
                            Inspect →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Service Details Drawer Panel */}
        {selectedService && (
          <div className="lg:col-span-4 bg-[#121927] border border-[#263148] rounded-xl p-5 space-y-4 sticky top-20">
            <div className="flex items-start justify-between border-b border-[#263148] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#F5F7FA]">
                    {selectedService.name}
                  </h3>
                  <RiskBadge level={selectedService.criticality} size="sm" />
                </div>
                <div className="text-xs text-[#94A3B8] mt-0.5 font-mono">
                  ID: #{selectedService.id} • Type: {selectedService.type} • v{selectedService.version}
                </div>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="p-1 rounded-md text-[#94A3B8] hover:text-[#F5F7FA] transition-colors cursor-pointer"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingDetails ? (
              <LoadingSpinner message="Calculating dependency blast radius..." size="sm" />
            ) : (
              <>
                {/* Blast Radius Quick Metrics */}
                {serviceBlastRadius && (
                  <div className="p-3.5 rounded-xl bg-[#171F30] border border-[#263148] space-y-2">
                    <div className="text-xs font-semibold text-[#F5F7FA] flex items-center justify-between">
                      <span className="text-[11px] text-[#94A3B8] uppercase">Blast Radius Score</span>
                      <span className="font-mono font-bold text-[#F5F7FA] tabular-nums">
                        {(serviceBlastRadius.blastRadiusScore ?? 0).toFixed(1)} / 100
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-1 text-[11px]">
                      <div className="bg-[#0B0F17] p-2 rounded-lg border border-[#263148]">
                        <div className="text-[#94A3B8] text-[10px]">Impacted</div>
                        <div className="font-bold text-[#F5F7FA] tabular-nums">
                          {serviceBlastRadius.totalAffectedServices ?? serviceBlastRadius.affectedCount}
                        </div>
                      </div>
                      <div className="bg-[#0B0F17] p-2 rounded-lg border border-[#263148]">
                        <div className="text-[#94A3B8] text-[10px]">Max Depth</div>
                        <div className="font-bold text-[#F5F7FA] tabular-nums">
                          {serviceBlastRadius.maxDependencyDepth || 3}
                        </div>
                      </div>
                      <div className="bg-[#0B0F17] p-2 rounded-lg border border-[#263148]">
                        <div className="text-[#EF4444] text-[10px]">Critical</div>
                        <div className="font-bold text-[#EF4444] tabular-nums">
                          {serviceBlastRadius.criticalServicesAffected}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Direct Dependencies */}
                <div>
                  <div className="text-[11px] uppercase text-[#94A3B8] font-semibold tracking-wider mb-2">
                    Direct Outbound Dependencies
                  </div>
                  {dependencies.filter((d) => d.sourceServiceId === selectedService.id).length === 0 ? (
                    <div className="text-xs text-[#94A3B8] italic">No outbound dependencies (Leaf node)</div>
                  ) : (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {dependencies
                        .filter((d) => d.sourceServiceId === selectedService.id)
                        .map((d) => {
                          const target = services.find((s) => s.id === d.targetServiceId);
                          return (
                            <div
                              key={d.id}
                              className="text-xs p-2 rounded-lg bg-[#171F30] border border-[#263148] flex items-center justify-between"
                            >
                              <span className="font-medium text-[#F5F7FA]">
                                {target?.name || `Service #${d.targetServiceId}`}
                              </span>
                              <span className="font-mono text-[10px] text-[#94A3B8]">
                                {d.dependencyType}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Recent Changes for Service */}
                <div>
                  <div className="text-[11px] uppercase text-[#94A3B8] font-semibold tracking-wider mb-2">
                    Recent Changes on this Service
                  </div>
                  {changes.filter((c) => c.serviceId === selectedService.id).length === 0 ? (
                    <div className="text-xs text-[#94A3B8] italic">No recent changes recorded</div>
                  ) : (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {changes
                        .filter((c) => c.serviceId === selectedService.id)
                        .slice(0, 3)
                        .map((c) => (
                          <div
                            key={c.id}
                            className="text-xs p-2 rounded-lg bg-[#171F30] border border-[#263148] flex items-center justify-between"
                          >
                            <span className="text-[#F5F7FA] font-mono text-[11px]">
                              {c.changeType}
                            </span>
                            <span className="font-mono text-[11px] text-[#94A3B8]">
                              v{c.oldVersion} → v{c.newVersion}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() =>
                      navigate('/submit-change', {
                        state: { serviceId: selectedService.id }
                      })
                    }
                    className="w-full py-2 text-xs font-semibold text-white bg-[#4F7CFF] hover:bg-[#3D68E0] rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    Propose Change for {selectedService.name}
                  </button>

                  <button
                    onClick={() =>
                      navigate('/dependency-graph', {
                        state: { selectedServiceId: selectedService.id }
                      })
                    }
                    className="w-full py-2 text-xs font-medium text-[#F5F7FA] bg-[#171F30] hover:bg-[#161F30] border border-[#263148] rounded-lg transition-colors cursor-pointer"
                  >
                    View in Dependency Map →
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
