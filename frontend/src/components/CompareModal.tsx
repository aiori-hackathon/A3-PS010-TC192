import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, GitCompare, ShieldCheck } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050507]/80 backdrop-blur-md animate-in fade-in font-sans">
      <div className="glass-shard w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 border-[#8C7BFF]/30">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#8C7BFF]/15 border border-[#8C7BFF]/30 flex items-center justify-center text-[#8C7BFF]">
              <GitCompare className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white font-mono">
              Historical Analysis Comparison
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#777782] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selection bar */}
        <div className="mt-4 p-4 rounded-xl bg-[#202027]/70 border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-[#A0A0AA] mb-1">
              Select snapshot to compare against:
            </label>
            <select
              value={selectedIdB || ''}
              onChange={(e) => setSelectedIdB(Number(e.target.value))}
              className="w-full sm:w-72 px-3 py-1.5 text-xs rounded-xl border border-white/[0.10] bg-[#17171B] text-white"
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
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-[#8C7BFF] hover:bg-[#7b68ff] text-white disabled:opacity-50 transition-colors shadow-sm"
          >
            {isLoading ? 'Comparing...' : 'Compare Snapshots'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-[#FF626E]/15 text-[#FF626E] text-xs border border-[#FF626E]/30 font-mono">
            {error}
          </div>
        )}

        {/* Results */}
        {compareResult && (
          <div className="mt-6 space-y-4 font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Snapshot A */}
              <div className="p-4 rounded-xl bg-[#202027]/70 border border-white/[0.08]">
                <span className="text-[11px] font-bold text-[#8C7BFF] uppercase tracking-wider block mb-1">
                  Baseline Analysis #{compareResult.analysis_a.id}
                </span>
                <p className="text-base font-bold text-white">
                  {compareResult.analysis_a.ip}
                </p>
                <div className="mt-3 space-y-1.5 text-[#A0A0AA]">
                  <div>
                    <span className="text-[#777782]">Network Type:</span>{' '}
                    <span className="font-semibold text-white">
                      {compareResult.analysis_a.network_type}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#777782]">Confidence:</span> {compareResult.analysis_a.confidence}%
                  </div>
                  <div>
                    <span className="text-[#777782]">ASN:</span> {compareResult.analysis_a.asn || 'None'}
                  </div>
                  <div>
                    <span className="text-[#777782]">Prefix:</span> {compareResult.analysis_a.prefix || 'None'}
                  </div>
                  <div>
                    <span className="text-[#777782]">Hostname:</span> {compareResult.analysis_a.hostname || 'None'}
                  </div>
                  <div className="text-[10px] text-[#777782] pt-1">
                    Recorded: {new Date(compareResult.analysis_a.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Snapshot B */}
              <div className="p-4 rounded-xl bg-[#202027]/70 border border-white/[0.08]">
                <span className="text-[11px] font-bold text-[#70D7FF] uppercase tracking-wider block mb-1">
                  Comparison Snapshot #{compareResult.analysis_b.id}
                </span>
                <p className="text-base font-bold text-white">
                  {compareResult.analysis_b.ip}
                </p>
                <div className="mt-3 space-y-1.5 text-[#A0A0AA]">
                  <div>
                    <span className="text-[#777782]">Network Type:</span>{' '}
                    <span className="font-semibold text-white">
                      {compareResult.analysis_b.network_type}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#777782]">Confidence:</span> {compareResult.analysis_b.confidence}%
                  </div>
                  <div>
                    <span className="text-[#777782]">ASN:</span> {compareResult.analysis_b.asn || 'None'}
                  </div>
                  <div>
                    <span className="text-[#777782]">Prefix:</span> {compareResult.analysis_b.prefix || 'None'}
                  </div>
                  <div>
                    <span className="text-[#777782]">Hostname:</span> {compareResult.analysis_b.hostname || 'None'}
                  </div>
                  <div className="text-[10px] text-[#777782] pt-1">
                    Recorded: {new Date(compareResult.analysis_b.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Changes detected */}
            <div className="p-4 rounded-xl bg-[#8C7BFF]/10 border border-[#8C7BFF]/25 text-xs">
              <h4 className="font-bold text-white mb-2 flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-4 h-4 text-[#8C7BFF]" />
                Detected Differences ({compareResult.detected_changes.length})
              </h4>
              {compareResult.detected_changes.length === 0 ? (
                <p className="text-[#A0A0AA] font-sans">
                  No structural differences detected. Both snapshots observe identical network categories, ASNs, prefixes, and hostnames.
                </p>
              ) : (
                <ul className="list-disc list-inside space-y-1 text-[#E5E5EA]">
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
