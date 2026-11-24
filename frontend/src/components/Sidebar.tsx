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
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGlass } from './ShatteredGlassEngine';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { triggerShatter } = useGlass();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      group: 'INTELLIGENCE OPS',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, badge: null },
        { name: 'Analyze IP', path: '/analyze', icon: Search, badge: 'Live' },
        { name: 'Analysis History', path: '/history', icon: History, badge: null },
      ],
    },
    {
      group: 'DEEP FORENSICS',
      items: [
        { name: 'Evidence Explorer', path: '/explorer', icon: Network, badge: 'Graph' },
        { name: 'Benchmarking', path: '/benchmark', icon: BarChart3, badge: 'Metrics' },
        { name: 'Audit Ledger', path: '/audit', icon: ShieldCheck, badge: 'SHA-256' },
      ],
    },
    {
      group: 'SYSTEM',
      items: [
        { name: 'Help and Plan', path: '/glossary', icon: BookOpen, badge: null },
        { name: 'Settings', path: '/settings', icon: Settings, badge: null },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#050507]/80 backdrop-blur-md lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 backdrop-blur-3xl bg-[#17171B]/90 text-[#E5E5EA] border-r border-white/[0.08] flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-[8px_0_32px_0_rgba(0,0,0,0.6)]`}
      >
        {/* Header / Brand Logo */}
        <div className="h-20 px-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8C7BFF] to-[#70D7FF] flex items-center justify-center text-white shadow-[0_0_16px_rgba(140,123,255,0.35)] shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block leading-tight">
                NetEvidence AI
              </span>
              <span className="text-[11px] text-[#A0A0AA] font-mono block leading-tight">
                Network Intelligence
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-[#777782] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.group}>
              <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#777782] block mb-2 font-mono">
                {group.group}
              </span>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose()}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                          isActive
                            ? 'bg-[#8C7BFF]/15 text-[#B9ABFF] font-semibold border border-[#8C7BFF]/40 shadow-[0_0_16px_rgba(140,123,255,0.15)]'
                            : 'text-[#A0A0AA] hover:text-white hover:bg-white/[0.04] font-medium border border-transparent'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0 text-[#777782] group-hover:text-white" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded backdrop-blur-md bg-[#202027] border border-white/[0.08] text-[#8C7BFF]">
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

        {/* User Account / Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#121216]/60 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-[#202027] border border-white/[0.10] flex items-center justify-center text-xs font-semibold text-white shrink-0">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {user?.full_name || 'Analyst'}
                </p>
                <p className="text-[10px] text-[#A0A0AA] truncate font-mono leading-tight">
                  {user?.email || 'analyst@domain'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-[#777782] hover:text-[#FF626E] hover:bg-white/[0.06] rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
