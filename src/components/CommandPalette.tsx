import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  LayoutDashboard, 
  ShieldAlert, 
  Network, 
  Radio, 
  GitCompare, 
  History, 
  AlertTriangle, 
  Server, 
  Cpu, 
  Lightbulb, 
  ShieldCheck, 
  Terminal, 
  ArrowRight,
  GitPullRequest,
  X
} from 'lucide-react';
import { servicesApi } from '../api/servicesApi';
import { changesApi } from '../api/changesApi';
import { BankingService, ChangeRecord } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Navigation' | 'Services' | 'Changes' | 'Actions';
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [services, setServices] = useState<BankingService[]>([]);
  const [changes, setChanges] = useState<ChangeRecord[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);

      // Pre-fetch services and changes for rich search
      Promise.all([
        servicesApi.getServices().catch(() => []),
        changesApi.getChanges().catch(() => [])
      ]).then(([sData, cData]) => {
        setServices(sData);
        setChanges(cData);
      });
    }
  }, [isOpen]);

  const defaultNavigationItems: CommandItem[] = [
    {
      id: 'nav-dashboard',
      title: 'Risk Overview',
      subtitle: 'System dashboard, KPIs & exposure overview',
      category: 'Navigation',
      icon: LayoutDashboard,
      action: () => { navigate('/'); onClose(); }
    },
    {
      id: 'nav-risk-analysis',
      title: 'Analyze Change',
      subtitle: 'Run multi-factor risk assessment on technical change',
      category: 'Navigation',
      icon: ShieldAlert,
      action: () => { navigate('/risk-analysis'); onClose(); }
    },
    {
      id: 'nav-topology',
      title: 'Dependency Graph',
      subtitle: 'Interactive microservice architecture topology',
      category: 'Navigation',
      icon: Network,
      action: () => { navigate('/dependency-graph'); onClose(); }
    },
    {
      id: 'nav-blast-radius',
      title: 'Blast Radius Analysis',
      subtitle: 'Cascading failure propagation and affected services',
      category: 'Navigation',
      icon: Radio,
      action: () => { navigate('/blast-radius'); onClose(); }
    },
    {
      id: 'nav-what-if',
      title: 'What-If Simulator',
      subtitle: 'Isolated sandbox for hypothetical change scenarios',
      category: 'Navigation',
      icon: GitCompare,
      action: () => { navigate('/what-if'); onClose(); }
    },
    {
      id: 'nav-risk-history',
      title: 'Risk History & Outcomes',
      subtitle: 'Continuous evaluation records & realized incidents',
      category: 'Navigation',
      icon: History,
      action: () => { navigate('/risk-history'); onClose(); }
    },
    {
      id: 'nav-recommendations',
      title: 'Intelligent Recommendations',
      subtitle: 'Advisory safeguards, canary rollouts & testing decisions',
      category: 'Navigation',
      icon: Lightbulb,
      action: () => { navigate('/recommendations'); onClose(); }
    },
    {
      id: 'nav-services',
      title: 'Service Catalog',
      subtitle: '11 core banking ecosystem microservices',
      category: 'Navigation',
      icon: Server,
      action: () => { navigate('/services'); onClose(); }
    },
    {
      id: 'nav-incidents',
      title: 'Historical Incidents',
      subtitle: 'Simulated post-mortem records and root causes',
      category: 'Navigation',
      icon: AlertTriangle,
      action: () => { navigate('/incidents'); onClose(); }
    },
    {
      id: 'nav-ml',
      title: 'ML Performance & Evaluation',
      subtitle: 'Random Forest ROC-AUC, precision/recall benchmarks',
      category: 'Navigation',
      icon: Cpu,
      action: () => { navigate('/evaluation'); onClose(); }
    },
    {
      id: 'nav-governance',
      title: 'Audit Logs & Governance',
      subtitle: 'Compliance tracking, access records & RBAC policies',
      category: 'Navigation',
      icon: ShieldCheck,
      action: () => { navigate('/audit-logs'); onClose(); }
    },
    {
      id: 'nav-api',
      title: 'Developer API Console',
      subtitle: 'Direct REST endpoint inspection & schema testing',
      category: 'Navigation',
      icon: Terminal,
      action: () => { navigate('/api-console'); onClose(); }
    }
  ];

  // Dynamic Service Items
  const serviceItems: CommandItem[] = services.map((s) => ({
    id: `svc-${s.id}`,
    title: s.name,
    subtitle: `${s.type} Service · Criticality: ${s.criticality} · v${s.version}`,
    category: 'Services',
    icon: Server,
    action: () => {
      navigate('/dependency-graph', { state: { selectedServiceId: s.id } });
      onClose();
    }
  }));

  // Dynamic Change Items
  const changeItems: CommandItem[] = changes.map((c) => ({
    id: `chg-${c.id}`,
    title: `CHG-${c.id}: ${c.description}`,
    subtitle: `${c.changeType} · Complexity: ${c.complexity}/10 · Service ID: ${c.serviceId}`,
    category: 'Changes',
    icon: GitPullRequest,
    action: () => {
      navigate('/risk-analysis', { state: { changeId: c.id } });
      onClose();
    }
  }));

  const allItems = [...defaultNavigationItems, ...serviceItems, ...changeItems];

  const filteredItems = query.trim() === ''
    ? defaultNavigationItems
    : allItems.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }).slice(0, 10);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/70 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl bg-[#121927] border border-[#263148] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#263148] gap-3">
          <Search className="w-4 h-4 text-[#94A3B8]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, service name, or change ID... (e.g. 'Payment', 'Risk', 'CHG-1')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#F5F7FA] placeholder:text-[#94A3B8] focus:outline-hidden font-sans"
          />
          <button 
            onClick={onClose}
            className="p-1 text-[#94A3B8] hover:text-[#F5F7FA] rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#94A3B8]">
              No matching commands or services found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#171F30] text-[#F5F7FA] border border-[#263148]'
                      : 'text-[#94A3B8] hover:bg-[#161F30] hover:text-[#F5F7FA] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-md ${isSelected ? 'bg-[#4F7CFF]/20 text-[#4F7CFF]' : 'bg-[#171F30] text-[#94A3B8]'}`}>
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-medium text-[#F5F7FA] truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#94A3B8] truncate font-mono">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-3 shrink-0">
                    <span className="text-[10px] text-[#94A3B8] font-mono uppercase">
                      {item.category}
                    </span>
                    {isSelected && (
                      <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info & shortcut cues */}
        <div className="px-4 py-2 bg-[#0F1420] border-t border-[#263148] flex items-center justify-between text-[11px] text-[#94A3B8] font-mono">
          <div className="flex items-center gap-3">
            <span>Use <kbd className="px-1.5 py-0.5 rounded bg-[#171F30] border border-[#263148] text-[#CBD5E1]">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[#171F30] border border-[#263148] text-[#CBD5E1]">↓</kbd> to navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-[#171F30] border border-[#263148] text-[#CBD5E1]">↵</kbd> to select</span>
          </div>
          <span><kbd className="px-1.5 py-0.5 rounded bg-[#171F30] border border-[#263148] text-[#CBD5E1]">ESC</kbd> to dismiss</span>
        </div>
      </div>
    </div>
  );
};
