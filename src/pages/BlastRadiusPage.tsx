import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { blastRadiusApi } from '../api/blastRadiusApi';
import { servicesApi } from '../api/servicesApi';
import { BlastRadiusResult, BankingService } from '../types';
import { BlastRadiusCard } from '../components/BlastRadiusCard';

export const BlastRadiusPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [services, setServices] = useState<BankingService[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(
    (location.state as any)?.serviceId || 5 // default to Payment Service (ID 5)
  );

  const [blastRadius, setBlastRadius] = useState<BlastRadiusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    servicesApi.getServices().then(setServices).catch(console.error);
  }, []);

  const fetchBlastRadius = async (svcId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await blastRadiusApi.getBlastRadiusForService(svcId);
      setBlastRadius(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to calculate blast radius.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedServiceId) {
      fetchBlastRadius(selectedServiceId);
    }
  }, [selectedServiceId]);

  const selectedService = services.find((s) => s.id === selectedServiceId);

  return (
    <div className="space-y-6">
      {/* Title & Service Selector Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#263148] pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F5F7FA]">
            Blast Radius Analysis
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Calculates direct vs. indirect downstream perimeter, hop depths, and critical systems.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-[#94A3B8]">
            Target Service:
          </label>
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(Number(e.target.value))}
            className="text-xs py-1.5 px-3 rounded-lg border border-[#263148] bg-[#121927] text-[#F5F7FA] focus:outline-hidden"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.criticality})
              </option>
            ))}
          </select>

          <button
            onClick={() => navigate('/risk-analysis', { state: { serviceId: selectedServiceId } })}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#4F7CFF] hover:bg-[#3D68E0] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Analyze Risk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#263148] border-t-[#4F7CFF] animate-spin" />
          <span className="text-xs text-[#94A3B8]">
            Calculating blast radius perimeter...
          </span>
        </div>
      ) : blastRadius ? (
        <div className="space-y-6">
          {/* Visual Blast-Radius Cascade Card */}
          <BlastRadiusCard result={blastRadius} />

          {/* Table for Exact Reachability Depths */}
          <div className="bg-[#121927] border border-[#263148] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#263148]">
              <h3 className="text-sm font-semibold text-[#F5F7FA]">
                Downstream Microservice Cascade Table
              </h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Exact shortest hop depths and exposure classifications for reachable systems
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#171F30] text-[#94A3B8] text-[11px] uppercase border-b border-[#263148]">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Service Name</th>
                    <th className="py-2.5 px-4 font-semibold">Impact Classification</th>
                    <th className="py-2.5 px-4 font-semibold">Hop Distance</th>
                    <th className="py-2.5 px-4 font-semibold">Criticality Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#263148] text-xs">
                  {/* Originating Target */}
                  <tr className="bg-[#171F30]/50">
                    <td className="py-2.5 px-4 font-bold text-[#F5F7FA]">
                      {selectedService?.name || blastRadius.startingService?.name} (Root Origin)
                    </td>
                    <td className="py-2.5 px-4 text-[#4F7CFF] font-semibold">
                      ORIGIN_TARGET
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#F5F7FA]">Depth = 0</td>
                    <td className="py-2.5 px-4 text-[#EF4444] font-semibold">
                      {selectedService?.criticality || 'CRITICAL'}
                    </td>
                  </tr>

                  {/* Direct Downstream */}
                  {(blastRadius.directlyAffectedServices || []).map((name) => {
                    const match = services.find((s) => s.name === name);
                    const depth = blastRadius.serviceDepths?.[name] || 1;
                    return (
                      <tr key={name} className="hover:bg-[#161F30] transition-colors">
                        <td className="py-2.5 px-4 font-medium text-[#F5F7FA]">
                          {name}
                        </td>
                        <td className="py-2.5 px-4 text-[#4F7CFF] font-medium">
                          DIRECT_DEPENDENCY
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[#94A3B8]">
                          Depth = {depth}
                        </td>
                        <td className="py-2.5 px-4 text-[#94A3B8]">
                          {match?.criticality || 'MEDIUM'}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Indirect Downstream */}
                  {(blastRadius.indirectlyAffectedServices || []).map((name) => {
                    const match = services.find((s) => s.name === name);
                    const depth = blastRadius.serviceDepths?.[name] || 2;
                    return (
                      <tr key={name} className="hover:bg-[#161F30] transition-colors">
                        <td className="py-2.5 px-4 font-medium text-[#EF4444]">
                          {name}
                        </td>
                        <td className="py-2.5 px-4 text-[#EF4444] font-medium">
                          INDIRECT_CASCADE
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[#94A3B8]">
                          Depth = {depth}
                        </td>
                        <td className="py-2.5 px-4 text-[#94A3B8]">
                          {match?.criticality || 'LOW'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
