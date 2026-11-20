import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  Plus, 
  Trash2, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  RefreshCw 
} from 'lucide-react';
import { servicesApi } from '../api/servicesApi';
import { whatIfApi } from '../api/whatIfApi';
import { 
  BankingService, 
  ChangeType, 
  WhatIfSimulationRequest, 
  WhatIfSimulationResponse, 
  DependencyChange 
} from '../types';
import { RiskBadge } from '../components/RiskBadge';

const CHANGE_TYPES: { value: ChangeType; label: string }[] = [
  { value: 'VERSION_UPDATE', label: 'Version Update' },
  { value: 'API_CHANGE', label: 'API Contract / Interface' },
  { value: 'DATABASE_CHANGE', label: 'Database Schema Migration' },
  { value: 'CONFIG_CHANGE', label: 'Configuration & Timeouts' },
  { value: 'LIBRARY_UPDATE', label: 'Library / SDK Upgrade' },
  { value: 'INFRASTRUCTURE_CHANGE', label: 'Infrastructure & Ingress' },
  { value: 'SECURITY_CHANGE', label: 'Security & Access Policy' },
  { value: 'DEPENDENCY_CHANGE', label: 'Topology Dependency Link' }
];

interface QuickPreset {
  title: string;
  subtitle: string;
  serviceId: number;
  changeType: ChangeType;
  oldVersion: string;
  newVersion: string;
  complexity: number;
  description: string;
  dependencyChanges: DependencyChange[];
}

export const WhatIfSimulatorPage: React.FC = () => {
  const [services, setServices] = useState<BankingService[]>([]);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<number>(5); // Default Payment Service
  const [changeType, setChangeType] = useState<ChangeType>('VERSION_UPDATE');
  const [oldVersion, setOldVersion] = useState<string>('2.0.0');
  const [newVersion, setNewVersion] = useState<string>('3.0.0');
  const [complexity, setComplexity] = useState<number>(8);
  const [description, setDescription] = useState<string>(
    'Upgrade Payment Service to v3.0 with ISO 20022 real-time settlement schema'
  );

  // Topological Modifications Sandbox
  const [dependencyChanges, setDependencyChanges] = useState<DependencyChange[]>([
    {
      action: 'ADD',
      sourceServiceId: 5,
      targetServiceId: 10,
      dependencyType: 'REST_DIRECT',
      criticality: 'LOW'
    }
  ]);

  // Topology Modification Builder
  const [newAction, setNewAction] = useState<'ADD' | 'REMOVE'>('ADD');
  const [newTargetId, setNewTargetId] = useState<number>(6);

  // Simulation Result State
  const [simulationResult, setSimulationResult] = useState<WhatIfSimulationResponse | null>(null);

  // Load services list
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await servicesApi.getServices();
        setServices(data);
        if (data.length > 0 && !data.some((s) => s.id === selectedServiceId)) {
          setSelectedServiceId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      }
    };
    fetchServices();
  }, []);

  // Quick Preset Scenarios
  const quickPresets: QuickPreset[] = [
    {
      title: 'Decouple Payment to Ledger',
      subtitle: 'Sever direct synchronous link to isolate settlement risk',
      serviceId: 5,
      changeType: 'DEPENDENCY_CHANGE',
      oldVersion: '2.0.0',
      newVersion: '2.1.0',
      complexity: 4,
      description: 'Isolate Payment Service from General Ledger via asynchronous event queue',
      dependencyChanges: [
        {
          action: 'REMOVE',
          sourceServiceId: 5,
          targetServiceId: 6,
          dependencyType: 'REST_DIRECT',
          criticality: 'CRITICAL'
        }
      ]
    },
    {
      title: 'High-Impact Auth Migration',
      subtitle: 'Link User Auth directly to Fraud Detection & Notification',
      serviceId: 1,
      changeType: 'API_CHANGE',
      oldVersion: '1.4.0',
      newVersion: '2.0.0',
      complexity: 9,
      description: 'Major identity token contract overhaul introducing cross-cluster calls',
      dependencyChanges: [
        {
          action: 'ADD',
          sourceServiceId: 1,
          targetServiceId: 7,
          dependencyType: 'REST_DIRECT',
          criticality: 'HIGH'
        },
        {
          action: 'ADD',
          sourceServiceId: 1,
          targetServiceId: 8,
          dependencyType: 'REST_DIRECT',
          criticality: 'MEDIUM'
        }
      ]
    },
    {
      title: 'Core Database Partitioning',
      subtitle: 'Account Service schema split across data boundaries',
      serviceId: 2,
      changeType: 'DATABASE_CHANGE',
      oldVersion: '3.1.2',
      newVersion: '4.0.0',
      complexity: 8,
      description: 'Sharded multi-tenant DB structure migration affecting all tier-1 dependencies',
      dependencyChanges: []
    }
  ];

  const handleApplyPreset = (preset: QuickPreset) => {
    setSelectedServiceId(preset.serviceId);
    setChangeType(preset.changeType);
    setOldVersion(preset.oldVersion);
    setNewVersion(preset.newVersion);
    setComplexity(preset.complexity);
    setDescription(preset.description);
    setDependencyChanges(preset.dependencyChanges);
  };

  const handleAddTopologyChange = () => {
    if (newTargetId === selectedServiceId) {
      alert('A service cannot depend on itself.');
      return;
    }
    const alreadyExists = dependencyChanges.some(
      (d) => d.sourceServiceId === selectedServiceId && d.targetServiceId === newTargetId
    );
    if (alreadyExists) {
      alert('A rule for this edge already exists in this sandbox.');
      return;
    }

    const targetSvc = services.find((s) => s.id === newTargetId);

    setDependencyChanges([
      ...dependencyChanges,
      {
        action: newAction,
        sourceServiceId: selectedServiceId,
        targetServiceId: newTargetId,
        dependencyType: 'REST_DIRECT',
        criticality: targetSvc?.criticality || 'MEDIUM'
      }
    ]);
  };

  const handleRemoveTopologyChange = (index: number) => {
    setDependencyChanges(dependencyChanges.filter((_, i) => i !== index));
  };

  const handleExecuteSimulation = async () => {
    setSimulating(true);
    setError(null);

    const request: WhatIfSimulationRequest = {
      serviceId: selectedServiceId,
      changeType,
      oldVersion,
      newVersion,
      complexity,
      description,
      dependencyChanges
    };

    try {
      const result = await whatIfApi.simulateChange(request);
      setSimulationResult(result);
    } catch (err: any) {
      setError(err?.message || 'Error executing What-If simulation.');
    } finally {
      setSimulating(false);
    }
  };

  // Run initial simulation on load if none
  useEffect(() => {
    if (services.length > 0 && !simulationResult && !simulating) {
      handleExecuteSimulation();
    }
  }, [services]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#263148] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#4F7CFF]/15 text-[#4F7CFF] border border-[#4F7CFF]/30">
              Isolated Sandbox
            </span>
            <span className="text-xs text-[#94A3B8]">
              In-Memory Graph Mutation Engine
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F5F7FA] mt-1">
            What-If Change Simulator
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Evaluate proposed changes and hypothetical architectural mutations without modifying the live production system.
          </p>
        </div>

        <button
          onClick={handleExecuteSimulation}
          disabled={simulating}
          className="flex items-center gap-2 px-4 py-2 bg-[#4F7CFF] hover:bg-[#3D68E0] disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          {simulating ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Zap className="w-3.5 h-3.5" />
          )}
          <span>{simulating ? 'Simulating...' : 'Execute What-If Simulation'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-xs text-[#EF4444] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Scenario Presets */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-[#94A3B8] block">
          One-Click What-If Scenarios
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {quickPresets.map((preset, idx) => (
            <div
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className="p-3.5 bg-[#121927] hover:bg-[#161F30] border border-[#263148] hover:border-[#4F7CFF]/50 rounded-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#F5F7FA] group-hover:text-[#4F7CFF] transition-colors">
                  <span>{preset.title}</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#4F7CFF] opacity-70 group-hover:opacity-100" />
                </div>
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                  {preset.subtitle}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[#263148] flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span>Complexity: {preset.complexity}/10</span>
                <span>{preset.dependencyChanges.length > 0 ? `${preset.dependencyChanges.length} Edge Mutated` : 'Topology Intact'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulation Setup Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Form (col-span-7) */}
        <div className="lg:col-span-7 p-5 bg-[#121927] rounded-xl border border-[#263148] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#263148]">
            <h3 className="text-sm font-semibold text-[#F5F7FA]">
              Proposed Change Parameters
            </h3>
            <span className="text-xs text-[#94A3B8]">
              Sandbox Context
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block text-[#94A3B8] mb-1 font-medium">
                Target Banking Service
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#171F30] border border-[#263148] rounded-lg text-[#F5F7FA] focus:outline-hidden focus:border-[#4F7CFF]"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.criticality})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#94A3B8] mb-1 font-medium">
                Proposed Change Type
              </label>
              <select
                value={changeType}
                onChange={(e) => setChangeType(e.target.value as ChangeType)}
                className="w-full px-3 py-2 bg-[#171F30] border border-[#263148] rounded-lg text-[#F5F7FA] focus:outline-hidden focus:border-[#4F7CFF]"
              >
                {CHANGE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#94A3B8] mb-1 font-medium">
                Old Version
              </label>
              <input
                type="text"
                value={oldVersion}
                onChange={(e) => setOldVersion(e.target.value)}
                className="w-full px-3 py-2 bg-[#171F30] border border-[#263148] rounded-lg text-[#F5F7FA] font-mono focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[#94A3B8] mb-1 font-medium">
                Proposed New Version
              </label>
              <input
                type="text"
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                className="w-full px-3 py-2 bg-[#171F30] border border-[#263148] rounded-lg text-[#F5F7FA] font-mono focus:outline-hidden"
              />
            </div>
          </div>

          {/* Complexity Slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#94A3B8]">Hypothetical Complexity:</span>
              <span className="font-bold text-[#F59E0B]">{complexity} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={complexity}
              onChange={(e) => setComplexity(Number(e.target.value))}
              className="w-full h-1.5 bg-[#171F30] rounded-lg appearance-none cursor-pointer accent-[#4F7CFF]"
            />
          </div>

          <div>
            <label className="block text-[#94A3B8] mb-1 text-xs font-medium">
              Change Rationale &amp; Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#171F30] border border-[#263148] rounded-lg text-xs text-[#F5F7FA] focus:outline-hidden"
            />
          </div>
        </div>

        {/* Right Topological Mutation Sandbox (col-span-5) */}
        <div className="lg:col-span-5 p-5 bg-[#121927] rounded-xl border border-[#263148] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#263148]">
              <h3 className="text-sm font-semibold text-[#F5F7FA]">
                Topological Graph Mutations
              </h3>
              <span className="text-[10px] font-semibold text-[#4F7CFF] bg-[#4F7CFF]/15 px-2 py-0.5 rounded border border-[#4F7CFF]/30">
                Sandbox Edges
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
              Hypothetically insert or sever service dependency links to observe blast radius mitigation or cascade expansion.
            </p>

            {/* Mutation Builder Controls */}
            <div className="grid grid-cols-12 gap-2 mt-3 text-xs">
              <select
                value={newAction}
                onChange={(e) => setNewAction(e.target.value as 'ADD' | 'REMOVE')}
                className="col-span-4 px-2 py-1.5 bg-[#171F30] border border-[#263148] rounded-lg text-[#F5F7FA]"
              >
                <option value="ADD">+ ADD EDGE</option>
                <option value="REMOVE">- REMOVE</option>
              </select>

              <select
                value={newTargetId}
                onChange={(e) => setNewTargetId(Number(e.target.value))}
                className="col-span-8 px-2 py-1.5 bg-[#171F30] border border-[#263148] rounded-lg text-[#F5F7FA]"
              >
                {services
                  .filter((s) => s.id !== selectedServiceId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      → {s.name} ({s.criticality})
                    </option>
                  ))}
              </select>
            </div>

            <button
              onClick={handleAddTopologyChange}
              className="w-full mt-2 py-1.5 bg-[#171F30] hover:bg-[#161F30] border border-[#263148] rounded-lg text-xs font-semibold text-[#F5F7FA] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#4F7CFF]" />
              <span>Apply Mutation to Sandbox</span>
            </button>

            {/* Active Sandbox Mutations List */}
            <div className="mt-4 space-y-1.5">
              <span className="text-[11px] font-medium text-[#94A3B8] block">
                Active Sandbox Edge Mutations ({dependencyChanges.length})
              </span>
              {dependencyChanges.length === 0 ? (
                <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148] text-xs text-[#94A3B8] italic">
                  No topology modifications. Simulation uses live graph.
                </div>
              ) : (
                dependencyChanges.map((dep, idx) => {
                  const src = services.find((s) => s.id === dep.sourceServiceId)?.name || `Service #${dep.sourceServiceId}`;
                  const tgt = services.find((s) => s.id === dep.targetServiceId)?.name || `Service #${dep.targetServiceId}`;
                  const isAdd = dep.action === 'ADD';
                  return (
                    <div
                      key={idx}
                      className="p-2 bg-[#171F30] rounded-lg border border-[#263148] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isAdd ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30' : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                        }`}>
                          {dep.action}
                        </span>
                        <span className="text-[#F5F7FA]">{src}</span>
                        <span className="text-[#94A3B8]">→</span>
                        <span className="text-[#94A3B8]">{tgt}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveTopologyChange(idx)}
                        className="text-[#94A3B8] hover:text-[#EF4444] p-1 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SIMULATION RESULTS REVEAL */}
      {simulationResult && (
        <div className="space-y-5 pt-2">
          {/* Executive Verdict Banner */}
          <div className="p-4 bg-[#121927] rounded-xl border border-[#263148] flex items-start gap-3.5">
            <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
              simulationResult.comparison.riskPercentageDelta > 0
                ? 'bg-[#EF4444]/15 text-[#EF4444]'
                : simulationResult.comparison.riskPercentageDelta < 0
                ? 'bg-[#22C55E]/15 text-[#22C55E]'
                : 'bg-[#4F7CFF]/15 text-[#4F7CFF]'
            }`}>
              {simulationResult.comparison.riskPercentageDelta > 0 ? (
                <AlertTriangle className="w-5 h-5" />
              ) : simulationResult.comparison.riskPercentageDelta < 0 ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <GitCompare className="w-5 h-5" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#F5F7FA]">
                  Executive Simulation Verdict
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                  simulationResult.comparison.riskPercentageDelta > 0
                    ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                    : simulationResult.comparison.riskPercentageDelta < 0
                    ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30'
                    : 'bg-[#171F30] text-[#94A3B8] border border-[#263148]'
                }`}>
                  Risk Delta: {simulationResult.comparison.riskPercentageDelta > 0 ? `+${simulationResult.comparison.riskPercentageDelta}%` : `${simulationResult.comparison.riskPercentageDelta}%`}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                {simulationResult.comparison.simulationVerdict}
              </p>
            </div>
          </div>

          {/* IMPACT DELTA STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Risk Delta */}
            <div className="p-4 bg-[#121927] rounded-xl border border-[#263148] space-y-1">
              <div className="text-[11px] text-[#94A3B8] font-medium">
                Risk Delta
              </div>
              <div className={`text-2xl font-bold font-mono transition-colors duration-300 flex items-center gap-1.5 ${
                simulationResult.comparison.riskScoreDelta > 0
                  ? 'text-[#EF4444]'
                  : simulationResult.comparison.riskScoreDelta < 0
                  ? 'text-[#22C55E]'
                  : 'text-[#F5F7FA]'
              }`}>
                {simulationResult.comparison.riskScoreDelta > 0 ? (
                  <TrendingUp className="w-5 h-5 shrink-0" />
                ) : simulationResult.comparison.riskScoreDelta < 0 ? (
                  <TrendingDown className="w-5 h-5 shrink-0" />
                ) : null}
                <span>
                  {simulationResult.comparison.riskScoreDelta > 0
                    ? `+${Math.round(simulationResult.comparison.riskScoreDelta * 100)}`
                    : `${Math.round(simulationResult.comparison.riskScoreDelta * 100)}`}
                </span>
              </div>
              <div className="text-[11px] text-[#94A3B8] font-mono">
                {simulationResult.currentState.ruleBasedRiskPercentage}% → {simulationResult.simulatedState.ruleBasedRiskPercentage}%
              </div>
            </div>

            {/* Blast Radius Delta */}
            <div className="p-4 bg-[#121927] rounded-xl border border-[#263148] space-y-1">
              <div className="text-[11px] text-[#94A3B8] font-medium">
                Blast Radius Delta
              </div>
              <div className={`text-2xl font-bold font-mono transition-colors duration-300 ${
                simulationResult.comparison.blastRadiusScoreDelta > 0
                  ? 'text-[#EF4444]'
                  : simulationResult.comparison.blastRadiusScoreDelta < 0
                  ? 'text-[#22C55E]'
                  : 'text-[#F5F7FA]'
              }`}>
                {simulationResult.comparison.blastRadiusScoreDelta > 0
                  ? `+${simulationResult.comparison.blastRadiusScoreDelta.toFixed(1)}`
                  : `${simulationResult.comparison.blastRadiusScoreDelta.toFixed(1)}`}
              </div>
              <div className="text-[11px] text-[#94A3B8] font-mono">
                {simulationResult.currentState.blastRadiusScore.toFixed(1)} → {simulationResult.simulatedState.blastRadiusScore.toFixed(1)}
              </div>
            </div>

            {/* Affected Services Delta */}
            <div className="p-4 bg-[#121927] rounded-xl border border-[#263148] space-y-1">
              <div className="text-[11px] text-[#94A3B8] font-medium">
                Affected Services Delta
              </div>
              <div className={`text-2xl font-bold font-mono transition-colors duration-300 ${
                simulationResult.comparison.affectedCountDelta > 0
                  ? 'text-[#EF4444]'
                  : simulationResult.comparison.affectedCountDelta < 0
                  ? 'text-[#22C55E]'
                  : 'text-[#F5F7FA]'
              }`}>
                {simulationResult.comparison.affectedCountDelta > 0
                  ? `+${simulationResult.comparison.affectedCountDelta}`
                  : `${simulationResult.comparison.affectedCountDelta}`}
              </div>
              <div className="text-[11px] text-[#94A3B8]">
                {simulationResult.currentState.totalAffectedServices} → {simulationResult.simulatedState.totalAffectedServices} nodes
              </div>
            </div>

            {/* Critical Services Delta */}
            <div className="p-4 bg-[#121927] rounded-xl border border-[#263148] space-y-1">
              <div className="text-[11px] text-[#94A3B8] font-medium">
                Critical Tier Delta
              </div>
              <div className={`text-2xl font-bold font-mono transition-colors duration-300 ${
                simulationResult.comparison.criticalAffectedDelta > 0
                  ? 'text-[#EF4444]'
                  : simulationResult.comparison.criticalAffectedDelta < 0
                  ? 'text-[#22C55E]'
                  : 'text-[#F5F7FA]'
              }`}>
                {simulationResult.comparison.criticalAffectedDelta > 0
                  ? `+${simulationResult.comparison.criticalAffectedDelta}`
                  : `${simulationResult.comparison.criticalAffectedDelta}`}
              </div>
              <div className="text-[11px] text-[#94A3B8]">
                {simulationResult.currentState.criticalServicesAffectedCount} → {simulationResult.simulatedState.criticalServicesAffectedCount} critical
              </div>
            </div>
          </div>

          {/* TWO STATES COMPARISON: CURRENT vs PROPOSED */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* CURRENT STATE */}
            <div className="p-5 bg-[#121927] rounded-xl border border-[#263148] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#263148]">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#94A3B8] block">
                    Baseline
                  </span>
                  <h3 className="text-sm font-semibold text-[#F5F7FA]">
                    Current System State
                  </h3>
                </div>
                <RiskBadge level={simulationResult.currentState.ruleBasedRiskLevel} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148]">
                  <span className="text-[#94A3B8] text-[10px] uppercase block font-sans">Risk Score</span>
                  <span className="text-xl font-bold text-[#F5F7FA]">
                    {simulationResult.currentState.ruleBasedRiskPercentage}%
                  </span>
                </div>
                <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148]">
                  <span className="text-[#94A3B8] text-[10px] uppercase block font-sans">Blast Radius</span>
                  <span className="text-xl font-bold text-[#F5F7FA]">
                    {simulationResult.currentState.blastRadiusScore.toFixed(1)}
                  </span>
                </div>
                <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148]">
                  <span className="text-[#94A3B8] text-[10px] uppercase block font-sans">Affected Nodes</span>
                  <span className="text-xl font-bold text-[#F5F7FA]">
                    {simulationResult.currentState.totalAffectedServices}
                  </span>
                </div>
                <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148]">
                  <span className="text-[#94A3B8] text-[10px] uppercase block font-sans">Critical Affected</span>
                  <span className="text-xl font-bold text-[#EF4444]">
                    {simulationResult.currentState.criticalServicesAffectedCount}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-[11px] font-medium text-[#94A3B8] block">
                  Downstream Affected Services
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {simulationResult.currentState.allAffectedServices.map((svcName, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-[#171F30] border border-[#263148] text-[#94A3B8] text-xs font-mono">
                      {svcName}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* PROPOSED STATE */}
            <div className="p-5 bg-[#121927] rounded-xl border border-[#4F7CFF]/40 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#263148]">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#4F7CFF] block">
                    Hypothetical
                  </span>
                  <h3 className="text-sm font-semibold text-[#F5F7FA]">
                    Proposed Simulated State
                  </h3>
                </div>
                <RiskBadge level={simulationResult.simulatedState.ruleBasedRiskLevel} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148]">
                  <span className="text-[#94A3B8] text-[10px] uppercase block font-sans">Risk Score</span>
                  <span className={`text-xl font-bold ${
                    simulationResult.comparison.riskScoreDelta > 0 ? 'text-[#EF4444]' : 'text-[#22C55E]'
                  }`}>
                    {simulationResult.simulatedState.ruleBasedRiskPercentage}%
                  </span>
                </div>
                <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148]">
                  <span className="text-[#94A3B8] text-[10px] uppercase block font-sans">Blast Radius</span>
                  <span className={`text-xl font-bold ${
                    simulationResult.comparison.blastRadiusScoreDelta > 0 ? 'text-[#EF4444]' : 'text-[#22C55E]'
                  }`}>
                    {simulationResult.simulatedState.blastRadiusScore.toFixed(1)}
                  </span>
                </div>
                <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148]">
                  <span className="text-[#94A3B8] text-[10px] uppercase block font-sans">Affected Nodes</span>
                  <span className="text-xl font-bold text-[#F5F7FA]">
                    {simulationResult.simulatedState.totalAffectedServices}
                  </span>
                </div>
                <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148]">
                  <span className="text-[#94A3B8] text-[10px] uppercase block font-sans">Critical Affected</span>
                  <span className="text-xl font-bold text-[#EF4444]">
                    {simulationResult.simulatedState.criticalServicesAffectedCount}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-[11px] font-medium text-[#94A3B8] block">
                  Simulated Affected Services
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {simulationResult.simulatedState.allAffectedServices.map((svcName, i) => {
                    const isNew = simulationResult.comparison.newlyAffectedServices.includes(svcName);
                    return (
                      <span 
                        key={i} 
                        className={`px-2 py-0.5 rounded text-xs font-mono font-medium border ${
                          isNew 
                            ? 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]' 
                            : 'bg-[#171F30] border-[#263148] text-[#94A3B8]'
                        }`}
                      >
                        {isNew ? `+ ${svcName}` : svcName}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
