import React, { useState } from 'react';
import { EvidenceItem } from '../types';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  Clock,
  Cpu,
  Layers,
  Database
} from 'lucide-react';

interface EvidenceTableProps {
  evidence: EvidenceItem[];
}

export const EvidenceTable: React.FC<EvidenceTableProps> = ({ evidence }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null);

  const filtered = evidence.filter((item) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'supporting') return item.score_impact > 0;
    if (filterStatus === 'contradicting') return item.score_impact < 0;
    if (filterStatus === 'neutral') return item.score_impact === 0 && item.status !== 'missing' && item.status !== 'error';
    if (filterStatus === 'missing') return item.status === 'missing' || item.status === 'error';
    return true;
  });

  const supportingCount = evidence.filter((i) => i.score_impact > 0).length;
  const contradictingCount = evidence.filter((i) => i.score_impact < 0).length;
  const neutralCount = evidence.filter((i) => i.score_impact === 0 && i.status !== 'missing' && i.status !== 'error').length;
  const missingCount = evidence.filter((i) => i.status === 'missing' || i.status === 'error').length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
              Auditable Evidence Ledger ({evidence.length} observations)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Individual sensor readings, source provenance, direct observations, system inferences, and rule weights.
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All ({evidence.length})
          </button>
          <button
            onClick={() => setFilterStatus('supporting')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
              filterStatus === 'supporting'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Supporting ({supportingCount})
          </button>
          {contradictingCount > 0 && (
            <button
              onClick={() => setFilterStatus('contradicting')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                filterStatus === 'contradicting'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Contradicting ({contradictingCount})
            </button>
          )}
          <button
            onClick={() => setFilterStatus('neutral')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
              filterStatus === 'neutral'
                ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Neutral ({neutralCount})
          </button>
          {missingCount > 0 && (
            <button
              onClick={() => setFilterStatus('missing')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                filterStatus === 'missing'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Missing / Error ({missingCount})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Impact & Status</th>
              <th className="py-2.5 px-3">Evidence Source & Family</th>
              <th className="py-2.5 px-3">Direct Observation (Value)</th>
              <th className="py-2.5 px-3">Engine Interpretation & Contribution</th>
              <th className="py-2.5 px-3">Freshness & Provenance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
            {filtered.map((item) => {
              const isSimulated = (item.freshness || '').toLowerCase().includes('simulated') || item.status === 'simulated';

              let impactBadge = (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                  Neutral Context
                </span>
              );

              if (item.score_impact > 0) {
                impactBadge = (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Supporting (+{item.score_impact})
                  </span>
                );
              } else if (item.score_impact < 0) {
                impactBadge = (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    <ShieldAlert className="w-3 h-3" /> Contradicting ({item.score_impact})
                  </span>
                );
              } else if (item.status === 'missing') {
                impactBadge = (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20">
                    <HelpCircle className="w-3 h-3" /> Missing
                  </span>
                );
              } else if (item.status === 'error') {
                impactBadge = (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <AlertCircle className="w-3 h-3" /> Sensor Error / Timeout
                  </span>
                );
              }

              return (
                <tr
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-3 whitespace-nowrap">
                    {impactBadge}
                    <div className="font-mono text-[9px] text-slate-400 mt-1">ID: {item.id}</div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>{item.source}</span>
                    </div>
                    <span className="inline-block uppercase text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 mt-1">
                      {item.category}
                    </span>
                    {item.reference_url && (
                      <a
                        href={item.reference_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5 mt-0.5"
                      >
                        Provider Endpoint <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </td>

                  <td className="py-3 px-3 max-w-xs break-words">
                    <span className="font-mono text-[10px] text-slate-400 block uppercase font-bold">{item.key}</span>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                      {String(item.value)}
                    </span>
                    {item.error_details && (
                      <span className="block text-[11px] text-rose-500 mt-0.5">{item.error_details}</span>
                    )}
                  </td>

                  <td className="py-3 px-3 max-w-sm">
                    <div
                      className={`text-xs ${
                        item.score_impact > 0
                          ? 'text-emerald-700 dark:text-emerald-300 font-semibold'
                          : item.score_impact < 0
                          ? 'text-rose-700 dark:text-rose-300 font-semibold'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {item.contribution}
                    </div>
                    {item.impact_category && (
                      <span className="inline-block text-[10px] font-semibold text-slate-400 mt-0.5">
                        Target Category: {item.impact_category}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      {isSimulated ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          SIMULATED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          LIVE SENSOR
                        </span>
                      )}
                    </div>
                    <span className="block text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.collected_at).toLocaleTimeString()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Observation Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Observation Audit Details
                </h4>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Evidence Identifier:</span>
                  <span className="font-mono font-bold">{selectedItem.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Source Provider:</span>
                  <span className="font-bold">{selectedItem.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Evidence Family:</span>
                  <span className="uppercase font-mono">{selectedItem.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Attribute Key:</span>
                  <span className="font-mono">{selectedItem.key}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 font-semibold block mb-1">Direct Observed Value:</span>
                <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-slate-100 break-words">
                  {String(selectedItem.value)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 font-semibold block mb-1">Engine Inference & Weight:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedItem.contribution}</p>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Score Delta: {selectedItem.score_impact > 0 ? `+${selectedItem.score_impact}` : selectedItem.score_impact}</span>
                  <span>Impact Category: {selectedItem.impact_category || 'General Context'}</span>
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>Retrieval Time: {new Date(selectedItem.collected_at).toISOString()}</span>
                <span>Provenance: {selectedItem.freshness}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
