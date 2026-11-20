import React from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import { apiService } from '../services/apiService';

interface NavbarProps {
  onRefresh: () => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefresh }) => {
  const handleReset = () => {
    if (confirm('Reset database to default seed data (11 services, 13 dependencies, 10 changes, 10 incidents)?')) {
      apiService.resetSeedData();
      onRefresh();
    }
  };

  return (
    <header className="h-16 border-b border-[#263148] bg-[#0F1420] px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#4F7CFF] flex items-center justify-center text-white">
          <Shield className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-[#F5F7FA] text-base">CHANGEGUARD</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
              SIMULATED BANKING
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] hidden sm:block">
            Predictive IT Change Risk &amp; Blast-Radius Platform
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121927] border border-[#263148] text-xs text-[#94A3B8]">
          <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
          <span className="font-medium text-[#F5F7FA]">Ecosystem: 11 Services Online</span>
        </div>

        <button
          onClick={handleReset}
          title="Reset seed data to initial state"
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-[#263148] bg-[#121927] hover:bg-[#161F30] text-[#F5F7FA] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Seed</span>
        </button>
      </div>
    </header>
  );
};
