import React from 'react';
import { BlastRadiusResult } from '../types';

interface BlastRadiusCardProps {
  result: BlastRadiusResult;
}

export const BlastRadiusCard: React.FC<BlastRadiusCardProps> = ({ result }) => {
  const directServices = result.directlyAffectedServices || [];
  const indirectServices = result.indirectlyAffectedServices || [];
  const criticalServices = result.criticalAffectedServices || [];
  const startName = result.startingService?.name || result.targetService || 'Selected Service';

  return (
    <div className="bg-[#121927] border border-[#263148] rounded-xl p-5 space-y-5">
      {/* Top summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-[#171F30] border border-[#263148] space-y-1">
          <div className="text-[11px] text-[#94A3B8] font-medium">Blast Radius Score</div>
          <div className="text-2xl font-bold font-mono text-[#F5F7FA]">
            {typeof result.blastRadiusScore === 'number' ? result.blastRadiusScore.toFixed(1) : '0.0'}
            <span className="text-xs text-[#94A3B8] font-normal"> / 100</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#171F30] border border-[#263148] space-y-1">
          <div className="text-[11px] text-[#94A3B8] font-medium">Total Downstream Nodes</div>
          <div className="text-2xl font-bold font-mono text-[#4F7CFF]">
            {result.totalAffectedServices ?? result.affectedCount ?? 0}
            <span className="text-xs text-[#94A3B8] font-normal font-sans"> Services</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#171F30] border border-[#263148] space-y-1">
          <div className="text-[11px] text-[#94A3B8] font-medium">Max Cascade Depth</div>
          <div className="text-2xl font-bold font-mono text-[#F5F7FA]">
            {result.maxDependencyDepth ?? 0}
            <span className="text-xs text-[#94A3B8] font-normal font-sans"> Tiers</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#171F30] border border-[#EF4444]/30 space-y-1">
          <div className="text-[11px] text-[#EF4444] font-medium">Critical Tier-1 Nodes</div>
          <div className="text-2xl font-bold font-mono text-[#EF4444]">
            {result.criticalServicesAffectedCount ?? result.criticalServicesAffected ?? criticalServices.length}
          </div>
        </div>
      </div>

      {/* Hierarchical Blast Propagation Visualizer */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
          Hierarchical Blast Propagation
        </h4>

        {/* Originating Node */}
        <div className="p-3 rounded-lg bg-[#171F30] border border-[#4F7CFF]/50 text-[#F5F7FA] flex items-center justify-between text-xs font-sans">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4F7CFF]" />
            <span className="font-semibold text-sm text-[#F5F7FA]">{startName}</span>
            <span className="text-[#94A3B8]">(Originating Change Target)</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#4F7CFF]/15 text-[#4F7CFF] border border-[#4F7CFF]/30">
            ROOT NODE (DEPTH 0)
          </span>
        </div>

        {/* Direct Dependencies */}
        {directServices.length > 0 && (
          <div className="space-y-1.5 pl-4 border-l-2 border-[#4F7CFF]/40 ml-4">
            <div className="text-[11px] text-[#94A3B8] flex items-center gap-1.5 font-sans">
              <span className="text-[#4F7CFF] font-semibold">↳ Tier 1 (Direct Impact):</span>
              <span>{directServices.length} reachable microservices</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {directServices.map((name) => (
                <span 
                  key={name} 
                  className="px-2.5 py-1 rounded-md text-xs font-mono bg-[#171F30] border border-[#263148] text-[#F5F7FA]"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Indirect Dependencies */}
        {indirectServices.length > 0 && (
          <div className="space-y-1.5 pl-4 border-l-2 border-[#EF4444]/40 ml-4">
            <div className="text-[11px] text-[#94A3B8] flex items-center gap-1.5 font-sans">
              <span className="text-[#EF4444] font-semibold">↳ Tier 2+ (Indirect Cascades):</span>
              <span>{indirectServices.length} multi-hop dependent microservices</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {indirectServices.map((name) => (
                <span 
                  key={name} 
                  className="px-2.5 py-1 rounded-md text-xs font-mono bg-[#171F30] border border-[#263148] text-[#EF4444]"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
