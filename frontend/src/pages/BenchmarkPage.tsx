import React, { useState, useRef } from 'react';
import {
  BarChart3,
  Play,
  Award,
  CheckCircle2,
  AlertCircle,
  Database,
  Upload,
  Download,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { BenchmarkResult } from '../types';
import { Tooltip } from '../components/Tooltip';

export const BenchmarkPage: React.FC = () => {
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRunReferenceBenchmark = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const data = await api.runBenchmark();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Benchmark evaluation failed.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const data = await api.uploadBenchmarkCsv(file);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to evaluate uploaded CSV dataset.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    window.open(api.getTemplateCsvUrl(), '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl mx-auto pb-12 font-sans">
      {/* Title & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#8C7BFF]/15 border border-[#8C7BFF]/30 flex items-center justify-center text-[#8C7BFF]">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Model Evaluation & Benchmarking
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#A0A0AA] font-mono">
            Empirically evaluate multi-source rule fusion against ground-truth datasets. Compute Accuracy, Precision, Recall, Macro-F1, Confusion Matrix, and Abstention Rate.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto font-mono">
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isRunning}
            className="px-4 py-2 rounded-xl font-bold text-xs backdrop-blur-md bg-[#202027]/80 border border-white/[0.10] text-[#E5E5EA] hover:bg-white/[0.08] flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5 text-[#8C7BFF]" />
            <span>{isUploading ? 'Evaluating CSV...' : 'Upload Labelled CSV'}</span>
          </button>

          <button
            onClick={handleRunReferenceBenchmark}
            disabled={isRunning || isUploading}
            className="px-4 py-2 rounded-xl font-bold text-xs bg-[#8C7BFF] hover:bg-[#7b68ff] text-white shadow-[0_4px_16px_rgba(140,123,255,0.35)] disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            {isRunning ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run Reference Corpus</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#FF626E]/15 text-[#FF626E] border border-[#FF626E]/30 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Dataset Specifications & Template Bar */}
      <div className="glass-shard p-6 text-xs font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#8C7BFF]" />
            <h4 className="font-bold text-white text-sm">
              Evaluation Methodology & CSV Schema
            </h4>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="text-xs font-semibold text-[#8C7BFF] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Template (.csv)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-[#A0A0AA]">
          <div>
            <span className="font-semibold text-white block mb-0.5">
              Required CSV Columns:
            </span>
            <code className="bg-[#202027] border border-white/[0.08] px-1.5 py-0.5 rounded text-[11px] text-[#70D7FF] block mt-1">
              ip_address, ground_truth, notes
            </code>
          </div>
          <div>
            <span className="font-semibold text-white block mb-0.5">
              Supported Ground-Truth Labels:
            </span>
            Residential, Mobile, Enterprise / Campus, Hosting / Datacenter, Unknown / Insufficient Evidence.
          </div>
          <div>
            <span className="font-semibold text-white block mb-0.5">
              Evaluation Principles:
            </span>
            Strictly avoids data leakage. Measures classifier accuracy, per-class F1, and records unforced abstentions.
          </div>
        </div>

        {/* Reference Corpus Provenance & Scope Disclosure */}
        <div className="mt-4 pt-3.5 border-t border-white/[0.08] text-[11px] text-[#777782] space-y-1.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-white font-mono">
            <ShieldAlert className="w-3.5 h-3.5 text-[#8C7BFF]" />
            <span>Dataset Provenance & Benchmark Scope Disclosure</span>
          </div>
          <p className="leading-relaxed">
            The built-in Reference Corpus contains <strong className="text-white">20 curated benchmark targets</strong> representing verified ground-truth instances across 5 distinct network categories:
            Residential (Comcast, Jio, Airtel, Free SAS), Mobile (Verizon Wireless, T-Mobile, Vodafone), Enterprise / Campus (MIT, Stanford, CERN), Hosting / Datacenter (AWS EC2, Hetzner, DigitalOcean), and Bogon / Insufficient control addresses.
          </p>
        </div>
      </div>

      {/* Live Benchmark Results */}
      {result ? (
        <div className="space-y-6">
          {/* Active Dataset Badge */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl glass-shard text-xs font-semibold font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#A0A0AA]">Active Evaluation Dataset:</span>
              <strong className="text-white">{result.dataset_info?.name || 'Evaluation Set'}</strong>
              {result.is_custom_dataset ? (
                <span className="px-2 py-0.5 rounded bg-[#8C7BFF]/15 text-[#B9ABFF] border border-[#8C7BFF]/30 text-[10px] uppercase font-bold">
                  Custom Uploaded CSV
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-[#36D67E]/15 text-[#36D67E] border border-[#36D67E]/30 text-[10px] uppercase font-bold">
                  Reference Corpus
                </span>
              )}
            </div>
            <span className="text-[#777782] text-[11px]">
              Evaluated at: {new Date(result.timestamp).toLocaleTimeString()}
            </span>
          </div>

          {/* Top Score Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
            {/* NetEvidence Overall Accuracy */}
            <div className="glass-shard p-5 bg-[#8C7BFF]/15 border-[#8C7BFF]/40 text-white shadow-[0_0_24px_rgba(140,123,255,0.2)]">
              <span className="text-xs font-semibold text-[#B9ABFF] uppercase tracking-wider">
                Overall Accuracy
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold">{result.overall_accuracy}%</span>
                <span className="text-xs text-[#A0A0AA]">
                  ({result.correct_predictions}/{result.total_samples})
                </span>
              </div>
              <p className="text-xs text-[#B9ABFF] mt-2">
                Macro F1: <span className="font-bold text-white">{result.macro_f1}</span>
              </p>
            </div>

            {/* Baseline Accuracy */}
            <div className="glass-shard p-5">
              <span className="text-xs font-semibold text-[#A0A0AA] uppercase tracking-wider">
                Baseline (ASN Only)
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-white">
                  {result.baseline_accuracy}%
                </span>
              </div>
              <p className="text-xs text-[#A0A0AA] mt-2">
                Fusion Delta:{' '}
                <span className="font-bold text-[#36D67E]">
                  +{(result.overall_accuracy - result.baseline_accuracy).toFixed(1)}%
                </span>
              </p>
            </div>

            {/* Abstention Rate */}
            <div className="glass-shard p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#A0A0AA] uppercase tracking-wider">
                  Abstention Rate
                </span>
                <Tooltip content="Percentage of cases where the model refrained from guessing and returned 'Unknown / Insufficient Evidence'." />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-white">
                  {result.unknown_abstention_rate ?? 0}%
                </span>
              </div>
              <p className="text-xs text-[#777782] mt-2">
                Safe abstention on insufficient signals
              </p>
            </div>

            {/* Samples Count */}
            <div className="glass-shard p-5">
              <span className="text-xs font-semibold text-[#A0A0AA] uppercase tracking-wider">
                Sample Size
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-white">
                  {result.total_samples}
                </span>
                <span className="text-xs text-[#777782]">test rows</span>
              </div>
              <p className="text-xs text-[#777782] mt-2">
                Audited ground-truth cases
              </p>
            </div>
          </div>

          {/* Per-Category Metrics Table */}
          <div className="glass-shard p-5">
            <h3 className="font-bold text-white text-sm mb-3 font-mono">
              Per-Category Classification Metrics (Precision, Recall, F1)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[10px] uppercase font-bold text-[#A0A0AA] tracking-wider">
                    <th className="py-2.5 px-3">Network Category</th>
                    <th className="py-2.5 px-3">Support (Count)</th>
                    <th className="py-2.5 px-3">Precision</th>
                    <th className="py-2.5 px-3">Recall</th>
                    <th className="py-2.5 px-3">F1-Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {result.category_metrics.map((cat) => (
                    <tr key={cat.category} className="hover:bg-white/[0.03]">
                      <td className="py-3 px-3 font-semibold text-white">
                        {cat.category}
                      </td>
                      <td className="py-3 px-3 text-[#A0A0AA]">{cat.total_samples}</td>
                      <td className="py-3 px-3 font-bold text-white">
                        {(cat.precision * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 font-bold text-white">
                        {(cat.recall * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 font-bold text-[#70D7FF]">
                        {cat.f1_score.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Confusion Matrix */}
          <div className="glass-shard p-5">
            <h3 className="font-bold text-white text-sm mb-1 font-mono">
              Confusion Matrix
            </h3>
            <p className="text-xs text-[#A0A0AA] mb-4 font-mono">
              Rows represent Ground-Truth categories; columns represent NetEvidence AI model predictions.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs font-mono border border-white/[0.08]">
                <thead>
                  <tr className="bg-[#202027]/70 text-white font-bold">
                    <th className="p-2 border border-white/[0.08] text-left">
                      Actual \ Predicted
                    </th>
                    {Object.keys(result.confusion_matrix).map((k) => (
                      <th key={k} className="p-2 border border-white/[0.08] text-[10px]">
                        {k.split('/')[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.confusion_matrix).map(([gt, preds]) => (
                    <tr key={gt}>
                      <td className="p-2 border border-white/[0.08] font-bold text-left text-white text-[11px]">
                        {gt}
                      </td>
                      {Object.entries(preds).map(([predKey, count]) => {
                        const isDiagonal = gt === predKey;
                        return (
                          <td
                            key={predKey}
                            className={`p-2 border border-white/[0.08] font-bold ${
                              isDiagonal && count > 0
                                ? 'bg-[#36D67E]/15 text-[#36D67E]'
                                : count > 0
                                ? 'bg-[#F0B45C]/15 text-[#F0B45C] font-black'
                                : 'text-[#777782]'
                            }`}
                          >
                            {count}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Individual Samples Table */}
          <div className="glass-shard p-5">
            <h3 className="font-bold text-white text-sm mb-3 font-mono">
              Individual Sample Verifications ({result.items.length})
            </h3>
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="sticky top-0 bg-[#202027] border-b border-white/[0.08] text-[10px] uppercase font-bold text-[#A0A0AA]">
                  <tr>
                    <th className="py-2.5 px-3">Target IP</th>
                    <th className="py-2.5 px-3">Ground Truth</th>
                    <th className="py-2.5 px-3">Prediction</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Verdict</th>
                    <th className="py-2.5 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {result.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.03]">
                      <td className="py-2.5 px-3 font-bold text-white">
                        {it.ip}
                      </td>
                      <td className="py-2.5 px-3 text-[#A0A0AA]">
                        {it.ground_truth}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#8C7BFF]">
                        {it.predicted}
                      </td>
                      <td className="py-2.5 px-3">{it.confidence}%</td>
                      <td className="py-2.5 px-3">
                        {it.is_correct ? (
                          <span className="inline-flex items-center gap-1 text-[#36D67E] font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#FF626E] font-semibold text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5" /> Discrepancy
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-[#777782] text-[11px] truncate max-w-xs font-sans">
                        {it.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-shard p-12 text-center">
          <Award className="w-12 h-12 text-[#777782] mx-auto mb-3" />
          <h3 className="text-base font-bold text-white font-mono">
            Benchmark not yet evaluated. Upload a labelled dataset to calculate performance metrics.
          </h3>
          <p className="text-xs text-[#A0A0AA] max-w-md mx-auto mt-1 mb-6 font-mono">
            NetEvidence AI does not fabricate accuracy figures. You can upload any verified CSV test set or execute the curated 20-sample reference corpus on demand.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 font-mono">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isRunning}
              className="px-5 py-2.5 rounded-xl font-bold text-xs backdrop-blur-md bg-[#202027]/80 border border-white/[0.10] text-[#E5E5EA] hover:bg-white/[0.08] transition-colors shadow-sm flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-[#8C7BFF]" />
              <span>{isUploading ? 'Evaluating CSV...' : 'Upload Labelled Dataset (.csv)'}</span>
            </button>
            <button
              onClick={handleRunReferenceBenchmark}
              disabled={isRunning || isUploading}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#8C7BFF] hover:bg-[#7b68ff] text-white shadow-[0_4px_16px_rgba(140,123,255,0.35)] transition-colors"
            >
              {isRunning ? 'Running Reference Corpus...' : 'Load Reference Evaluation Set (20 Samples)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
