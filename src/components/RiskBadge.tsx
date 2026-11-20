import React from 'react';
import { Criticality } from '../types';

interface RiskBadgeProps {
  level: Criticality | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true
}) => {
  const norm = (level || 'LOW').toUpperCase();

  const config: Record<
    string,
    { label: string; textClass: string; bgClass: string; borderClass: string; dotClass: string }
  > = {
    CRITICAL: {
      label: 'CRITICAL',
      textClass: 'text-[#EF4444]',
      bgClass: 'bg-[#EF4444]/10',
      borderClass: 'border-[#EF4444]/25',
      dotClass: 'bg-[#EF4444]'
    },
    HIGH: {
      label: 'HIGH',
      textClass: 'text-[#F59E0B]',
      bgClass: 'bg-[#F59E0B]/10',
      borderClass: 'border-[#F59E0B]/25',
      dotClass: 'bg-[#F59E0B]'
    },
    MEDIUM: {
      label: 'MEDIUM',
      textClass: 'text-[#EAB308]',
      bgClass: 'bg-[#EAB308]/10',
      borderClass: 'border-[#EAB308]/25',
      dotClass: 'bg-[#EAB308]'
    },
    LOW: {
      label: 'LOW',
      textClass: 'text-[#22C55E]',
      bgClass: 'bg-[#22C55E]/10',
      borderClass: 'border-[#22C55E]/25',
      dotClass: 'bg-[#22C55E]'
    }
  };

  const style = config[norm] || config.LOW;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
    lg: 'text-sm px-3 py-1 gap-2 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-md border ${style.bgClass} ${style.borderClass} ${style.textClass} ${sizeClasses[size]}`}
    >
      {showIcon && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dotClass}`} />
      )}
      <span>{style.label}</span>
    </span>
  );
};
