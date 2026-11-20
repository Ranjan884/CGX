import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  GitPullRequest, 
  ShieldAlert, 
  GitCompare, 
  Lightbulb 
} from 'lucide-react';
import { ChangeRecord, BankingService } from '../types';

interface ChangeDrawerProps {
  change: ChangeRecord | null;
  service?: BankingService;
  isOpen: boolean;
  onClose: () => void;
}

export const ChangeDrawer: React.FC<ChangeDrawerProps> = ({
  change,
  service,
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();

  if (!isOpen || !change) return null;

  const isCritical = (change.complexity >= 8 && service?.criticality === 'CRITICAL');
  const isHigh = !isCritical && (change.complexity >= 7 || service?.criticality === 'CRITICAL');
  const riskLevel = isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : change.complexity >= 4 ? 'MEDIUM' : 'LOW';

  const getRiskColor = (level: string) => {
    switch (level) {
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
                <GitPullRequest className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-tight text-[#F5F7FA]">
                  Change #{change.id}
                </h2>
                <span className="text-xs text-[#94A3B8] font-mono">
                  {service?.name || `Service ID: #${change.serviceId}`} · {change.changeType}
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
            {/* Description */}
            <div className="p-3.5 bg-[#171F30] rounded-xl border border-[#263148]">
              <span className="text-[#94A3B8] text-[10px] uppercase font-semibold block mb-1">
                Change Proposal Description
              </span>
              <p className="text-xs text-[#F5F7FA] leading-relaxed">
                {change.description}
              </p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#171F30] rounded-xl border border-[#263148]">
                <span className="text-[#94A3B8] text-[10px] uppercase font-semibold block">Estimated Risk</span>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${getRiskColor(riskLevel)}`}>
                  {riskLevel}
                </span>
              </div>

              <div className="p-3 bg-[#171F30] rounded-xl border border-[#263148]">
                <span className="text-[#94A3B8] text-[10px] uppercase font-semibold block">Complexity Score</span>
                <span className="mt-1 font-mono text-[#F5F7FA] font-medium block">
                  {change.complexity} / 10
                </span>
              </div>

              <div className="p-3 bg-[#171F30] rounded-xl border border-[#263148]">
                <span className="text-[#94A3B8] text-[10px] uppercase font-semibold block">Version Transition</span>
                <span className="mt-1 font-mono text-[#F5F7FA] font-medium block">
                  v{change.oldVersion} → v{change.newVersion}
                </span>
              </div>

              <div className="p-3 bg-[#171F30] rounded-xl border border-[#263148]">
                <span className="text-[#94A3B8] text-[10px] uppercase font-semibold block">Service Tier</span>
                <span className="mt-1 font-mono text-[#94A3B8] font-medium block">
                  {service?.criticality || 'STANDARD'}
                </span>
              </div>
            </div>

            {/* Risk Drivers */}
            <div>
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-2">
                Primary Risk Indicators
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-[#171F30] rounded-xl border border-[#263148]">
                  <span className="text-[#94A3B8]">Topology Propagation</span>
                  <span className="font-mono text-[#F5F7FA] font-semibold">
                    {riskLevel === 'CRITICAL' ? 'Critical Cascading' : 'Multi-hop Dependent'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#171F30] rounded-xl border border-[#263148]">
                  <span className="text-[#94A3B8]">Historical Failure Correlation</span>
                  <span className="font-mono text-[#F5F7FA] font-semibold">
                    {change.complexity >= 7 ? 'Elevated (ISO / DB)' : 'Low Variance'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#171F30] rounded-xl border border-[#263148]">
                  <span className="text-[#94A3B8]">Safety Rollback Preparedness</span>
                  <span className="font-mono text-[#F59E0B] font-semibold">
                    Mandatory Dual-Signoff
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  navigate('/risk-analysis', { state: { changeId: change.id } });
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4F7CFF] text-white rounded-lg text-xs font-semibold hover:bg-[#3D68E0] transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Open Multi-Factor Risk Assessment</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    navigate('/what-if', { state: { serviceId: change.serviceId, complexity: change.complexity } });
                    onClose();
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#171F30] text-[#F5F7FA] border border-[#263148] rounded-lg text-xs font-semibold hover:bg-[#161F30] transition-colors cursor-pointer"
                >
                  <GitCompare className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <span>Simulate What-If</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/recommendations', { state: { changeId: change.id } });
                    onClose();
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#171F30] text-[#F5F7FA] border border-[#263148] rounded-lg text-xs font-semibold hover:bg-[#161F30] transition-colors cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Safeguards</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
