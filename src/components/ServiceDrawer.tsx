import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Server, 
  ShieldAlert, 
  Network, 
  AlertTriangle 
} from 'lucide-react';
import { BankingService, ChangeRecord, IncidentRecord } from '../types';

interface ServiceDrawerProps {
  service: BankingService | null;
  isOpen: boolean;
  onClose: () => void;
  changes?: ChangeRecord[];
  incidents?: IncidentRecord[];
}

export const ServiceDrawer: React.FC<ServiceDrawerProps> = ({
  service,
  isOpen,
  onClose,
  changes = [],
  incidents = []
}) => {
  const navigate = useNavigate();

  if (!isOpen || !service) return null;

  const serviceChanges = changes.filter((c) => c.serviceId === service.id);
  const serviceIncidents = incidents.filter((i) => 
    i.affectedServices?.toLowerCase().includes(service.name.toLowerCase()) || 
    (i.changeId && serviceChanges.some((c) => c.id === i.changeId))
  );

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'CRITICAL':
        return 'text-[#EF4444] bg-[#EF4444]/15 border-[#EF4444]/30';
      case 'HIGH':
        return 'text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/30';
      case 'MEDIUM':
        return 'text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/30';
      default:
        return 'text-[#22C55E] bg-[#22C55E]/15 border-[#22C55E]/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#121927] border-l border-[#263148] text-[#F5F7FA] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-[#263148] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#4F7CFF]/15 text-[#4F7CFF] border border-[#4F7CFF]/30">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-tight text-[#F5F7FA]">
                  {service.name}
                </h2>
                <span className="text-xs text-[#94A3B8] font-mono">
                  Service ID: #{service.id} · Type: {service.type}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#94A3B8] hover:text-[#F5F7FA] rounded-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Meta Strip */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#171F30] rounded-xl border border-[#263148] text-xs">
              <div>
                <span className="text-[#94A3B8] text-[10px] uppercase font-semibold block">Criticality Tier</span>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${getCriticalityColor(service.criticality)}`}>
                  {service.criticality}
                </span>
              </div>
              <div>
                <span className="text-[#94A3B8] text-[10px] uppercase font-semibold block">Running Version</span>
                <span className="mt-1 font-mono text-[#F5F7FA] font-medium block">
                  v{service.version}
                </span>
              </div>
              <div>
                <span className="text-[#94A3B8] text-[10px] uppercase font-semibold block">Operational Status</span>
                <span className="mt-1 flex items-center gap-1.5 text-[#22C55E] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  {service.status}
                </span>
              </div>
              <div>
                <span className="text-[#94A3B8] text-[10px] uppercase font-semibold block">Domain Function</span>
                <span className="mt-1 text-[#F5F7FA] font-medium">
                  Core Banking
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  navigate('/risk-analysis', { state: { serviceId: service.id } });
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#4F7CFF] text-white rounded-lg text-xs font-semibold hover:bg-[#3D68E0] transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Analyze Change</span>
              </button>
              <button
                onClick={() => {
                  navigate('/dependency-graph', { state: { selectedServiceId: service.id } });
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#171F30] text-[#F5F7FA] border border-[#263148] rounded-lg text-xs font-semibold hover:bg-[#161F30] transition-colors cursor-pointer"
              >
                <Network className="w-3.5 h-3.5 text-[#4F7CFF]" />
                <span>View Topology</span>
              </button>
            </div>

            {/* Recent Changes on this service */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                  Recent Changes ({serviceChanges.length})
                </span>
              </div>
              {serviceChanges.length === 0 ? (
                <div className="p-3 bg-[#171F30] rounded-xl border border-[#263148] text-xs text-[#94A3B8]">
                  No recent technical changes recorded for this service.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {serviceChanges.map((c) => (
                    <div 
                      key={c.id}
                      className="p-3 bg-[#171F30] rounded-xl border border-[#263148] hover:border-[#364464] transition-colors text-xs"
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-[#4F7CFF] font-semibold">CHG-#{c.id}</span>
                        <span className="text-[#94A3B8]">{c.changeType}</span>
                      </div>
                      <p className="mt-1 text-[#F5F7FA] text-xs">
                        {c.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-[#94A3B8] font-mono">
                        <span>v{c.oldVersion} → v{c.newVersion}</span>
                        <span>Complexity: {c.complexity}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Incidents involving this service */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                  Incident History ({serviceIncidents.length})
                </span>
              </div>
              {serviceIncidents.length === 0 ? (
                <div className="p-3 bg-[#171F30] rounded-xl border border-[#263148] text-xs text-[#94A3B8]">
                  No historical incidents registered for this service.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {serviceIncidents.map((i) => (
                    <div
                      key={i.id}
                      className="p-3 bg-[#171F30] rounded-xl border border-[#263148] text-xs"
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-[#EF4444] font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          INC-#{i.id} ({i.severity})
                        </span>
                        <span className="text-[#94A3B8]">{i.failure ? 'OUTAGE' : 'DEGRADED'}</span>
                      </div>
                      <p className="mt-1 text-[#F5F7FA] text-xs">
                        {i.rootCause || 'Cascading latency bottleneck under peak load.'}
                      </p>
                      <div className="mt-1 text-[11px] text-[#94A3B8]">
                        Affected: {i.affectedServices}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
