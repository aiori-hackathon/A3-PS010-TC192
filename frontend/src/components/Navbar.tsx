import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Search, ShieldCheck, Activity, Terminal } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onToggleSidebar: () => void;
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, title }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/70 dark:bg-[#070C18]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-slate-200/50 dark:border-slate-700/50"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/50 text-[11px] font-mono font-medium text-blue-600 dark:text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            PS-010
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {title || 'NetEvidence AI'}
            </h1>
            <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Evidence-Based IP Network-Type Classification Platform
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Engine Status Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs">
          <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">RIPEstat & PTR Ready</span>
        </div>

        {/* Quick Analyze IP Button */}
        <button
          onClick={() => navigate('/analyze')}
          className="group relative flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md shadow-blue-500/20 hover:shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Search className="w-3.5 h-3.5 text-cyan-200 group-hover:scale-110 transition-transform" />
          <span>Analyze IP</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-blue-700/50 rounded border border-blue-400/30 text-blue-100">
            /
          </kbd>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* User profile pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-extrabold shadow-sm">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#070C18]" />
          </div>
          <div className="hidden lg:block text-left">
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {user?.full_name?.split(' ')[0] || 'Analyst'}
            </span>
            <span className="block text-[10px] font-mono text-cyan-600 dark:text-cyan-400 leading-tight">
              A3-PS010
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
