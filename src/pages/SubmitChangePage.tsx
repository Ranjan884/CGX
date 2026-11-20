import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft,
  Info
} from 'lucide-react';
import { servicesApi } from '../api/servicesApi';
import { riskApi } from '../api/riskApi';
import { BankingService, ChangeType } from '../types';

const VALID_CHANGE_TYPES: { value: ChangeType; label: string; desc: string }[] = [
  { value: 'VERSION_UPDATE', label: 'Version Update', desc: 'Binary, container, or service release' },
  { value: 'API_CHANGE', label: 'API Interface Change', desc: 'REST/GraphQL contract or schema revision' },
  { value: 'DATABASE_CHANGE', label: 'Database Schema Change', desc: 'DDL migration, table index, or lock risk' },
  { value: 'CONFIG_CHANGE', label: 'Configuration Change', desc: 'Environment variables, timeouts, or pools' },
  { value: 'LIBRARY_UPDATE', label: 'Library / SDK Update', desc: 'Upstream dependencies or security patches' },
  { value: 'INFRASTRUCTURE_CHANGE', label: 'Infrastructure Change', desc: 'Host, mesh, ingress, or network config' }
];

type ComplexityTier = 'LOW' | 'MODERATE' | 'HIGH' | 'MAJOR';

const COMPLEXITY_OPTIONS: { id: ComplexityTier; label: string; value: number; desc: string; color: string }[] = [
  { id: 'LOW', label: 'Low', value: 2, desc: 'Non-breaking patch, internal routine, minor config', color: 'border-[#22C55E]/40 text-[#22C55E] bg-[#22C55E]/10' },
  { id: 'MODERATE', label: 'Moderate', value: 5, desc: 'Standard backward-compatible feature, non-critical table', color: 'border-[#4F7CFF]/40 text-[#4F7CFF] bg-[#4F7CFF]/10' },
  { id: 'HIGH', label: 'High', value: 7, desc: 'API contract alteration, schema revision, multi-service protocol', color: 'border-[#F59E0B]/40 text-[#F59E0B] bg-[#F59E0B]/10' },
  { id: 'MAJOR', label: 'Major', value: 9, desc: 'Core ledger logic, breaking schema, data migration', color: 'border-[#EF4444]/40 text-[#EF4444] bg-[#EF4444]/10' }
];

export const SubmitChangePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [services, setServices] = useState<BankingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Form Fields
  const initialServiceId = (location.state as any)?.serviceId || 5; // Default to Payment Service
  const [serviceId, setServiceId] = useState<number>(initialServiceId);
  const [changeType, setChangeType] = useState<ChangeType>('VERSION_UPDATE');
  const [oldVersion, setOldVersion] = useState<string>('2.0.0');
  const [newVersion, setNewVersion] = useState<string>('3.0.0');
  const [complexityTier, setComplexityTier] = useState<ComplexityTier>('HIGH');
  const [complexity, setComplexity] = useState<number>(7);
  const [description, setDescription] = useState<string>(
    'Upgrade Payment Service to v3.0.0 for ISO 20022 real-time settlement compliance'
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    servicesApi.getServices()
      .then((data) => {
        setServices(data);
        if (data.length > 0 && !serviceId) {
          setServiceId(data[0].id);
          setOldVersion(data[0].version || '1.0.0');
        }
      })
      .catch((err) => {
        setApiError(err?.message || 'Failed to load banking services');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleServiceChange = (id: number) => {
    setServiceId(id);
    const chosen = services.find((s) => s.id === id);
    if (chosen && chosen.version) {
      setOldVersion(chosen.version);
      const parts = chosen.version.split('.');
      if (parts.length > 0) {
        const major = parseInt(parts[0], 10) || 1;
        setNewVersion(`${major + 1}.0.0`);
      }
    }
  };

  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!serviceId) errs.serviceId = 'Please select a banking service';
    if (!oldVersion.trim()) errs.oldVersion = 'Current version is required';
    if (!newVersion.trim()) errs.newVersion = 'Target new version is required';
    if (oldVersion.trim().toLowerCase() === newVersion.trim().toLowerCase()) {
      errs.newVersion = 'Target version must differ from current version';
    }
    if (!description.trim() || description.trim().length < 5) {
      errs.description = 'Please describe what you are changing (min 5 characters)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleComplexitySelect = (tier: ComplexityTier, val: number) => {
    setComplexityTier(tier);
    setComplexity(val);
  };

  const handleAnalyze = async () => {
    setSubmitting(true);
    setApiError(null);

    try {
      const result = await riskApi.analyzeRisk({
        serviceId,
        changeType,
        complexity,
        oldVersion,
        newVersion,
        description
      });

      navigate('/risk-analysis', {
        state: {
          result,
          params: {
            serviceId,
            changeType,
            complexity,
            oldVersion,
            newVersion,
            description
          }
        }
      });
    } catch (err: any) {
      setApiError(err?.message || 'Failed to analyze change risk pipeline');
      setSubmitting(false);
    }
  };

  const selectedServiceObj = services.find((s) => s.id === serviceId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#263148] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#4F7CFF] rounded-full" />
            <h1 className="text-xl font-bold tracking-tight text-[#F5F7FA]">
              Propose a Change
            </h1>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Submit a proposed system modification for topological blast radius &amp; risk calculation.
          </p>
        </div>

        {/* 3-Step Wizard Indicator */}
        <div className="flex items-center gap-1.5 p-1 bg-[#121927] rounded-lg border border-[#263148] text-xs font-mono self-start sm:self-auto">
          <div className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 ${step === 1 ? 'bg-[#4F7CFF] text-white font-semibold' : 'text-[#94A3B8]'}`}>
            <span>1</span>
            <span>Details</span>
          </div>
          <span className="text-[#94A3B8]">/</span>
          <div className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 ${step === 2 ? 'bg-[#4F7CFF] text-white font-semibold' : 'text-[#94A3B8]'}`}>
            <span>2</span>
            <span>Complexity</span>
          </div>
          <span className="text-[#94A3B8]">/</span>
          <div className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 ${step === 3 ? 'bg-[#4F7CFF] text-white font-semibold' : 'text-[#94A3B8]'}`}>
            <span>3</span>
            <span>Analyze</span>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="p-3 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-lg text-xs text-[#EF4444] font-mono">
          {apiError}
        </div>
      )}

      {/* STEP 1: What are you changing? */}
      {step === 1 && (
        <div className="bg-[#121927] border border-[#263148] rounded-xl p-5 sm:p-6 space-y-5">
          <div className="border-b border-[#263148] pb-3">
            <h2 className="text-sm font-semibold text-[#F5F7FA]">Step 1: What are you changing?</h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">Specify the microservice, change classification, and version shift.</p>
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Service <span className="text-[#EF4444]">*</span>
            </label>
            <select
              value={serviceId}
              onChange={(e) => handleServiceChange(Number(e.target.value))}
              className="w-full text-xs py-2.5 px-3 rounded-lg border border-[#263148] bg-[#0B0F17] text-[#F5F7FA] focus:outline-hidden focus:border-[#4F7CFF]"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.criticality} • {s.type} • v{s.version})
                </option>
              ))}
            </select>
            {errors.serviceId && <p className="text-[#EF4444] text-[11px] mt-1">{errors.serviceId}</p>}
            {selectedServiceObj && (
              <p className="text-[11px] text-[#94A3B8] mt-1.5 flex items-center gap-2">
                <span>Tier: <strong className="text-[#F5F7FA]">{selectedServiceObj.criticality}</strong></span>
                <span>•</span>
                <span>Current: <span className="font-mono text-[#F5F7FA]">v{selectedServiceObj.version}</span></span>
              </p>
            )}
          </div>

          {/* Change Type */}
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Change Type <span className="text-[#EF4444]">*</span>
            </label>
            <select
              value={changeType}
              onChange={(e) => setChangeType(e.target.value as ChangeType)}
              className="w-full text-xs py-2.5 px-3 rounded-lg border border-[#263148] bg-[#0B0F17] text-[#F5F7FA] focus:outline-hidden focus:border-[#4F7CFF]"
            >
              {VALID_CHANGE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label} — {t.desc}
                </option>
              ))}
            </select>
          </div>

          {/* Version Shifts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                Current Version <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                value={oldVersion}
                onChange={(e) => setOldVersion(e.target.value)}
                placeholder="2.0.0"
                className="w-full text-xs py-2.5 px-3 rounded-lg border border-[#263148] bg-[#0B0F17] text-[#F5F7FA] font-mono focus:outline-hidden focus:border-[#4F7CFF]"
              />
              {errors.oldVersion && <p className="text-[#EF4444] text-[11px] mt-1">{errors.oldVersion}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                New Version <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                placeholder="3.0.0"
                className="w-full text-xs py-2.5 px-3 rounded-lg border border-[#263148] bg-[#0B0F17] text-[#F5F7FA] font-mono focus:outline-hidden focus:border-[#4F7CFF]"
              />
              {errors.newVersion && <p className="text-[#EF4444] text-[11px] mt-1">{errors.newVersion}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Description <span className="text-[#EF4444]">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Upgrade Payment Service to ISO 20022 schemas and update downstream settlement callbacks..."
              className="w-full text-xs py-2.5 px-3 rounded-lg border border-[#263148] bg-[#0B0F17] text-[#F5F7FA] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#4F7CFF]"
            />
            {errors.description && <p className="text-[#EF4444] text-[11px] mt-1">{errors.description}</p>}
          </div>

          {/* Navigation Action */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
              className="px-4 py-2 bg-[#4F7CFF] hover:bg-[#3D68E0] text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Continue to Complexity</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Change Complexity */}
      {step === 2 && (
        <div className="bg-[#121927] border border-[#263148] rounded-xl p-5 sm:p-6 space-y-5">
          <div className="border-b border-[#263148] pb-3">
            <h2 className="text-sm font-semibold text-[#F5F7FA]">Step 2: Change Complexity</h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">Select the operational scale and architectural scope of this change.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COMPLEXITY_OPTIONS.map((opt) => {
              const isSelected = complexityTier === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleComplexitySelect(opt.id, opt.value)}
                  className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? `${opt.color} ring-1 ring-[#4F7CFF]`
                      : 'bg-[#171F30] border-[#263148] hover:border-[#364464] text-[#94A3B8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase tracking-wide text-[#F5F7FA]">
                      {opt.label}
                    </span>
                    <span className="text-[11px] font-mono text-[#94A3B8]">
                      Rating {opt.value}/10
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mt-1.5 leading-relaxed">
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Navigation Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-[#263148]">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-3.5 py-2 text-xs font-medium text-[#94A3B8] hover:text-[#F5F7FA] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-4 py-2 bg-[#4F7CFF] hover:bg-[#3D68E0] text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Review &amp; Analyze</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Analyze */}
      {step === 3 && (
        <div className="bg-[#121927] border border-[#263148] rounded-xl p-5 sm:p-6 space-y-5">
          <div className="border-b border-[#263148] pb-3">
            <h2 className="text-sm font-semibold text-[#F5F7FA]">Step 3: Analyze Change Risk</h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">Ready to execute topological graph traversal, rule checks, and ML prediction.</p>
          </div>

          {/* Summary Card */}
          <div className="bg-[#171F30] border border-[#263148] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#263148]">
              <div>
                <span className="text-[11px] text-[#94A3B8] uppercase tracking-wider block font-mono">Target Service</span>
                <span className="text-sm font-bold text-[#F5F7FA]">{selectedServiceObj?.name}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#0B0F17] text-[#4F7CFF] border border-[#263148]">
                {selectedServiceObj?.criticality}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[#94A3B8] text-[10px] block">Change Type</span>
                <span className="font-mono text-[#F5F7FA] text-[11px]">{changeType}</span>
              </div>
              <div>
                <span className="text-[#94A3B8] text-[10px] block">Version Shift</span>
                <span className="font-mono text-[#F5F7FA] text-[11px]">v{oldVersion} → v{newVersion}</span>
              </div>
              <div>
                <span className="text-[#94A3B8] text-[10px] block">Complexity</span>
                <span className="font-mono text-[#F5F7FA] text-[11px]">{complexityTier} ({complexity}/10)</span>
              </div>
            </div>

            <div className="pt-1">
              <span className="text-[#94A3B8] text-[10px] block">Description</span>
              <p className="text-xs text-[#94A3B8] mt-0.5">{description}</p>
            </div>
          </div>

          <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148] flex items-start gap-2.5 text-xs text-[#94A3B8]">
            <Info className="w-4 h-4 text-[#4F7CFF] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Upon clicking analyze, the engine calculates downstream dependent services (BFS/DFS), evaluates safety rules, and queries the predictive model.
            </p>
          </div>

          {/* Navigation Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-[#263148]">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={submitting}
              className="px-3.5 py-2 text-xs font-medium text-[#94A3B8] hover:text-[#F5F7FA] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={submitting}
              className="px-5 py-2.5 bg-[#4F7CFF] hover:bg-[#3D68E0] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Evaluating Risk Pipeline...</span>
                </>
              ) : (
                <>
                  <span>Analyze</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
