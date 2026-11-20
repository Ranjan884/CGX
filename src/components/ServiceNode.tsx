import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Criticality } from '../types';

interface ServiceNodeData {
  id: number;
  name: string;
  type: string;
  criticality: Criticality;
  version: string;
  status: string;
  isAffected?: boolean;
  isSource?: boolean;
  isMuted?: boolean;
}

export const ServiceNode = memo(({ data }: { data: ServiceNodeData }) => {
  const getCriticalityDot = (crit: Criticality) => {
    switch (crit) {
      case 'CRITICAL':
        return 'bg-rose-500';
      case 'HIGH':
        return 'bg-amber-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      default:
        return 'bg-emerald-500';
    }
  };

  let containerStyle = 'bg-[#121927] border border-[#263148] hover:border-[#4F7CFF]/50 text-[#F5F7FA]';
  if (data.isSource) {
    // Selected service gets a prominent clear outline and solid elevation
    containerStyle = 'bg-[#171F30] border-2 border-[#4F7CFF] ring-2 ring-[#4F7CFF]/20 text-[#F5F7FA] shadow-lg';
  } else if (data.isAffected) {
    // Affected nodes highlight with clear border & badge
    containerStyle = 'bg-[#171F30] border border-[#EF4444] ring-1 ring-[#EF4444]/20 text-[#F5F7FA] shadow-md';
  } else if (data.isMuted) {
    // Unaffected nodes become muted
    containerStyle = 'bg-[#121927]/60 border border-[#263148]/60 text-[#94A3B8] opacity-60 hover:opacity-100 transition-opacity';
  }

  return (
    <div className={`px-3 py-2 rounded-lg text-xs w-48 transition-all duration-200 font-sans ${containerStyle}`}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-1.5 !h-1.5 !bg-[#94A3B8] !border-none" 
      />

      {/* Top Node Header */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getCriticalityDot(data.criticality)}`} />
          <span className={`font-semibold text-xs truncate ${data.isMuted ? 'text-[#94A3B8]' : 'text-[#F5F7FA]'}`}>
            {data.name}
          </span>
        </div>

        {data.isSource && (
          <span className="text-[9px] font-mono font-bold text-[#4F7CFF] px-1 py-0.5 bg-[#4F7CFF]/15 rounded shrink-0 border border-[#4F7CFF]/30">
            ROOT
          </span>
        )}
        {data.isAffected && !data.isSource && (
          <span className="text-[9px] font-mono font-bold text-[#EF4444] px-1 py-0.5 bg-[#EF4444]/15 rounded shrink-0 border border-[#EF4444]/30">
            AFFECTED
          </span>
        )}
      </div>

      {/* Node Meta Details */}
      <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-[#263148]">
        <span className={data.isMuted ? 'text-[#94A3B8]' : 'text-[#CBD5E1]'}>{data.type}</span>
        <span className={data.isMuted ? 'text-[#94A3B8]' : 'text-[#CBD5E1]'}>v{data.version}</span>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-1.5 !h-1.5 !bg-[#94A3B8] !border-none" 
      />
    </div>
  );
});
ServiceNode.displayName = 'ServiceNode';
