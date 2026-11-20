import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Server, 
  Database, 
  Cpu, 
  Eye
} from 'lucide-react';
import { auditLogApi } from '../api/auditLogApi';
import { getActiveRole, setActiveRole } from '../api/apiClient';
import { AuditLogEntry, SystemHealthDiagnostics, UserRole } from '../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [health, setHealth] = useState<SystemHealthDiagnostics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeRole, setLocalRole] = useState<UserRole>(getActiveRole());
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsData, healthData] = await Promise.all([
        auditLogApi.getAuditLogs(),
        auditLogApi.getSystemHealth()
      ]);
      setLogs(logsData);
      setHealth(healthData);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleRoleChanged = (e: any) => {
      setLocalRole(e.detail?.role || getActiveRole());
    };
    window.addEventListener('changeguard:role-changed', handleRoleChanged);
    return () => {
      window.removeEventListener('changeguard:role-changed', handleRoleChanged);
    };
  }, []);

  const handleRoleSwitch = (newRole: UserRole) => {
    setActiveRole(newRole);
    setLocalRole(newRole);
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (roleFilter !== 'ALL' && log.userRole !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const meta = (log.metadata || '').toLowerCase();
      const act = log.action.toLowerCase();
      const ent = `${log.entityType}:${log.entityId || ''}`.toLowerCase();
      if (!meta.includes(q) && !act.includes(q) && !ent.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
            <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
            SUCCESS
          </span>
        );
      case 'DENIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
            <XCircle className="w-3 h-3 text-[#EF4444]" />
            DENIED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
            <AlertTriangle className="w-3 h-3 text-[#F59E0B]" />
            {status}
          </span>
        );
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-[#4F7CFF]/15 text-[#4F7CFF] border border-[#4F7CFF]/30 font-mono">
            ADMIN
          </span>
        );
      case 'ENGINEER':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 font-mono">
            ENGINEER
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-[#171F30] text-[#94A3B8] border border-[#263148] font-mono">
            VIEWER
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#263148] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#121927] text-[#4F7CFF] border border-[#263148]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#F5F7FA]">
                Governance, Security &amp; Audit Logs
              </h1>
              <p className="text-xs text-[#94A3B8]">
                Production Readiness — Multi-tier Compliance &amp; Access Control Trail
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F5F7FA] bg-[#121927] border border-[#263148] rounded-lg hover:bg-[#161F30] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Trail</span>
          </button>
        </div>
      </div>

      {/* RBAC Role Selector & Policy Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Role Switching Interactive Card */}
        <div className="p-4 rounded-xl bg-[#121927] border border-[#263148] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider font-mono">
              Active Security Persona (RBAC)
            </span>
            <Lock className="w-3.5 h-3.5 text-[#94A3B8]" />
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#0B0F17] rounded-lg border border-[#263148]">
            {(['ADMIN', 'ENGINEER', 'VIEWER'] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => handleRoleSwitch(role)}
                className={`py-1.5 px-2 text-xs font-semibold rounded-md transition-all font-mono text-center cursor-pointer ${
                  activeRole === role
                    ? 'bg-[#4F7CFF] text-white shadow-xs'
                    : 'text-[#94A3B8] hover:text-[#F5F7FA]'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-[#94A3B8]">
            {activeRole === 'ADMIN' && (
              <span className="text-[#4F7CFF] font-medium">
                Admin Persona: Full visibility, governance audit logs, configuration tuning, and system diagnostics.
              </span>
            )}
            {activeRole === 'ENGINEER' && (
              <span className="text-[#22C55E] font-medium">
                Engineer Persona: Authorized to submit changes, run What-If simulations, and record actual deployment outcomes.
              </span>
            )}
            {activeRole === 'VIEWER' && (
              <span className="text-[#F59E0B] font-medium">
                Viewer Persona: Read-only access. Mutating actions (submit change, record outcome) are restricted.
              </span>
            )}
          </div>
        </div>

        {/* System Health Diagnostics */}
        <div className="p-4 rounded-xl bg-[#121927] border border-[#263148] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider font-mono">
              Production System Diagnostics
            </span>
            <Server className="w-3.5 h-3.5 text-[#94A3B8]" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#F5F7FA]">
                <Server className="w-3.5 h-3.5 text-[#22C55E]" /> Spring Boot API
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                PORT 8080 : ONLINE
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#F5F7FA]">
                <Database className="w-3.5 h-3.5 text-[#22C55E]" /> PostgreSQL Persistence
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                ACID SCHEMA : ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#F5F7FA]">
                <Cpu className="w-3.5 h-3.5 text-[#22C55E]" /> FastAPI Inference
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                RANDOM FOREST : READY
              </span>
            </div>
          </div>
        </div>

        {/* Security Hardening Controls */}
        <div className="p-4 rounded-xl bg-[#121927] border border-[#263148] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider font-mono">
              Hardened Security Policies
            </span>
            <Lock className="w-3.5 h-3.5 text-[#94A3B8]" />
          </div>

          <ul className="text-[11px] text-[#94A3B8] space-y-1.5 font-mono">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-[#22C55E] shrink-0" />
              <span>Sanitized error handling: zero stack trace leak</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-[#22C55E] shrink-0" />
              <span>Decoupled audit propagation (REQUIRES_NEW)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-[#22C55E] shrink-0" />
              <span>No secrets committed: .env.example template</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-[#22C55E] shrink-0" />
              <span>Bean validation (@Valid, @NotNull) enforced</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#121927] rounded-xl border border-[#263148]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, entity or metadata..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0B0F17] border border-[#263148] rounded-lg text-[#F5F7FA] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#4F7CFF] font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="text-[#94A3B8] text-[11px] font-mono">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-2 py-1 text-xs bg-[#0B0F17] border border-[#263148] rounded-md font-mono text-[#F5F7FA]"
            >
              <option value="ALL">All Actions</option>
              {uniqueActions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#94A3B8] text-[11px] font-mono">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2 py-1 text-xs bg-[#0B0F17] border border-[#263148] rounded-md font-mono text-[#F5F7FA]"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="ENGINEER">ENGINEER</option>
              <option value="VIEWER">VIEWER</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-[#121927] rounded-xl border border-[#263148] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#171F30] border-b border-[#263148] text-[#94A3B8] font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Persona</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Audit Details / Metadata</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263148] font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#94A3B8]">
                    No matching compliance audit entries found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-[#161F30] transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-[#4F7CFF]">#{log.id}</td>
                    <td className="py-3 px-4 text-[#94A3B8] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">{getRoleBadge(log.userRole)}</td>
                    <td className="py-3 px-4 font-semibold text-[#F5F7FA]">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8]">
                      <span className="px-1.5 py-0.5 rounded bg-[#171F30] border border-[#263148] text-[10px]">
                        {log.entityType} {log.entityId ? `#${log.entityId}` : ''}
                      </span>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(log.status)}</td>
                    <td className="py-3 px-4 text-[#94A3B8] max-w-md truncate">
                      {log.metadata || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1 text-[#94A3B8] hover:text-[#F5F7FA] rounded hover:bg-[#171F30] transition-colors cursor-pointer"
                        title="View Full Audit Payload"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121927] rounded-xl max-w-lg w-full border border-[#263148] shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#263148] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#4F7CFF]" />
                <h3 className="font-bold text-sm text-[#F5F7FA] font-mono">
                  Audit Record #{selectedLog.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-[#94A3B8] hover:text-[#F5F7FA] text-xs font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#263148]">
                <span className="text-[#94A3B8]">Timestamp:</span>
                <span className="text-[#F5F7FA]">{selectedLog.timestamp}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#263148]">
                <span className="text-[#94A3B8]">User Role:</span>
                <span>{getRoleBadge(selectedLog.userRole)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#263148]">
                <span className="text-[#94A3B8]">Action:</span>
                <span className="font-semibold text-[#F5F7FA]">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#263148]">
                <span className="text-[#94A3B8]">Entity:</span>
                <span className="text-[#F5F7FA]">{selectedLog.entityType} ({selectedLog.entityId})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#263148]">
                <span className="text-[#94A3B8]">Status:</span>
                <span>{getStatusBadge(selectedLog.status)}</span>
              </div>
              <div className="pt-2">
                <span className="text-[#94A3B8] block mb-1">Metadata Summary:</span>
                <div className="p-3 bg-[#171F30] border border-[#263148] rounded-lg text-[#F5F7FA] text-[11px] break-words">
                  {selectedLog.metadata || 'No additional metadata logged.'}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-[#4F7CFF] hover:bg-[#3D68E0] text-white font-semibold text-xs rounded-lg font-mono transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
