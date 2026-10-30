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
  Cpu
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

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Analyze IP', path: '/analyze', icon: Search },
    { name: 'Analysis History', path: '/history', icon: History },
    { name: 'Evidence Explorer', path: '/explorer', icon: Network },
    { name: 'Benchmarking', path: '/benchmark', icon: BarChart3 },
    { name: 'Audit Trail', path: '/audit', icon: ShieldCheck },
    { name: 'Help and Glossary', path: '/glossary', icon: BookOpen },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0B132B] text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Logo */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
              <Cpu className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">NetEvidence AI</span>
              <p className="text-xs text-slate-400">Network Intelligence Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live System Indicator */}
        <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/50 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            Engine Online
          </span>
          <span className="font-mono text-[11px] text-slate-500">v1.2 Rule-Fusion</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / User Profile & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-[#080E20]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name || 'Analyst'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[11px] text-slate-400 text-center bg-slate-900/60 py-1.5 rounded-lg border border-slate-800/40">
            Network Intelligence System
          </div>
        </div>
      </aside>
    </>
  );
};
