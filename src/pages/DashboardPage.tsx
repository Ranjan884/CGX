import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Share2, 
  LayoutGrid, 
  Landmark, 
  Wrench, 
  Timer, 
  Search, 
  Cpu, 
  ChevronRight, 
  Calendar, 
  ArrowUpDown, 
  Shield, 
  CreditCard, 
  Bell, 
  User, 
  Server
} from 'lucide-react';
import { servicesApi } from '../api/servicesApi';
import { changesApi } from '../api/changesApi';
import { incidentApi } from '../api/incidentApi';
import { BankingService, ChangeRecord, IncidentRecord } from '../types';
import { ServiceDrawer } from '../components/ServiceDrawer';
import { ChangeDrawer } from '../components/ChangeDrawer';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<BankingService[]>([]);
  const [changes, setChanges] = useState<ChangeRecord[]>([]);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);

  // Timeframe selector for trend chart
  const [trendTimeframe, setTrendTimeframe] = useState<'7D' | '30D' | '90D'>('30D');

  // Search & Filter state for Recent Change Activity
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('All Services');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('All Risk Levels');
  const [currentPage, setCurrentPage] = useState(1);

  // Drawers
  const [selectedService, setSelectedService] = useState<BankingService | null>(null);
  const [selectedChange, setSelectedChange] = useState<ChangeRecord | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [svcRes, chgRes, incRes] = await Promise.all([
          servicesApi.getServices(),
          changesApi.getChanges(),
          incidentApi.getIncidents()
        ]);
        setServices(svcRes);
        setChanges(chgRes);
        setIncidents(incRes);
      } catch (err) {
        console.error('Error fetching dashboard live data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const changeActivityList = [
    {
      id: 'CHG-1042',
      serviceId: 5,
      service: 'Payment Service',
      changeType: 'Version Update',
      complexity: 'High',
      complexityColor: 'text-[#F59E0B]',
      risk: 82,
      riskColor: 'text-[#EF4444]',
      blastRadius: 74,
      mlRisk: '78%',
      status: 'Needs Review',
      statusStyle: 'border-[#EF4444]/30 bg-[#EF4444]/15 text-[#EF4444]',
      time: '12m ago'
    },
    {
      id: 'CHG-1041',
      serviceId: 7,
      service: 'Core Banking',
      changeType: 'Config Change',
      complexity: 'Medium',
      complexityColor: 'text-[#F59E0B]',
      risk: 76,
      riskColor: 'text-[#EF4444]',
      blastRadius: 68,
      mlRisk: '71%',
      status: 'Needs Review',
      statusStyle: 'border-[#EF4444]/30 bg-[#EF4444]/15 text-[#EF4444]',
      time: '1h ago'
    },
    {
      id: 'CHG-1040',
      serviceId: 6,
      service: 'Fraud Detection',
      changeType: 'API Change',
      complexity: 'High',
      complexityColor: 'text-[#F59E0B]',
      risk: 65,
      riskColor: 'text-[#F59E0B]',
      blastRadius: 52,
      mlRisk: '58%',
      status: 'Analyzed',
      statusStyle: 'border-[#263148] bg-[#171F30] text-[#94A3B8]',
      time: '3h ago'
    },
    {
      id: 'CHG-1039',
      serviceId: 9,
      service: 'Notification Service',
      changeType: 'Version Update',
      complexity: 'Low',
      complexityColor: 'text-[#22C55E]',
      risk: 34,
      riskColor: 'text-[#22C55E]',
      blastRadius: 28,
      mlRisk: '22%',
      status: 'Completed',
      statusStyle: 'border-[#22C55E]/30 bg-[#22C55E]/15 text-[#22C55E]',
      time: '8h ago'
    },
    {
      id: 'CHG-1038',
      serviceId: 4,
      service: 'Account Service',
      changeType: 'Config Change',
      complexity: 'Medium',
      complexityColor: 'text-[#F59E0B]',
      risk: 49,
      riskColor: 'text-[#F59E0B]',
      blastRadius: 36,
      mlRisk: '41%',
      status: 'Analyzed',
      statusStyle: 'border-[#263148] bg-[#171F30] text-[#94A3B8]',
      time: '12h ago'
    }
  ];

  const filteredChanges = useMemo(() => {
    return changeActivityList.filter((item) => {
      if (selectedServiceFilter !== 'All Services' && item.service !== selectedServiceFilter) return false;
      if (selectedRiskFilter !== 'All Risk Levels') {
        if (selectedRiskFilter === 'High' && item.risk < 70) return false;
        if (selectedRiskFilter === 'Medium' && (item.risk < 40 || item.risk >= 70)) return false;
        if (selectedRiskFilter === 'Low' && item.risk >= 40) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.id.toLowerCase().includes(q) ||
          item.service.toLowerCase().includes(q) ||
          item.changeType.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [changeActivityList, selectedServiceFilter, selectedRiskFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-[#94A3B8] font-medium mb-1">
            Overview
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F7FA]">
            Change Operations
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 max-w-3xl">
            Real-time change risk, dependency exposure, cascading blast radius, and operational health.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          <button
            onClick={() => navigate('/submit-change')}
            className="flex items-center gap-2 px-4 py-2 bg-[#4F7CFF] hover:bg-[#3D68E0] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Propose a Change</span>
          </button>

          <button
            onClick={() => navigate('/dependency-graph')}
            className="flex items-center gap-2 px-3.5 py-2 bg-transparent hover:bg-[#161F30] text-[#F5F7FA] border border-[#263148] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-[#94A3B8]" />
            <span>View Topology</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Card 1: TOTAL SERVICES */}
        <div className="bg-[#121927] border border-[#263148] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              TOTAL SERVICES
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#171F30] text-[#22C55E] border border-[#263148] flex items-center justify-center">
              <LayoutGrid className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-[#F5F7FA] leading-none tabular-nums">
              {services.length || 11}
            </div>
            <div className="text-xs font-medium text-[#22C55E] mt-2 flex items-center gap-1">
              <span className="text-[11px]">↑</span> +1 this week
            </div>
          </div>
        </div>

        {/* Card 2: CRITICAL SERVICES */}
        <div className="bg-[#121927] border border-[#263148] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              CRITICAL SERVICES
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#171F30] text-[#EF4444] border border-[#263148] flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-[#F5F7FA] leading-none tabular-nums">
              5
            </div>
            <div className="text-xs text-[#94A3B8] mt-2">
              Tier-1 core
            </div>
          </div>
        </div>

        {/* Card 3: HIGH-RISK CHANGES */}
        <div className="bg-[#121927] border border-[#263148] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              HIGH-RISK CHANGES
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#171F30] text-[#F59E0B] border border-[#263148] flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-[#F5F7FA] leading-none tabular-nums">
              6
            </div>
            <div className="text-xs font-medium text-[#F59E0B] mt-2 flex items-center gap-1">
              <span className="text-[11px]">↑</span> Requires review
            </div>
          </div>
        </div>

        {/* Card 4: HISTORICAL INCIDENTS */}
        <div className="bg-[#121927] border border-[#263148] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              RECENT INCIDENTS
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#171F30] text-[#EF4444] border border-[#263148] flex items-center justify-center">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-[#F5F7FA] leading-none tabular-nums">
              {incidents.length || 10}
            </div>
            <div className="text-xs text-[#94A3B8] mt-2">
              Correlated releases
            </div>
          </div>
        </div>

        {/* Card 5: AVG. BLAST RADIUS */}
        <div className="bg-[#121927] border border-[#263148] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              AVG. BLAST RADIUS
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#171F30] text-[#4F7CFF] border border-[#263148] flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-[#F5F7FA] leading-none tabular-nums">
              68.5
            </div>
            <div className="text-xs font-medium text-[#22C55E] mt-2 flex items-center gap-1">
              <span className="text-[11px]">↓</span> -6.2%
            </div>
          </div>
        </div>

        {/* Card 6: ML MODEL */}
        <div className="bg-[#121927] border border-[#263148] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              ML MODEL
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#171F30] text-[#4F7CFF] border border-[#263148] flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base font-bold text-[#F5F7FA] leading-tight">
              Random Forest
            </div>
            <div className="text-xs font-mono text-[#94A3B8] mt-2">
              v2.0.0 (FastAPI)
            </div>
          </div>
        </div>

      </div>

      {/* 3. Second Row: Trend (6 cols), Risk Distribution (3 cols), Risk Summary (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Panel 1: Change Risk Trend */}
        <div className="lg:col-span-6 bg-[#121927] border border-[#263148] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#F5F7FA]">
                Change Risk Trend
              </h2>
              {/* Timeframe pills */}
              <div className="flex items-center bg-[#0B0F17] p-0.5 rounded-lg border border-[#263148] text-xs">
                {(['7D', '30D', '90D'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTrendTimeframe(t)}
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      trendTimeframe === t
                        ? 'bg-[#4F7CFF] text-white'
                        : 'text-[#94A3B8] hover:text-[#F5F7FA]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend row */}
            <div className="flex items-center gap-5 mt-2 text-[11px] text-[#94A3B8]">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 bg-[#4F7CFF] rounded-full" />
                <span>Average Risk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 bg-[#F59E0B] rounded-full" />
                <span>High Risk Changes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 bg-[#EF4444] rounded-full" />
                <span>Critical Changes</span>
              </div>
            </div>
          </div>

          {/* Precision SVG Line Graph */}
          <div className="mt-4 pt-2">
            <div className="relative h-44 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
                {/* Horizontal Grid lines */}
                {[0, 40, 80, 120, 160].map((y, i) => (
                  <line 
                    key={i} 
                    x1="30" 
                    y1={y} 
                    x2="495" 
                    y2={y} 
                    stroke="#263148" 
                    strokeWidth="1" 
                  />
                ))}

                {/* Y Axis text */}
                <text x="5" y="160" fontSize="10" fill="#94A3B8" fontFamily="sans-serif">0</text>
                <text x="5" y="123" fontSize="10" fill="#94A3B8" fontFamily="sans-serif">25</text>
                <text x="5" y="83" fontSize="10" fill="#94A3B8" fontFamily="sans-serif">50</text>
                <text x="5" y="43" fontSize="10" fill="#94A3B8" fontFamily="sans-serif">75</text>
                <text x="0" y="8" fontSize="10" fill="#94A3B8" fontFamily="sans-serif">100</text>

                {/* Line 1: Average Risk (Blue) */}
                <path
                  d="M 35 68 C 65 67, 85 75, 115 72 C 145 69, 165 52, 195 64 C 225 76, 245 54, 275 52 C 305 50, 325 60, 355 42 C 385 24, 405 45, 435 48 C 455 50, 475 42, 495 32"
                  fill="none"
                  stroke="#4F7CFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Line 2: High Risk Changes (Amber) */}
                <path
                  d="M 35 125 C 65 124, 85 118, 115 119 C 145 120, 165 110, 195 112 C 225 114, 245 106, 275 108 C 305 110, 325 102, 355 106 C 385 110, 405 114, 435 112 C 455 110, 475 105, 495 98"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Line 3: Critical Changes (Red) */}
                <path
                  d="M 35 152 C 65 152, 85 150, 115 151 C 145 152, 165 146, 195 147 C 225 148, 245 146, 275 145 C 305 144, 325 142, 355 144 C 385 146, 405 146, 435 148 C 455 149, 475 146, 495 142"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              {/* X Axis labels */}
              <div className="flex justify-between pl-7 pr-1 text-[10px] text-[#94A3B8] mt-2 font-mono">
                <span>Sep 1</span>
                <span>Sep 5</span>
                <span>Sep 10</span>
                <span>Sep 15</span>
                <span>Sep 20</span>
                <span>Sep 25</span>
                <span>Sep 30</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Risk Distribution */}
        <div className="lg:col-span-3 bg-[#121927] border border-[#263148] rounded-xl p-5 flex flex-col justify-between">
          <h2 className="text-sm font-semibold text-[#F5F7FA]">
            Risk Distribution
          </h2>

          <div className="flex items-center justify-between gap-2 my-auto py-2">
            <div className="relative w-32 h-32 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#171F30" strokeWidth="12" />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="12"
                  strokeDasharray="91 239"
                  strokeDashoffset="0"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="12"
                  strokeDasharray="68.3 239"
                  strokeDashoffset="-91"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="12"
                  strokeDasharray="56.8 239"
                  strokeDashoffset="-159.3"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="12"
                  strokeDasharray="22.7 239"
                  strokeDashoffset="-216.1"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-[#94A3B8] font-medium leading-tight">Total</span>
                <span className="text-xl font-bold text-[#F5F7FA] leading-tight tabular-nums">21</span>
                <span className="text-[10px] text-[#94A3B8] font-medium leading-tight">Changes</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shrink-0" />
                <span className="text-[#94A3B8] text-xs">Low</span>
                <span className="text-[#CBD5E1] text-[11px] font-medium ml-auto">8 (38%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
                <span className="text-[#94A3B8] text-xs">Medium</span>
                <span className="text-[#CBD5E1] text-[11px] font-medium ml-auto">6 (29%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] shrink-0" />
                <span className="text-[#94A3B8] text-xs">High</span>
                <span className="text-[#CBD5E1] text-[11px] font-medium ml-auto">5 (24%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0" />
                <span className="text-[#94A3B8] text-xs">Critical</span>
                <span className="text-[#CBD5E1] text-[11px] font-medium ml-auto">2 (9%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: System Risk Summary */}
        <div className="lg:col-span-3 bg-[#121927] border border-[#263148] rounded-xl p-5 flex flex-col justify-between">
          <h2 className="text-sm font-semibold text-[#F5F7FA]">
            System Risk Summary
          </h2>

          <div className="flex items-center gap-4 py-1">
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#171F30"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="3.5"
                  strokeDasharray="72, 100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
              </div>
            </div>

            <div>
              <span className="text-xs text-[#94A3B8] font-medium block">Overall Risk</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-[#F5F7FA] tabular-nums">72</span>
                <span className="text-xs text-[#94A3B8]">/ 100</span>
              </div>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#EF4444]/30 bg-[#EF4444]/15 text-[#EF4444]">
                HIGH RISK
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-3 border-t border-[#263148]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <span className="text-[#94A3B8]">Affected Services</span>
              </div>
              <span className="font-semibold text-[#F5F7FA] tabular-nums">7</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <span className="text-[#94A3B8]">Critical Services</span>
              </div>
              <span className="font-semibold text-[#F5F7FA] tabular-nums">3</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4F7CFF]" />
                <span className="text-[#94A3B8]">Max Dependency Depth</span>
              </div>
              <span className="font-semibold text-[#F5F7FA] tabular-nums">4</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4F7CFF]" />
                <span className="text-[#94A3B8]">Largest Blast Radius</span>
              </div>
              <span className="font-semibold text-[#F5F7FA] tabular-nums">74</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Third Row: Risk Exposure, Topology Preview, System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Panel 1: Risk Exposure by Service */}
        <div className="lg:col-span-4 bg-[#121927] border border-[#263148] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#263148]">
              <h2 className="text-sm font-semibold text-[#F5F7FA]">
                Risk Exposure by Service
              </h2>
              <button
                onClick={() => navigate('/services')}
                className="text-xs text-[#4F7CFF] hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>View all</span>
                <span>→</span>
              </button>
            </div>

            <div className="grid grid-cols-12 text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider py-2.5">
              <div className="col-span-5">SERVICE</div>
              <div className="col-span-3">CRITICALITY</div>
              <div className="col-span-4 text-right">RISK SCORE</div>
            </div>

            <div className="space-y-3.5 pt-1 text-xs">
              <div className="grid grid-cols-12 items-center">
                <div className="col-span-5 flex items-center gap-2 min-w-0">
                  <Landmark className="w-4 h-4 text-[#94A3B8] shrink-0" />
                  <span className="font-medium text-[#F5F7FA] truncate">Core Banking</span>
                </div>
                <div className="col-span-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                  <span className="text-[#EF4444] font-medium text-[11px]">Critical</span>
                </div>
                <div className="col-span-4 flex items-center gap-2 justify-end">
                  <div className="w-16 bg-[#171F30] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#EF4444] h-full rounded-full" style={{ width: '92%' }} />
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#F5F7FA] w-5 text-right">92</span>
                </div>
              </div>

              <div className="grid grid-cols-12 items-center">
                <div className="col-span-5 flex items-center gap-2 min-w-0">
                  <CreditCard className="w-4 h-4 text-[#94A3B8] shrink-0" />
                  <span className="font-medium text-[#F5F7FA] truncate">Payment Service</span>
                </div>
                <div className="col-span-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                  <span className="text-[#EF4444] font-medium text-[11px]">Critical</span>
                </div>
                <div className="col-span-4 flex items-center gap-2 justify-end">
                  <div className="w-16 bg-[#171F30] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#F97316] h-full rounded-full" style={{ width: '78%' }} />
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#F5F7FA] w-5 text-right">78</span>
                </div>
              </div>

              <div className="grid grid-cols-12 items-center">
                <div className="col-span-5 flex items-center gap-2 min-w-0">
                  <Shield className="w-4 h-4 text-[#94A3B8] shrink-0" />
                  <span className="font-medium text-[#F5F7FA] truncate">Fraud Detection</span>
                </div>
                <div className="col-span-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                  <span className="text-[#F59E0B] font-medium text-[11px]">High</span>
                </div>
                <div className="col-span-4 flex items-center gap-2 justify-end">
                  <div className="w-16 bg-[#171F30] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#F59E0B] h-full rounded-full" style={{ width: '66%' }} />
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#F5F7FA] w-5 text-right">66</span>
                </div>
              </div>

              <div className="grid grid-cols-12 items-center">
                <div className="col-span-5 flex items-center gap-2 min-w-0">
                  <User className="w-4 h-4 text-[#94A3B8] shrink-0" />
                  <span className="font-medium text-[#F5F7FA] truncate">Account Service</span>
                </div>
                <div className="col-span-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                  <span className="text-[#F59E0B] font-medium text-[11px]">High</span>
                </div>
                <div className="col-span-4 flex items-center gap-2 justify-end">
                  <div className="w-16 bg-[#171F30] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#F59E0B] h-full rounded-full" style={{ width: '54%' }} />
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#F5F7FA] w-5 text-right">54</span>
                </div>
              </div>

              <div className="grid grid-cols-12 items-center">
                <div className="col-span-5 flex items-center gap-2 min-w-0">
                  <Bell className="w-4 h-4 text-[#94A3B8] shrink-0" />
                  <span className="font-medium text-[#F5F7FA] truncate">Notification Service</span>
                </div>
                <div className="col-span-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  <span className="text-[#22C55E] font-medium text-[11px]">Medium</span>
                </div>
                <div className="col-span-4 flex items-center gap-2 justify-end">
                  <div className="w-16 bg-[#171F30] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#22C55E] h-full rounded-full" style={{ width: '38%' }} />
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#F5F7FA] w-5 text-right">38</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Dependency Health */}
        <div className="lg:col-span-4 bg-[#121927] border border-[#263148] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#F5F7FA] pb-3 border-b border-[#263148]">
              Dependency Topology
            </h2>

            <div className="grid grid-cols-3 gap-2 py-3 border-b border-[#263148] text-xs">
              <div>
                <span className="text-[10px] text-[#94A3B8] block font-medium">Critical Nodes</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-bold text-[#F5F7FA] tabular-nums">5</span>
                  <span className="text-[10px] text-[#22C55E] font-medium">Verified</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-[#94A3B8] block font-medium">Downstream Impact</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-bold text-[#F5F7FA] tabular-nums">7</span>
                  <span className="text-[10px] text-[#F59E0B] font-medium">Active</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-[#94A3B8] block font-medium">Max Depth</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-bold text-[#F5F7FA] tabular-nums">4</span>
                  <span className="text-[10px] text-[#94A3B8]">Hops</span>
                </div>
              </div>
            </div>

            {/* Mini Topology Graph Canvas */}
            <div className="relative h-44 w-full bg-[#0B0F17] rounded-lg border border-[#263148] mt-3 overflow-hidden p-2 flex flex-col justify-between">
              <svg className="w-full h-full absolute inset-0" viewBox="0 0 320 160">
                <line x1="160" y1="34" x2="160" y2="60" stroke="#263148" strokeWidth="1.5" />
                <line x1="135" y1="78" x2="80" y2="105" stroke="#EF4444" strokeWidth="1.5" />
                <line x1="185" y1="78" x2="235" y2="105" stroke="#EF4444" strokeWidth="1.5" />
                <line x1="160" y1="84" x2="160" y2="120" stroke="#263148" strokeWidth="1.5" />
              </svg>

              {/* Node 1: API Gateway */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#121927] border border-[#263148] text-[10px] font-medium text-[#F5F7FA] flex items-center gap-1.5 z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F7CFF]" />
                <span>API Gateway</span>
              </div>

              {/* Node 2: Payment Service */}
              <div className="absolute top-14 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#121927] border border-[#EF4444] text-[11px] font-bold text-[#F5F7FA] flex items-center gap-1.5 z-10 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
                <span>Payment Service</span>
              </div>

              {/* Node 3: Fraud Detection */}
              <div className="absolute bottom-9 left-2 px-2 py-0.5 rounded-full bg-[#121927] border border-[#263148] text-[10px] font-medium text-[#F5F7FA] flex items-center gap-1 z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F7CFF]" />
                <span>Fraud Detection</span>
              </div>

              {/* Node 4: Core Banking */}
              <div className="absolute bottom-9 right-3 px-2 py-0.5 rounded-full bg-[#121927] border border-[#EF4444]/40 text-[10px] font-medium text-[#F5F7FA] flex items-center gap-1 z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                <span>Core Banking</span>
              </div>

              {/* Node 5: Transaction DB */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#121927] border border-[#263148] text-[10px] font-medium text-[#F5F7FA] flex items-center gap-1 z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F7CFF]" />
                <span>Transaction DB</span>
              </div>

              <div className="absolute bottom-2 right-2 z-20">
                <button
                  onClick={() => navigate('/dependency-graph')}
                  className="px-2.5 py-1 bg-[#171F30] hover:bg-[#161F30] text-[#F5F7FA] border border-[#263148] rounded text-[10px] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Graph</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: System Health */}
        <div className="lg:col-span-4 bg-[#121927] border border-[#263148] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#F5F7FA] pb-3 border-b border-[#263148]">
              System Health
            </h2>

            <div className="space-y-4 pt-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                  <span className="font-semibold text-[#F5F7FA]">Backend Engine</span>
                </div>
                <span className="text-[#94A3B8] font-medium">Operational</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                  <span className="font-semibold text-[#F5F7FA]">Database (PostgreSQL)</span>
                </div>
                <span className="text-[#94A3B8] font-medium">Connected</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                  <span className="font-semibold text-[#F5F7FA]">ML Service (FastAPI)</span>
                </div>
                <span className="text-[#94A3B8] font-medium">Available</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                  <span className="font-semibold text-[#F5F7FA]">Active Model</span>
                </div>
                <span className="text-[#94A3B8] font-medium font-mono text-[11px]">Random Forest v2.0</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                  <span className="font-semibold text-[#F5F7FA]">API Gateway</span>
                </div>
                <span className="text-[#94A3B8] font-medium">Healthy</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Fourth Row: Recent Change Activity & Attention Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Panel 1: Recent Change Activity (8 cols) */}
        <div className="lg:col-span-8 bg-[#121927] border border-[#263148] rounded-xl p-5 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-[#F5F7FA] shrink-0">
              Recent Change Activity
            </h2>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search changes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-2.5 py-1 bg-[#0B0F17] border border-[#263148] rounded-lg text-xs text-[#F5F7FA] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#4F7CFF] w-36"
                />
              </div>

              <select
                value={selectedServiceFilter}
                onChange={(e) => setSelectedServiceFilter(e.target.value)}
                className="px-2 py-1 bg-[#0B0F17] border border-[#263148] rounded-lg text-[#94A3B8] text-xs focus:outline-hidden"
              >
                <option>All Services</option>
                <option>Payment Service</option>
                <option>Core Banking</option>
                <option>Fraud Detection</option>
                <option>Notification Service</option>
                <option>Account Service</option>
              </select>

              <select
                value={selectedRiskFilter}
                onChange={(e) => setSelectedRiskFilter(e.target.value)}
                className="px-2 py-1 bg-[#0B0F17] border border-[#263148] rounded-lg text-[#94A3B8] text-xs focus:outline-hidden"
              >
                <option>All Risk Levels</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#263148]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#171F30] text-[#94A3B8] font-semibold text-[10px] uppercase tracking-wider border-b border-[#263148]">
                <tr>
                  <th className="py-2.5 px-3">CHANGE ID</th>
                  <th className="py-2.5 px-3">SERVICE</th>
                  <th className="py-2.5 px-3">CHANGE TYPE</th>
                  <th className="py-2.5 px-3">COMPLEXITY</th>
                  <th className="py-2.5 px-2">RISK</th>
                  <th className="py-2.5 px-2">BLAST RADIUS</th>
                  <th className="py-2.5 px-2">ML RISK</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3">TIME</th>
                  <th className="py-2.5 px-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#263148] text-[#F5F7FA]">
                {filteredChanges.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => {
                      const matched = changes.find((c) => String(c.id) === row.id.replace('CHG-', ''));
                      if (matched) setSelectedChange(matched);
                    }}
                    className="hover:bg-[#161F30] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-mono font-medium text-[#4F7CFF]">
                      {row.id}
                    </td>
                    <td className="py-3 px-3 font-medium text-[#F5F7FA]">
                      {row.service}
                    </td>
                    <td className="py-3 px-3 text-[#94A3B8]">
                      {row.changeType}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${row.complexityColor === 'text-[#F59E0B]' ? 'bg-[#F59E0B]' : 'bg-[#22C55E]'}`} />
                        <span>{row.complexity}</span>
                      </div>
                    </td>
                    <td className={`py-3 px-2 font-bold tabular-nums ${row.riskColor}`}>
                      {row.risk}
                    </td>
                    <td className="py-3 px-2 font-medium text-[#94A3B8] tabular-nums">
                      {row.blastRadius}
                    </td>
                    <td className="py-3 px-2 font-medium text-[#94A3B8] tabular-nums">
                      {row.mlRisk}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${row.statusStyle}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#94A3B8] text-[11px]">
                      {row.time}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F5F7FA] transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-1 pt-1 text-xs">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className="w-7 h-7 flex items-center justify-center rounded text-[#94A3B8] hover:bg-[#171F30] cursor-pointer"
            >
              &lt;
            </button>
            {[1, 2, 3, 4, 5].map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 flex items-center justify-center rounded font-medium cursor-pointer ${
                  currentPage === p
                    ? 'bg-[#4F7CFF] text-white font-bold'
                    : 'text-[#94A3B8] hover:bg-[#171F30]'
                }`}
              >
                {p}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(Math.min(5, currentPage + 1))}
              className="w-7 h-7 flex items-center justify-center rounded text-[#94A3B8] hover:bg-[#171F30] cursor-pointer"
            >
              &gt;
            </button>
          </div>
        </div>

        {/* Panel 2: Changes Requiring Attention */}
        <div className="lg:col-span-4 bg-[#121927] border border-[#263148] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#263148]">
            <h2 className="text-sm font-semibold text-[#F5F7FA]">
              Changes Requiring Attention
            </h2>
            <button
              onClick={() => navigate('/changes')}
              className="text-xs text-[#4F7CFF] hover:underline font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <span>→</span>
            </button>
          </div>

          <div className="grid grid-cols-12 text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider py-1">
            <div className="col-span-6">SERVICE</div>
            <div className="col-span-4">CHANGE</div>
            <div className="col-span-2 text-right">RISK</div>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            {/* Item 1: Payment Service */}
            <div 
              onClick={() => navigate('/risk-analysis', { state: { serviceId: 5 } })}
              className="grid grid-cols-12 items-center p-2 rounded-lg hover:bg-[#161F30] transition-colors cursor-pointer group"
            >
              <div className="col-span-6 flex items-center gap-2 min-w-0">
                <CreditCard className="w-4 h-4 text-[#94A3B8] shrink-0" />
                <span className="font-semibold text-[#F5F7FA] truncate">Payment Service</span>
              </div>
              <div className="col-span-4 font-mono text-[11px] text-[#94A3B8] truncate">
                v2.0 → v3.0
              </div>
              <div className="col-span-2 flex items-center justify-end gap-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#EF4444]/30 bg-[#EF4444]/15 text-[#EF4444]">
                  HIGH
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#F5F7FA]" />
              </div>
            </div>

            {/* Item 2: Core Banking */}
            <div 
              onClick={() => navigate('/risk-analysis', { state: { serviceId: 7 } })}
              className="grid grid-cols-12 items-center p-2 rounded-lg hover:bg-[#161F30] transition-colors cursor-pointer group"
            >
              <div className="col-span-6 flex items-center gap-2 min-w-0">
                <Landmark className="w-4 h-4 text-[#94A3B8] shrink-0" />
                <span className="font-semibold text-[#F5F7FA] truncate">Core Banking</span>
              </div>
              <div className="col-span-4 text-[11px] text-[#94A3B8] truncate">
                Config Update
              </div>
              <div className="col-span-2 flex items-center justify-end gap-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#EF4444]/30 bg-[#EF4444]/15 text-[#EF4444]">
                  HIGH
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#F5F7FA]" />
              </div>
            </div>

            {/* Item 3: Fraud Detection */}
            <div 
              onClick={() => navigate('/risk-analysis', { state: { serviceId: 6 } })}
              className="grid grid-cols-12 items-center p-2 rounded-lg hover:bg-[#161F30] transition-colors cursor-pointer group"
            >
              <div className="col-span-6 flex items-center gap-2 min-w-0">
                <Shield className="w-4 h-4 text-[#94A3B8] shrink-0" />
                <span className="font-semibold text-[#F5F7FA] truncate">Fraud Detection</span>
              </div>
              <div className="col-span-4 font-mono text-[11px] text-[#94A3B8] truncate">
                v4.1 → v5.0
              </div>
              <div className="col-span-2 flex items-center justify-end gap-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#EF4444]/30 bg-[#EF4444]/15 text-[#EF4444]">
                  HIGH
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#F5F7FA]" />
              </div>
            </div>

            {/* Item 4: API Gateway */}
            <div 
              onClick={() => navigate('/risk-analysis', { state: { serviceId: 2 } })}
              className="grid grid-cols-12 items-center p-2 rounded-lg hover:bg-[#161F30] transition-colors cursor-pointer group"
            >
              <div className="col-span-6 flex items-center gap-2 min-w-0">
                <Server className="w-4 h-4 text-[#94A3B8] shrink-0" />
                <span className="font-semibold text-[#F5F7FA] truncate">API Gateway</span>
              </div>
              <div className="col-span-4 text-[11px] text-[#94A3B8] truncate">
                Version Update
              </div>
              <div className="col-span-2 flex items-center justify-end gap-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#F59E0B]/30 bg-[#F59E0B]/15 text-[#F59E0B]">
                  MEDIUM
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#F5F7FA]" />
              </div>
            </div>

            {/* Item 5: Account Service */}
            <div 
              onClick={() => navigate('/risk-analysis', { state: { serviceId: 4 } })}
              className="grid grid-cols-12 items-center p-2 rounded-lg hover:bg-[#161F30] transition-colors cursor-pointer group"
            >
              <div className="col-span-6 flex items-center gap-2 min-w-0">
                <User className="w-4 h-4 text-[#94A3B8] shrink-0" />
                <span className="font-semibold text-[#F5F7FA] truncate">Account Service</span>
              </div>
              <div className="col-span-4 text-[11px] text-[#94A3B8] truncate">
                Schema Change
              </div>
              <div className="col-span-2 flex items-center justify-end gap-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#F59E0B]/30 bg-[#F59E0B]/15 text-[#F59E0B]">
                  MEDIUM
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#F5F7FA]" />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Slide-over Drawers */}
      <ServiceDrawer
        service={selectedService}
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        changes={changes}
        incidents={incidents}
      />

      <ChangeDrawer
        change={selectedChange}
        service={services.find((s) => s.id === selectedChange?.serviceId)}
        isOpen={!!selectedChange}
        onClose={() => setSelectedChange(null)}
      />
    </div>
  );
};
