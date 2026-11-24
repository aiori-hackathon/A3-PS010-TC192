import React from 'react';
import { Settings as SettingsIcon, Shield, Server, Cpu, Database, Network } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto pb-12 font-sans">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#8C7BFF]/15 border border-[#8C7BFF]/30 flex items-center justify-center text-[#8C7BFF]">
            <SettingsIcon className="w-4 h-4" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Settings & System Preferences
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#A0A0AA] font-mono">
          Configure sensor connections, intelligence parameters, and review ethical cybersecurity standards.
        </p>
      </div>

      {/* User & Project Info */}
      <div className="glass-shard p-6 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2 font-mono">
          <Cpu className="w-4 h-4 text-[#8C7BFF]" />
          Platform Identity & Architecture
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-[#202027]/70 border border-white/[0.08]">
            <span className="text-[#777782] block text-[11px] mb-0.5">Platform Designation:</span>
            <span className="font-bold text-white text-sm">NetEvidence AI Enterprise</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#202027]/70 border border-white/[0.08]">
            <span className="text-[#777782] block text-[11px] mb-0.5">Classification Engine:</span>
            <span className="font-bold text-[#8C7BFF]">Multi-Source Rule Fusion (v3.2)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#202027]/70 border border-white/[0.08]">
            <span className="text-[#777782] block text-[11px] mb-0.5">Authentication / Identity:</span>
            <span className="font-bold text-white">{user?.email || 'analyst@domain'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#202027]/70 border border-white/[0.08]">
            <span className="text-[#777782] block text-[11px] mb-0.5">Audit Security standard:</span>
            <span className="font-bold text-[#36D67E]">RFC Guarded • Immutable SHA-256</span>
          </div>
        </div>
      </div>

      {/* Sensor Configuration */}
      <div className="glass-shard p-6 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2 font-mono">
          <Server className="w-4 h-4 text-[#70D7FF]" />
          Live Evidence Source Adapters
        </h3>

        <div className="space-y-3 text-xs font-mono">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#202027]/70 border border-white/[0.08]">
            <div>
              <span className="font-bold text-white block">
                RIPEstat Open Routing API
              </span>
              <p className="text-[#A0A0AA] text-[11px]">
                https://stat.ripe.net/data (No API key required, public rate-limited endpoint)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-[#36D67E]/10 text-[#36D67E] border border-[#36D67E]/30">
              Connected
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#202027]/70 border border-white/[0.08]">
            <div>
              <span className="font-bold text-white block">
                Reverse DNS System Resolver (PTR)
              </span>
              <p className="text-[#A0A0AA] text-[11px]">
                Local recursive socket DNS resolution with 3.0s timeout safeguard
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-[#36D67E]/10 text-[#36D67E] border border-[#36D67E]/30">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#202027]/70 border border-white/[0.08]">
            <div>
              <span className="font-bold text-white block">
                Evaluator Demo Suite
              </span>
              <p className="text-[#A0A0AA] text-[11px]">
                Pre-configured reference test scenarios for offline testing and verification
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-[#8C7BFF]/10 text-[#8C7BFF] border border-[#8C7BFF]/30">
              Ready
            </span>
          </div>
        </div>
      </div>

      {/* Ethical Cybersecurity & Privacy Statement */}
      <div className="glass-shard p-6 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2 font-mono">
          <Shield className="w-4 h-4 text-[#36D67E]" />
          Privacy & Responsible Use Commitments
        </h3>

        <div className="p-4 rounded-xl bg-[#202027]/60 border border-white/[0.08] text-xs space-y-2.5 text-[#A0A0AA] leading-relaxed">
          <p>
            • <strong className="text-white">No Personal Identification:</strong> NetEvidence AI classifies network infrastructure types (e.g. residential ISP vs cloud datacenter). It does not, and cannot, identify individual people, personal browsing activity, or exact street addresses.
          </p>
          <p>
            • <strong className="text-white">RFC Network Protection:</strong> Private (RFC 1918), loopback, link-local, and Carrier-Grade NAT (CGNAT) addresses are evaluated entirely on the local system and are never leaked to external internet providers.
          </p>
          <p>
            • <strong className="text-white">Data Retention & Auditing:</strong> Analysis snapshots are stored locally in the application's SQLite database to preserve an auditable record of reasoning. Users have the right to delete their analysis records at any time from the History page.
          </p>
        </div>
      </div>
    </div>
  );
};
