import React from 'react';
import { RiskFactorDetail } from '../types';

interface RiskFactorCardProps {
  factors: Record<string, RiskFactorDetail>;
}

export const RiskFactorCard: React.FC<RiskFactorCardProps> = ({ factors }) => {
  const factorList = Object.entries(factors).map(([key, detail]) => ({
    key,
    ...detail
  }));

  if (factorList.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-[#263148] bg-[#121927] text-xs text-[#94A3B8] font-mono">
        No factor breakdown available.
      </div>
    );
  }

  return (
    <div className="bg-[#121927] border border-[#263148] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#263148] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#F5F7FA]">
            Deterministic Factor Breakdown
          </h3>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Normalized architectural, topological, and historical metrics with weighted contributions
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#171F30] text-[#94A3B8] font-mono text-[11px] uppercase border-b border-[#263148]">
            <tr>
              <th className="py-2.5 px-4 font-semibold">Factor Name</th>
              <th className="py-2.5 px-4 font-semibold">Raw Value</th>
              <th className="py-2.5 px-4 font-semibold">Normalized</th>
              <th className="py-2.5 px-4 font-semibold">Weight</th>
              <th className="py-2.5 px-4 font-semibold text-right">Contribution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#263148] font-mono text-xs">
            {factorList.map((item) => (
              <tr key={item.key} className="hover:bg-[#161F30] transition-colors">
                <td className="py-2.5 px-4 font-sans font-medium text-[#F5F7FA]">
                  <div>{item.factorName}</div>
                  <div className="text-[11px] font-normal text-[#94A3B8] mt-0.5">
                    {item.description}
                  </div>
                </td>
                <td className="py-2.5 px-4 text-[#CBD5E1] tabular-nums">
                  {typeof item.rawValue === 'number' ? item.rawValue : String(item.rawValue)}
                </td>
                <td className="py-2.5 px-4 text-[#CBD5E1] tabular-nums">
                  {typeof item.normalizedValue === 'number' ? item.normalizedValue.toFixed(2) : '-'}
                </td>
                <td className="py-2.5 px-4 text-[#94A3B8] tabular-nums">
                  {item.weight ? `${Math.round(item.weight * 100)}%` : '-'}
                </td>
                <td className="py-2.5 px-4 text-right font-semibold text-[#4F7CFF] tabular-nums">
                  {item.contribution ? `${Math.round(item.contribution * 100)}%` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
