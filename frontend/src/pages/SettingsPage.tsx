import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Shield, Server, Cpu, Database, Network, Trash2, AlertTriangle, UserX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      navigate('/login');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account.');
      setIsDeleting(false);
    }
  };

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
      {/* Account Deletion / Danger Zone */}
      <div className="glass-shard p-6 space-y-4 border border-[#FF626E]/20 bg-[#17171B]/90">
        <h3 className="font-bold text-[#FF626E] text-sm flex items-center gap-2 font-mono">
          <UserX className="w-4 h-4 text-[#FF626E]" />
          Account Management & Data Erasure
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#202027]/70 border border-white/[0.08]">
          <div className="space-y-1">
            <span className="font-bold text-white text-xs block font-mono">
              Permanently Delete Analyst Account
            </span>
            <p className="text-[#A0A0AA] text-xs">
              Permanently remove your account ({user?.email}) and all related telemetry, classifications, and audit events from the MySQL database.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#FF626E]/15 hover:bg-[#FF626E] text-[#FF626E] hover:text-white border border-[#FF626E]/30 font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 font-mono"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal in Settings */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl glass-card border border-[#FF626E]/30 bg-[#17171B]/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(255,98,110,0.15)] relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FF626E]/15 border border-[#FF626E]/30 flex items-center justify-center text-[#FF626E] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Delete Account?</h3>
                <p className="text-xs text-[#A0A0AA] font-mono">Permanent database removal</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#A0A0AA] leading-relaxed mb-6">
              <p>
                Are you sure you want to permanently delete your account (<strong className="text-white font-mono">{user?.email}</strong>)?
              </p>
              <div className="p-3 rounded-xl bg-[#202027]/70 border border-white/[0.08] text-[11px] font-mono space-y-1 text-[#FF626E]">
                <p>• All saved IP investigation history will be wiped.</p>
                <p>• Your profile will be permanently deleted from MySQL.</p>
                <p>• This action is immediate and cannot be undone.</p>
              </div>
            </div>

            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-[#FF626E]/10 border border-[#FF626E]/30 text-xs text-[#FF626E] font-mono">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-white/[0.12] text-[#E5E5EA] hover:bg-white/[0.06] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-[#FF626E] hover:bg-[#e0505c] text-white font-semibold transition-all shadow-[0_4px_16px_rgba(255,98,110,0.35)] disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
