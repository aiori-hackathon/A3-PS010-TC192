import React from 'react';
import { EvidenceConflict } from '../types';
import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ConflictCardProps {
  conflicts: EvidenceConflict[];
}

export const ConflictCard: React.FC<ConflictCardProps> = ({ conflicts }) => {
  if (!conflicts || conflicts.length === 0) {
    return (
      <div className="glass-card p-4 flex items-center gap-3 border-[#36D67E]/30 bg-[#36D67E]/05">
        <CheckCircle2 className="w-5 h-5 text-[#36D67E] shrink-0" />
        <div>
          <h4 className="text-xs font-semibold text-white font-mono">
            Zero Contradictory Evidence Detected
          </h4>
          <p className="text-xs text-[#A0A0AA] mt-0.5">
            All queried sources (Autonomous System, BGP Routing, and Reverse DNS) consistently corroborate the classification.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-[#F0B45C]" />
        <h3 className="font-bold text-white text-sm font-mono">
          Detected Evidence Conflicts ({conflicts.length})
        </h3>
      </div>
      <p className="text-xs text-[#A0A0AA]">
        Transparent disagreement audit: NetEvidence AI does not discard conflicting signals. Contradictions are documented below and used to calibrate the uncertainty penalty.
      </p>

      <div className="grid grid-cols-1 gap-3.5">
        {conflicts.map((conflict, idx) => {
          const isHigh = conflict.severity === 'High';
          return (
            <div
              key={conflict.id || idx}
              className={`rounded-2xl border p-4.5 backdrop-blur-xl transition-all ${
                isHigh
                  ? 'bg-[#17171B]/90 border-[#F0B45C]/40 shadow-[0_8px_24px_rgba(240,180,92,0.12)]'
                  : 'bg-[#17171B]/80 border-white/[0.08]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold border ${
                      isHigh
                        ? 'bg-[#F0B45C]/15 text-[#F0B45C] border-[#F0B45C]/30'
                        : 'bg-[#70D7FF]/15 text-[#70D7FF] border-[#70D7FF]/30'
                    }`}
                  >
                    {conflict.severity || 'Moderate'} Conflict
                  </span>
                  <span className="text-xs font-bold text-white font-mono">
                    {conflict.title || (conflict as any).conflict_type || 'Signal Contradiction'}
                  </span>
                </div>
                {(conflict as any).uncertainty_penalty && (
                  <span className="text-[11px] font-mono font-medium text-[#FF626E] bg-[#FF626E]/10 px-2 py-0.5 rounded border border-[#FF626E]/30">
                    -{(conflict as any).uncertainty_penalty}% Penalty
                  </span>
                )}
              </div>

              <p className="text-xs text-[#E5E5EA] mt-2 leading-relaxed">
                {conflict.why_it_matters || (conflict as any).description}
              </p>

              {(conflict.resolution_strategy || (conflict as any).resolution) && (
                <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-start gap-2">
                  <span className="text-[10px] font-mono text-[#8C7BFF] uppercase font-semibold shrink-0">
                    Resolution:
                  </span>
                  <span className="text-xs text-[#A0A0AA]">
                    {conflict.resolution_strategy || (conflict as any).resolution}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
