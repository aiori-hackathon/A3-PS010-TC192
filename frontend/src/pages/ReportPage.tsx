import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import {
  ShieldCheck,
  Search,
  Download,
  Copy,
  Check,
  Bookmark,
  GitCompare,
  Printer,
  Calendar,
  Clock,
  ExternalLink,
  Cpu,
  Layers,
  Network,
  AlertTriangle,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { AnalysisResponse } from '../types';
import { EvidenceGraph } from '../components/EvidenceGraph';
import { ConflictCard } from '../components/ConflictCard';
import { EvidenceTable } from '../components/EvidenceTable';
import { CompareModal } from '../components/CompareModal';
import { Tooltip } from '../components/Tooltip';

export const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [saveTitle, setSaveTitle] = useState<string>('');
  const [saveNotes, setSaveNotes] = useState<string>('');
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadReport() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getAnalysisById(Number(id));
        setReport(data);
        setSaveTitle(`Analysis Report for ${data.ip_address} (${data.network_type})`);
      } catch (err: any) {
        setError(err.message || 'Failed to load analysis report.');
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, [id]);

  const handleCopySummary = () => {
    if (!report) return;
    const text = `NetEvidence AI Classification Report\nTarget IP: ${report.ip_address}\nNetwork Type: ${report.network_type}\nConfidence: ${report.confidence_score}/100 (${report.confidence_level})\nEvidence Quality: ${report.evidence_quality}\nSummary: ${report.summary}\nAudited at: ${new Date(report.created_at).toLocaleString()}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExportJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netevidence_${report.ip_address.replace(/[:.]/g, '_')}_report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleSaveReport = async () => {
    if (!report?.id) return;
    try {
      await api.saveReport({
        analysis_id: report.id,
        title: saveTitle,
        notes: saveNotes,
      });
      setIsSaved(true);
      setShowSaveModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to bookmark report');
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Loading explainable analysis report...
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Report Not Found
        </h3>
        <p className="text-xs text-slate-500">{error || 'Could not retrieve this analysis record.'}</p>
        <button
          onClick={() => navigate('/history')}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white"
        >
          Back to History
        </button>
      </div>
    );
  }

  // Visual category badge styling
  let catBadgeColor = 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300';
  if (report.network_type === 'Hosting / Datacenter') {
    catBadgeColor = 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300';
  } else if (report.network_type === 'Mobile') {
    catBadgeColor = 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300';
  } else if (report.network_type === 'Enterprise / Campus') {
    catBadgeColor = 'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300';
  } else if (report.network_type.includes('Unknown') || report.network_type.includes('Insufficient')) {
    catBadgeColor = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300';
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in max-w-5xl mx-auto print:max-w-none print:m-0 print:p-0">
      {/* Printable Header - Only visible when printing to PDF */}
      <div className="hidden print:block pb-4 mb-4 border-b-2 border-slate-900">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">NetEvidence AI</h1>
            <p className="text-xs text-slate-600">Evidence-Based IP Network-Type Classification Audit Report</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <div>Target: <strong>{report.ip_address}</strong></div>
            <div>Generated: {new Date(report.created_at).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Top action row */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          onClick={() => navigate('/analyze')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Analyze Another IP
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Summary Copied' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={() => setShowSaveModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors shadow-sm ${
              isSaved
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Saved to Bookmarks' : 'Save Report'}</span>
          </button>

          <button
            onClick={() => setIsCompareOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <GitCompare className="w-3.5 h-3.5 text-blue-600" />
            <span>Compare</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm shadow-blue-500/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Result Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm print:border-slate-400 print:shadow-none print:break-inside-avoid">
        {/* Header row: IP + Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Target IP Address
              </span>
              {report.is_demo ? (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                  DEMO DATA / SIMULATED
                </span>
              ) : (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  LIVE SENSOR INTELLIGENCE
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
              {report.ip_address}
            </h2>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>IPv{report.ip_version}</span>
              <span>•</span>
              <span>{report.is_public ? 'Public Routable Address' : 'Non-Public Address'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {report.processing_time_ms} ms processing time
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <span className="text-xs text-slate-400 font-medium">Predicted Network Type</span>
            <div
              className={`px-4 py-1.5 rounded-2xl text-sm font-extrabold border shadow-sm ${catBadgeColor}`}
            >
              {report.network_type}
            </div>
          </div>
        </div>

        {/* 3 Core Metric Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          {/* Confidence Score */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 print:bg-slate-50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Confidence Score
              </span>
              <Tooltip content="Calculated from signal consensus, source family independence, and conflict penalties. A higher score means stronger multi-source agreement." />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                {report.confidence_score}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
              <span
                className={`text-xs font-bold uppercase tracking-wider ml-auto px-2 py-0.5 rounded-full ${
                  report.confidence_score >= 70
                    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : report.confidence_score >= 50
                    ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                    : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                }`}
              >
                {report.confidence_level}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  report.confidence_score >= 70
                    ? 'bg-emerald-500'
                    : report.confidence_score >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${report.confidence_score}%` }}
              />
            </div>
          </div>

          {/* Evidence Quality */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 print:bg-slate-50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Evidence Quality
              </span>
              <Tooltip content="Independent of confidence. Measures evidence depth, number of unique source families, freshness, and absence of sensor errors." />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {report.evidence_quality}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              {report.evidence.filter((e) => e.status !== 'error').length} usable signals across{' '}
              {new Set(report.evidence.map((e) => e.source)).size} sensors
            </p>
          </div>

          {/* Conflict Count */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 print:bg-slate-50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Signal Contradictions
              </span>
              <Tooltip content="Disagreements between reverse DNS, ASN registration, or BGP announcements." />
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-black ${
                  report.conflicts.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {report.conflicts.length}
              </span>
              <span className="text-xs text-slate-400">conflicts detected</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              {report.conflicts.length === 0
                ? 'Complete cross-source agreement'
                : 'Audited and calibrated into scoring'}
            </p>
          </div>
        </div>

        {/* Quick Entity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 py-4 border-t border-b border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Origin ASN:</span>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {report.asn || 'None / Unannounced'}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Network Operator:</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
              {report.org_name || 'Unregistered Org'}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">BGP Subnet Prefix:</span>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {report.prefix || 'None / Not Advertised'}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Reverse DNS Hostname:</span>
            <p className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 truncate" title={report.hostname}>
              {report.hostname || 'None (No PTR)'}
            </p>
          </div>
        </div>
      </div>

      {/* "Why did we get this result?" Plain-English Narrative */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm print:break-inside-avoid">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
            Why did we get this result?
          </h3>
        </div>

        {/* Executive Summary Callout */}
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 mb-5">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider mb-1">
            <FileText className="w-3.5 h-3.5" /> Executive Summary
          </div>
          <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 font-medium leading-relaxed">
            {report.summary}
          </p>
        </div>

        {/* Formatted Markdown Explanation */}
        <div className="markdown-prose text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-3 leading-relaxed">
          <Markdown
            components={{
              h3: ({ node, ...props }) => (
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-5 mb-2 first:mt-0" {...props} />
              ),
              h4: ({ node, ...props }) => (
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-1" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed my-1.5" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-5 space-y-1.5 my-2" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="text-slate-700 dark:text-slate-300" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="p-3.5 my-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border-l-4 border-blue-500 text-xs text-slate-600 dark:text-slate-300 italic"
                  {...props}
                />
              ),
              strong: ({ node, ...props }) => (
                <strong className="font-bold text-slate-900 dark:text-slate-100" {...props} />
              ),
              code: ({ node, ...props }) => (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-xs text-blue-600 dark:text-blue-400"
                  {...props}
                />
              ),
            }}
          >
            {report.explanation}
          </Markdown>
        </div>
      </div>

      {/* Interactive Evidence Graph */}
      <div className="print:break-inside-avoid">
        <EvidenceGraph graphData={report.graph} ipAddress={report.ip_address} />
      </div>

      {/* Conflict Detection Card */}
      <div className="print:break-inside-avoid">
        <ConflictCard conflicts={report.conflicts} />
      </div>

      {/* Detailed Evidence Table */}
      <div className="print:break-inside-avoid">
        <EvidenceTable evidence={report.evidence} />
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              Save Analysis Snapshot
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Bookmark this report in your local database for future comparisons and auditing.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Investigation Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={saveNotes}
                  placeholder="e.g. Verified residential subscriber IP during cybersecurity incident response investigation."
                  onChange={(e) => setSaveNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReport}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Snapshot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {report.id && (
        <CompareModal
          analysisIdA={report.id}
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
        />
      )}
    </div>
  );
};
