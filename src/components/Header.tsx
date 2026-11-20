import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  CheckCircle2, 
  ShieldCheck
} from 'lucide-react';
import { getActiveRole, setActiveRole } from '../api/apiClient';
import { UserRole } from '../types';

interface HeaderProps {
  onRefresh?: () => void;
  isBackendOnline?: boolean;
  isMlOnline?: boolean;
  onOpenCommandPalette?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isBackendOnline = true,
  isMlOnline = true,
  onOpenCommandPalette
}) => {
  const [role, setRole] = useState<UserRole>(getActiveRole());
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleRoleChanged = (e: any) => {
      setRole(e.detail?.role || getActiveRole());
    };
    window.addEventListener('changeguard:role-changed', handleRoleChanged);
    return () => {
      window.removeEventListener('changeguard:role-changed', handleRoleChanged);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    setActiveRole(newRole);
    setRole(newRole);
    setUserMenuOpen(false);
  };

  return (
    <header className="h-16 px-6 bg-[#0B0F17] border-b border-[#263148] flex items-center justify-between z-20 shrink-0 gap-6 transition-colors">
      {/* Left: Search Input */}
      <div className="flex-1 max-w-xl">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-2 bg-[#121927] hover:bg-[#161F30] border border-[#263148] rounded-lg text-[#94A3B8] hover:text-[#F5F7FA] transition-colors text-xs text-left group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F5F7FA]" />
            <span className="font-normal text-[#CBD5E1]">Search services, changes, incidents...</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#171F30] border border-[#263148] text-[11px] font-mono text-[#94A3B8] font-medium">
            <span>⌘</span>
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right: Live Status Indicators, Notifications & User Avatar */}
      <div className="flex items-center gap-5 sm:gap-6 text-xs shrink-0">
        
        {/* Backend Status */}
        <div className="hidden sm:flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isBackendOnline ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`} />
          <div className="leading-tight">
            <span className="font-medium text-[#F5F7FA] text-xs mr-1.5">Backend</span>
            <span className="text-[11px] text-[#94A3B8]">{isBackendOnline ? 'Operational' : 'Degraded'}</span>
          </div>
        </div>

        {/* ML Service Status */}
        <div className="hidden sm:flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isMlOnline ? 'bg-[#22C55E]' : 'bg-[#F59E0B]'}`} />
          <div className="leading-tight">
            <span className="font-medium text-[#F5F7FA] text-xs mr-1.5">ML</span>
            <span className="text-[11px] text-[#94A3B8]">{isMlOnline ? 'Available' : 'Fallback'}</span>
          </div>
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-[#94A3B8] hover:text-[#F5F7FA] hover:bg-[#121927] rounded-lg transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#EF4444] text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-[#0B0F17]">
              3
            </span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#121927] rounded-xl shadow-xl border border-[#263148] p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#263148]">
                <span className="font-medium text-xs text-[#F5F7FA]">Notifications</span>
                <span className="text-[11px] text-[#4F7CFF] font-medium cursor-pointer">Mark all read</span>
              </div>
              <div className="space-y-2 pt-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#171F30] border border-[#EF4444]/30">
                  <div className="font-medium text-[#EF4444]">High Risk Change Flagged</div>
                  <div className="text-[11px] text-[#94A3B8] mt-0.5">CHG-1042 on Payment Service exceeds threshold (81/100).</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#171F30] border border-[#263148]">
                  <div className="font-medium text-[#F5F7FA]">ML Model Evaluated</div>
                  <div className="text-[11px] text-[#94A3B8] mt-0.5">Random Forest v2.0.0 validated on historical releases.</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#171F30] border border-[#F59E0B]/30">
                  <div className="font-medium text-[#F59E0B]">Critical Service Path Updated</div>
                  <div className="text-[11px] text-[#94A3B8] mt-0.5">Core Banking Service topology path modified.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 p-1 rounded-lg hover:bg-[#121927] transition-colors cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-full bg-[#171F30] border border-[#263148] text-[#F5F7FA] font-medium text-xs flex items-center justify-center shrink-0">
              RY
            </div>
            <div className="hidden md:block leading-tight">
              <div className="font-medium text-xs text-[#F5F7FA]">Ranjan Yadav</div>
              <div className="text-[11px] text-[#94A3B8] font-normal">Engineer</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] hidden md:block" />
          </button>

          {/* User dropdown menu */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#121927] rounded-xl shadow-xl border border-[#263148] py-1.5 z-50">
              <div className="px-3 py-2 border-b border-[#263148]">
                <div className="font-medium text-xs text-[#F5F7FA]">Ranjan Yadav</div>
                <div className="text-[11px] text-[#94A3B8]">ry76115442@gmail.com</div>
              </div>

              <div className="p-1.5 border-b border-[#263148]">
                <div className="px-2 py-1 text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                  Active Role (RBAC)
                </div>
                {(['ENGINEER', 'TECH_LEAD', 'CHANGE_MANAGER', 'AUDITOR'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRoleChange(r)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      role === r ? 'bg-[#171F30] text-[#4F7CFF] font-semibold' : 'text-[#94A3B8] hover:bg-[#161F30] hover:text-[#F5F7FA]'
                    }`}
                  >
                    <span>{r.replace('_', ' ')}</span>
                    {role === r && <CheckCircle2 className="w-3.5 h-3.5 text-[#4F7CFF]" />}
                  </button>
                ))}
              </div>

              <div className="p-1">
                <button
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-[#94A3B8] hover:bg-[#161F30] hover:text-[#F5F7FA] flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span>Security &amp; Audit Logs</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
