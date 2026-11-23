import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  History,
  Network,
  BarChart3,
  ShieldCheck,
  BookOpen,
  Settings,
  LogOut,
  X,
  Radio,
  Cpu,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      group: 'CORE OPERATIONS',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, badge: null },
        { name: 'Analyze IP', path: '/analyze', icon: Search, badge: 'Live' },
        { name: 'Analysis History', path: '/history', icon: History, badge: null },
      ]
    },
    {
      group: 'DEEP INTELLIGENCE',
      items: [
        { name: 'Evidence Explorer', path: '/explorer', icon: Network, badge: 'Graph' },
        { name: 'Benchmarking', path: '/benchmark', icon: BarChart3, badge: 'Metrics' },
        { name: 'Audit Trail', path: '/audit', icon: ShieldCheck, badge: 'Ledger' },
      ]
    },
    {
      group: 'SYSTEM & HELP',
      items: [
        { name: 'Help and Glossary', path: '/glossary', icon: BookOpen, badge: null },
        { name: 'Settings', path: '/settings', icon: Settings, badge: null },
      ]
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-md lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#070D1E] text-slate-200 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl lg:shadow-none`}
      >
        {/* Header / Logo */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-b from-[#0B1530] to-[#070D1E]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-400/30 text-white font-bold">
                <Cpu className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#070D1E] animate-ping opacity-75" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white block">NetEvidence AI</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">PS-010</span>
                <span className="text-slate-600">•</span>
                <span className="text-[10px] text-slate-400 font-medium truncate">Team Evolve</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live System Indicator */}
        <div className="px-5 py-2.5 bg-[#091126] border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Engine Online
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-cyan-300 border border-slate-700/60">
            Rule-Fusion v1.2
          </span>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              <span className="px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 block">
                {group.group}
              </span>
              <div className="space-y-1 pt-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose()}
                      className={({ isActive }) =>
                        `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-lg shadow-blue-600/30 font-bold border border-cyan-400/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/70 border border-transparent'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer / User Profile & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-[#060B1A]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-extrabold text-white shrink-0 shadow-md shadow-cyan-500/20">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-200 truncate">{user?.full_name || 'Cyber Analyst'}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[10px] text-slate-400 text-center bg-slate-900/80 py-1.5 px-2 rounded-xl border border-slate-800/60 font-mono flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            GNITC • TC192 • Hackathon 3
          </div>
        </div>
      </aside>
    </>
  );
};
