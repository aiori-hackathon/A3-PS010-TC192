import React from 'react';
import { EvidenceConflict } from '../types';
import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ConflictCardProps {
  conflicts: EvidenceConflict[];
}

export const ConflictCard: React.FC<ConflictCardProps> = ({ conflicts }) => {
  if (!conflicts || conflicts.length === 0) {
    return (
      <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
        <div>
          <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            No Contradictory Evidence Detected
          </h4>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-400 mt-0.5">
            All queried sources (Autonomous System, BGP Routing, and Reverse DNS) consistently corroborate the classification.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-amber-500" />
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
          Detected Evidence Conflicts ({conflicts.length})
        </h3>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Transparent disagreement audit: NetEvidence AI does not discard conflicting signals. Contradictions are documented below and used to calibrate the uncertainty penalty.
      </p>

      <div className="grid grid-cols-1 gap-3.5">
        {conflicts.map((conflict, idx) => {
          const isHigh = conflict.severity === 'High';
          return (
            <div
              key={conflict.id || idx}
              className={`rounded-xl border p-4 transition-colors ${
                isHigh
                  ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={`w-4 h-4 shrink-0 ${isHigh ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}
                  />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {conflict.title}
                  </h4>
                </div>
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isHigh
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {conflict.severity} Severity
                </span>
              </div>

              {/* Side-by-side values */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    Source A: {conflict.source_a}
                  </span>
                  <code className="text-slate-800 dark:text-slate-200 font-mono text-[11px] break-all">
                    {conflict.value_a}
                  </code>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    Source B: {conflict.source_b}
                  </span>
                  <code className="text-slate-800 dark:text-slate-200 font-mono text-[11px] break-all">
                    {conflict.value_b}
                  </code>
                </div>
              </div>

              {/* Explanation of Why It Matters */}
              <div className="mt-3 text-xs space-y-1.5">
                <p className="text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Why this conflict matters: </span>
                  {conflict.why_it_matters}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">System Resolution: </span>
                  {conflict.resolution_strategy}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Impact: {conflict.affected_outcome ? 'Lowered confidence score (-25 pts)' : 'Informational notice only'}
                </span>
                <span className="font-mono text-[10px]">ID: {conflict.id}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
