import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, GitCompare, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface CompareModalProps {
  analysisIdA: number;
  isOpen: boolean;
  onClose: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({ analysisIdA, isOpen, onClose }) => {
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [selectedIdB, setSelectedIdB] = useState<number | null>(null);
  const [compareResult, setCompareResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getHistory({ limit: 50 }).then((res) => {
        const others = res.items.filter((item) => item.id !== analysisIdA);
        setHistoryList(others);
        if (others.length > 0) {
          setSelectedIdB(others[0].id);
        }
      });
    }
  }, [isOpen, analysisIdA]);

  const handleRunCompare = async () => {
    if (!selectedIdB) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.compareAnalyses({
        analysis_id_a: analysisIdA,
        analysis_id_b: selectedIdB,
      });
      setCompareResult(res);
    } catch (err: any) {
      setError(err.message || 'Comparison failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Historical Analysis Comparison
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selection bar */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Select snapshot to compare against:
            </label>
            <select
              value={selectedIdB || ''}
              onChange={(e) => setSelectedIdB(Number(e.target.value))}
              className="w-full sm:w-72 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              {historyList.map((item) => (
                <option key={item.id} value={item.id}>
                  #{item.id} - {item.ip_address} ({item.network_type}) - {new Date(item.created_at).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRunCompare}
            disabled={!selectedIdB || isLoading}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Comparing...' : 'Compare Snapshots'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 text-xs border border-rose-200 dark:border-rose-800">
            {error}
          </div>
        )}

        {/* Results */}
        {compareResult && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Snapshot A */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
                  Baseline Analysis #{compareResult.analysis_a.id}
                </span>
                <p className="font-mono text-base font-bold text-slate-900 dark:text-slate-100">
                  {compareResult.analysis_a.ip}
                </p>
                <div className="mt-3 space-y-1.5 text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400">Network Type:</span>{' '}
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {compareResult.analysis_a.network_type}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Confidence:</span> {compareResult.analysis_a.confidence}%
                  </div>
                  <div>
                    <span className="text-slate-400">ASN:</span> {compareResult.analysis_a.asn || 'None'}
                  </div>
                  <div>
                    <span className="text-slate-400">Prefix:</span> {compareResult.analysis_a.prefix || 'None'}
                  </div>
                  <div>
                    <span className="text-slate-400">Hostname:</span> {compareResult.analysis_a.hostname || 'None'}
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1">
                    Recorded: {new Date(compareResult.analysis_a.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Snapshot B */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                  Comparison Snapshot #{compareResult.analysis_b.id}
                </span>
                <p className="font-mono text-base font-bold text-slate-900 dark:text-slate-100">
                  {compareResult.analysis_b.ip}
                </p>
                <div className="mt-3 space-y-1.5 text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400">Network Type:</span>{' '}
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {compareResult.analysis_b.network_type}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Confidence:</span> {compareResult.analysis_b.confidence}%
                  </div>
                  <div>
                    <span className="text-slate-400">ASN:</span> {compareResult.analysis_b.asn || 'None'}
                  </div>
                  <div>
                    <span className="text-slate-400">Prefix:</span> {compareResult.analysis_b.prefix || 'None'}
                  </div>
                  <div>
                    <span className="text-slate-400">Hostname:</span> {compareResult.analysis_b.hostname || 'None'}
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1">
                    Recorded: {new Date(compareResult.analysis_b.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Changes detected */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Detected Differences ({compareResult.detected_changes.length})
              </h4>
              {compareResult.detected_changes.length === 0 ? (
                <p className="text-slate-600 dark:text-slate-300">
                  No structural differences detected. Both snapshots observe identical network categories, ASNs, prefixes, and hostnames.
                </p>
              ) : (
                <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                  {compareResult.detected_changes.map((ch: string, i: number) => (
                    <li key={i}>{ch}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
