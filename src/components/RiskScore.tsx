import React from 'react';
import { RiskBadge } from './RiskBadge';

interface RiskScoreProps {
  score: number; // 0.0 to 1.0 or 0 to 100
  level?: string;
  size?: 'sm' | 'md' | 'lg';
  showBar?: boolean;
}

export const RiskScore: React.FC<RiskScoreProps> = ({
  score,
  level,
  size = 'md',
  showBar = true
}) => {
  const normalizedScore = score > 1 ? score / 100 : score;
  const percentage = Math.round(normalizedScore * 100);

  const determinedLevel = level || (
    percentage >= 80 ? 'CRITICAL' :
    percentage >= 60 ? 'HIGH' :
    percentage >= 30 ? 'MEDIUM' : 'LOW'
  );

  const colorMap: Record<string, { bar: string; text: string }> = {
    CRITICAL: { bar: 'bg-[#EF4444]', text: 'text-[#EF4444]' },
    HIGH: { bar: 'bg-[#F59E0B]', text: 'text-[#F59E0B]' },
    MEDIUM: { bar: 'bg-[#EAB308]', text: 'text-[#EAB308]' },
    LOW: { bar: 'bg-[#22C55E]', text: 'text-[#22C55E]' }
  };

  const colors = colorMap[determinedLevel] || colorMap.LOW;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-1.5">
          <span className={`font-mono font-bold tabular-nums text-[#F5F7FA] ${
            size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-sm' : 'text-xl'
          }`}>
            {percentage}%
          </span>
          <span className="text-[11px] font-mono text-[#687080]">
            ({normalizedScore.toFixed(2)})
          </span>
        </div>
        <RiskBadge level={determinedLevel} size={size === 'lg' ? 'md' : 'sm'} />
      </div>

      {showBar && (
        <div className="w-full bg-[#171B25] rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${colors.bar}`}
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Risk score ${percentage}%`}
          />
        </div>
      )}
    </div>
  );
};
