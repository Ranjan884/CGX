import React from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from './Logo';
import { 
  LayoutDashboard, 
  History, 
  Award, 
  Network, 
  Radio, 
  Sliders, 
  Hexagon, 
  FileText, 
  AlertTriangle, 
  Cpu, 
  Target, 
  Activity, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Shield
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileToggle: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavSection {
  title?: string;
  items: {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isMobileOpen, 
  onMobileToggle,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const sections: NavSection[] = [
    {
      items: [
        { label: 'Overview', path: '/', icon: LayoutDashboard }
      ]
    },
    {
      title: 'WORKSPACE',
      items: [
        { label: 'Changes', path: '/changes', icon: FileText },
        { label: 'Services', path: '/services', icon: Hexagon },
        { label: 'Dependency Map', path: '/dependency-graph', icon: Network },
        { label: 'Incidents', path: '/incidents', icon: AlertTriangle }
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { label: 'Evaluate Proposed Release', path: '/risk-analysis', icon: Activity },
        { label: 'Risk History', path: '/risk-history', icon: History },
        { label: 'What-If Simulator', path: '/what-if', icon: Sliders },
        { label: 'Recommendations', path: '/recommendations', icon: Award }
      ]
    },
    {
      title: 'RESEARCH',
      items: [
        { label: 'Evaluation', path: '/evaluation', icon: Target },
        { label: 'ML Performance', path: '/ml-metrics', icon: Cpu }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'System Health', path: '/system-health', icon: Activity },
        { label: 'Settings', path: '/settings', icon: Settings }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onMobileToggle}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 bg-[#0F1420] text-[#94A3B8] border-r border-[#263148] flex flex-col z-40 transition-[width,transform] duration-200 ease-out select-none shrink-0 ${
          isCollapsed ? 'w-[70px]' : 'w-[240px]'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#263148] shrink-0">
          <NavLink to="/" className="flex items-center gap-3 overflow-hidden group">
            <Logo size={isCollapsed ? 'sm' : 'md'} collapsed={isCollapsed} />
          </NavLink>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1 text-[#94A3B8] hover:text-[#F5F7FA] rounded hover:bg-[#171F30] transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label="Toggle Sidebar"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {section.title && !isCollapsed && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-[#94A3B8] uppercase">
                  {section.title}
                </div>
              )}
              {section.title && isCollapsed && (
                <div className="h-px my-2 bg-[#263148]" />
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => {
                      if (isMobileOpen) onMobileToggle();
                    }}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#171F30] text-[#F5F7FA] border border-[#263148] font-semibold'
                          : 'text-[#94A3B8] hover:text-[#F5F7FA] hover:bg-[#121927] border border-transparent'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#4F7CFF]' : 'text-[#94A3B8]'
                        }`} />
                        {!isCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer with Operational Status */}
        <div className="p-3 border-t border-[#263148] shrink-0 bg-[#0F1420]">
          {!isCollapsed ? (
            <div className="flex items-center justify-between text-xs px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                <span className="text-[#F5F7FA] font-medium text-xs">System Operational</span>
              </div>
              <span className="text-[11px] font-mono text-[#94A3B8]">v1.0.0</span>
            </div>
          ) : (
            <div className="flex justify-center" title="System Operational v1.0.0">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
