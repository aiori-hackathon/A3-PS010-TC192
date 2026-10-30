import React, { useState, useRef } from 'react';
import {
  BarChart3,
  Play,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Database,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Upload,
  Download,
  FileText,
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
    window.open('/api/v1/benchmark/template-csv', '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl mx-auto pb-12">
      {/* Title & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Model Evaluation & Benchmarking
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Empirically evaluate multi-source rule fusion against ground-truth datasets. Compute Accuracy, Precision, Recall, Macro-F1, Confusion Matrix, and Abstention Rate.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
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
            className="px-4 py-2 rounded-xl font-bold text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>{isUploading ? 'Evaluating CSV...' : 'Upload Labelled CSV'}</span>
          </button>

          <button
            onClick={handleRunReferenceBenchmark}
            disabled={isRunning || isUploading}
            className="px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
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
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs">
          {error}
        </div>
      )}

      {/* Dataset Specifications & Template Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Evaluation Methodology & CSV Schema
            </h4>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Template (.csv)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-slate-600 dark:text-slate-300">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">
              Required CSV Columns:
            </span>
            <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px] font-mono text-blue-600 dark:text-blue-400 block mt-1">
              ip_address, ground_truth, notes
            </code>
          </div>
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">
              Supported Ground-Truth Labels:
            </span>
            Residential, Mobile, Enterprise / Campus, Hosting / Datacenter, Unknown / Insufficient Evidence.
          </div>
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">
              Evaluation Principles:
            </span>
            Strictly avoids data leakage. Measures classifier accuracy, per-class F1, and records unforced abstentions (Unknown / Insufficient).
          </div>
        </div>
      </div>

      {/* Live Benchmark Results */}
      {result ? (
        <div className="space-y-6">
          {/* Active Dataset Badge */}
          <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Active Evaluation Dataset:</span>
              <strong className="text-slate-900 dark:text-slate-100">{result.dataset_info?.name || 'Evaluation Set'}</strong>
              {result.is_custom_dataset ? (
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] uppercase font-bold">
                  Custom Uploaded CSV
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-[10px] uppercase font-bold">
                  Reference Corpus
                </span>
              )}
            </div>
            <span className="text-slate-400 text-[11px]">
              Evaluated at: {new Date(result.timestamp).toLocaleTimeString()}
            </span>
          </div>

          {/* Top Score Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* NetEvidence Overall Accuracy */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-2xl shadow-lg border border-blue-500/30">
              <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider">
                Overall Accuracy
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black">{result.overall_accuracy}%</span>
                <span className="text-xs text-blue-200">
                  ({result.correct_predictions}/{result.total_samples})
                </span>
              </div>
              <p className="text-xs text-blue-100/90 mt-2">
                Macro F1: <span className="font-bold">{result.macro_f1}</span>
              </p>
            </div>

            {/* Baseline Accuracy */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Baseline (ASN Only)
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-slate-700 dark:text-slate-300">
                  {result.baseline_accuracy}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Fusion Delta:{' '}
                <span className="font-bold text-emerald-600">
                  +{(result.overall_accuracy - result.baseline_accuracy).toFixed(1)}%
                </span>
              </p>
            </div>

            {/* Abstention Rate */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Abstention Rate
                </span>
                <Tooltip content="Percentage of cases where the model refrained from guessing and returned 'Unknown / Insufficient Evidence'." />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-slate-800 dark:text-slate-200">
                  {result.unknown_abstention_rate ?? 0}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Safe abstention on insufficient signals
              </p>
            </div>

            {/* Samples Count */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sample Size
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-slate-800 dark:text-slate-200">
                  {result.total_samples}
                </span>
                <span className="text-xs text-slate-400">test rows</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Audited ground-truth cases
              </p>
            </div>
          </div>

          {/* Per-Category Metrics Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-3">
              Per-Category Classification Metrics (Precision, Recall, F1)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <th className="py-2.5 px-3">Network Category</th>
                    <th className="py-2.5 px-3">Support (Count)</th>
                    <th className="py-2.5 px-3">Precision</th>
                    <th className="py-2.5 px-3">Recall</th>
                    <th className="py-2.5 px-3">F1-Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                  {result.category_metrics.map((cat) => (
                    <tr key={cat.category} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {cat.category}
                      </td>
                      <td className="py-3 px-3 text-slate-500">{cat.total_samples}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {(cat.precision * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {(cat.recall * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-teal-600 dark:text-teal-400">
                        {cat.f1_score.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Confusion Matrix */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
              Confusion Matrix
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Rows represent Ground-Truth categories; columns represent NetEvidence AI model predictions.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border border-slate-200 dark:border-slate-700">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    <th className="p-2 border border-slate-200 dark:border-slate-700 text-left">
                      Actual \ Predicted
                    </th>
                    {Object.keys(result.confusion_matrix).map((k) => (
                      <th key={k} className="p-2 border border-slate-200 dark:border-slate-700 text-[10px]">
                        {k.split('/')[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.confusion_matrix).map(([gt, preds]) => (
                    <tr key={gt}>
                      <td className="p-2 border border-slate-200 dark:border-slate-700 font-bold text-left text-slate-800 dark:text-slate-200 text-[11px]">
                        {gt}
                      </td>
                      {Object.entries(preds).map(([predKey, count]) => {
                        const isDiagonal = gt === predKey;
                        return (
                          <td
                            key={predKey}
                            className={`p-2 border border-slate-200 dark:border-slate-700 font-mono font-bold ${
                              isDiagonal && count > 0
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : count > 0
                                ? 'bg-amber-500/10 text-amber-600 font-black'
                                : 'text-slate-400'
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-3">
              Individual Sample Verifications ({result.items.length})
            </h3>
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">Target IP</th>
                    <th className="py-2.5 px-3">Ground Truth</th>
                    <th className="py-2.5 px-3">Prediction</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Verdict</th>
                    <th className="py-2.5 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                  {result.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {it.ip}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                        {it.ground_truth}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {it.predicted}
                      </td>
                      <td className="py-2.5 px-3 font-mono">{it.confidence}%</td>
                      <td className="py-2.5 px-3">
                        {it.is_correct ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5" /> Discrepancy
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate max-w-xs">
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
          <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Benchmark not yet evaluated. Upload a labelled dataset to calculate performance metrics.
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
            NetEvidence AI does not fabricate accuracy figures. You can upload any verified CSV test set or execute the curated 20-sample reference corpus on demand.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isRunning}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span>{isUploading ? 'Evaluating CSV...' : 'Upload Labelled Dataset (.csv)'}</span>
            </button>
            <button
              onClick={handleRunReferenceBenchmark}
              disabled={isRunning || isUploading}
              className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white shadow-md shadow-blue-500/20"
            >
              {isRunning ? 'Running Reference Corpus...' : 'Load Reference Evaluation Set (20 Samples)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
