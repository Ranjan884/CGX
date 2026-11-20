import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  onClick
}) => {
  const badgeClasses = {
    neutral: 'text-[#94A3B8] bg-[#171F30] border border-[#263148]',
    success: 'text-[#22C55E] bg-[#22C55E]/15 border border-[#22C55E]/30',
    warning: 'text-[#F59E0B] bg-[#F59E0B]/15 border border-[#F59E0B]/30',
    danger: 'text-[#EF4444] bg-[#EF4444]/15 border border-[#EF4444]/30',
    info: 'text-[#4F7CFF] bg-[#4F7CFF]/15 border border-[#4F7CFF]/30'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-[#121927] border border-[#263148] rounded-xl p-4 transition-colors ${
        onClick ? 'cursor-pointer hover:border-[#364464] hover:bg-[#161F30]' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3 text-[#94A3B8] text-[11px] font-semibold uppercase tracking-wider">
        <span className="truncate">{title}</span>
        {Icon && <Icon className="w-4 h-4 shrink-0 text-[#94A3B8]" />}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight text-[#F5F7FA] tabular-nums">
          {value}
        </div>
        {badge && (
          <span
            className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded ${
              badgeClasses[badge.variant || 'neutral']
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="text-xs text-[#94A3B8] mt-1 truncate">
          {subtitle}
        </div>
      )}
    </div>
  );
};
