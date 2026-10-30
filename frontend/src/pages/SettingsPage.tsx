import React from 'react';
import { Settings as SettingsIcon, Shield, Server, Moon, Sun, Lock, Info, Cpu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <SettingsIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Settings & System Preferences
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Configure sensor connections, theme preferences, and review ethical cybersecurity standards.
        </p>
      </div>

      {/* User & Project Info */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-600" />
          Project Identity & System Info
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block mb-0.5">Project Name:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">NetEvidence AI</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block mb-0.5">Team & Code:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">Team Evolve (A3-PS010-TC192)</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block mb-0.5">Problem Statement:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">PS-010 (AIORI Hackathon 3)</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block mb-0.5">Institution:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">Guru Nanak Institutions Technical Campus (GNITC)</span>
          </div>
        </div>
      </div>

      {/* Sensor Configuration */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
          <Server className="w-4 h-4 text-teal-600" />
          Live Evidence Source Adapters
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                RIPEstat Open Routing API
              </span>
              <p className="text-slate-400 text-[11px]">
                https://stat.ripe.net/data (No API key required, public rate-limited endpoint)
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Connected
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Reverse DNS System Resolver (PTR)
              </span>
              <p className="text-slate-400 text-[11px]">
                Local recursive socket DNS resolution with 3.0s timeout safeguard
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Evaluator Demo Suite
              </span>
              <p className="text-slate-400 text-[11px]">
                Pre-configured reference test scenarios for offline testing and hackathon review
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-600 border border-blue-500/20">
              Ready
            </span>
          </div>
        </div>
      </div>

      {/* Ethical Cybersecurity & Privacy Statement */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          Privacy & Responsible Use Commitments
        </h3>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            • <strong>No Personal Identification:</strong> NetEvidence AI classifies network infrastructure types (e.g. residential ISP vs cloud datacenter). It does not, and cannot, identify individual people, personal browsing activity, or exact street addresses.
          </p>
          <p>
            • <strong>RFC Network Protection:</strong> Private (RFC 1918), loopback, link-local, and Carrier-Grade NAT (CGNAT) addresses are evaluated entirely on the local system and are never sent to external internet providers.
          </p>
          <p>
            • <strong>Data Retention & Auditing:</strong> Analysis snapshots are stored locally in the application's SQLite database to preserve an auditable record of reasoning. Users have the right to delete their analysis records at any time from the History page.
          </p>
        </div>
      </div>
    </div>
  );
};
