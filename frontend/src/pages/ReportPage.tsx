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
  FileText,
  Activity,
  Radio,
  Fingerprint,
  Zap,
  Globe,
  Info,
  ShieldAlert
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
        <div className="w-12 h-12 border-4 border-[#8C7BFF]/30 border-t-[#8C7BFF] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-white font-mono">
          Synthesizing multi-source evidence dossier...
        </p>
        <span className="text-xs text-[#A0A0AA] font-mono mt-1 block">Multi-Source Rule Fusion Engine</span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 glass-shard my-12">
        <AlertTriangle className="w-12 h-12 text-[#FF626E] mx-auto" />
        <h3 className="text-lg font-bold text-white font-mono">
          Report Not Found
        </h3>
        <p className="text-xs text-[#A0A0AA] font-mono">{error || 'Could not retrieve this analysis record.'}</p>
        <button
          onClick={() => navigate('/history')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#8C7BFF] hover:bg-[#7b68ff] text-white shadow-md transition-colors"
        >
          Back to History Ledger
        </button>
      </div>
    );
  }

  // Visual category badge styling
  let catBadgeColor = 'bg-[#70D7FF]/15 text-[#70D7FF] border-[#70D7FF]/40 shadow-[0_0_16px_rgba(112,215,255,0.25)]';
  if (report.network_type === 'Hosting / Datacenter') {
    catBadgeColor = 'bg-[#8C7BFF]/15 text-[#B9ABFF] border-[#8C7BFF]/40 shadow-[0_0_16px_rgba(140,123,255,0.25)]';
  } else if (report.network_type === 'Mobile') {
    catBadgeColor = 'bg-[#36D67E]/15 text-[#36D67E] border-[#36D67E]/40 shadow-[0_0_16px_rgba(54,214,126,0.25)]';
  } else if (report.network_type === 'Enterprise / Campus') {
    catBadgeColor = 'bg-[#70D7FF]/15 text-[#70D7FF] border-[#70D7FF]/40 shadow-[0_0_16px_rgba(112,215,255,0.25)]';
  } else if (report.network_type.includes('Unknown') || report.network_type.includes('Insufficient')) {
    catBadgeColor = 'bg-white/[0.08] text-[#A0A0AA] border-white/[0.15]';
  }

  return (
    <div className="space-y-7 pb-12 animate-in fade-in duration-300 max-w-5xl mx-auto print:max-w-none print:m-0 print:p-0 font-sans">
      {/* Printable Header */}
      <div className="hidden print:block pb-4 mb-4 border-b-2 border-white/40">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">NetEvidence AI</h1>
            <p className="text-xs text-[#A0A0AA]">Evidence-Based IP Network-Type Classification Audit Dossier</p>
          </div>
          <div className="text-right text-xs text-[#A0A0AA] font-mono">
            <div>Target: <strong className="text-white">{report.ip_address}</strong></div>
            <div>Audited: {new Date(report.created_at).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          onClick={() => navigate('/analyze')}
          className="flex items-center gap-1.5 text-xs font-bold font-mono text-[#A0A0AA] hover:text-[#8C7BFF] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Analyze Another Target</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 font-mono">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md bg-[#202027]/80 border border-white/[0.10] text-[#E5E5EA] hover:bg-white/[0.08] transition-all"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-[#36D67E]" /> : <Copy className="w-3.5 h-3.5 text-[#A0A0AA]" />}
            <span>{isCopied ? 'Summary Copied' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={() => setShowSaveModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isSaved
                ? 'bg-[#36D67E]/15 text-[#36D67E] border-[#36D67E]/40'
                : 'backdrop-blur-md bg-[#202027]/80 border-white/[0.10] text-[#E5E5EA] hover:bg-white/[0.08]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Bookmarked' : 'Save Report'}</span>
          </button>

          <button
            onClick={() => setIsCompareOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md bg-[#202027]/80 border border-white/[0.10] text-[#70D7FF] hover:bg-white/[0.08] transition-all"
          >
            <GitCompare className="w-3.5 h-3.5 text-[#70D7FF]" />
            <span>Compare Diff</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md bg-[#202027]/80 border border-white/[0.10] text-[#E5E5EA] hover:bg-white/[0.08] transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#8C7BFF] hover:bg-[#7b68ff] text-white shadow-[0_4px_16px_rgba(140,123,255,0.35)] transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Dossier Result Card (Smoked Glass Shard) */}
      <div className="glass-shard p-6 sm:p-8 print:border-white/40 print:shadow-none print:break-inside-avoid">
        {/* Header row: IP + Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#A0A0AA] font-mono">
                Target IP Address
              </span>
              {report.is_demo ? (
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#F0B45C]/15 text-[#F0B45C] border border-[#F0B45C]/30">
                  DEMO DATA / SIMULATED
                </span>
              ) : (
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#36D67E]/15 text-[#36D67E] border border-[#36D67E]/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#36D67E] animate-pulse" /> LIVE SENSOR INTELLIGENCE
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-mono text-white tracking-tight">
              {report.ip_address}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-mono text-[#A0A0AA]">
              <span className="px-2 py-0.5 rounded-md bg-[#202027] border border-white/[0.08] text-white font-bold">
                IPv{report.ip_version}
              </span>
              <span>•</span>
              <span>{report.is_public ? 'Public Routable Address' : 'Non-Public Address'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#70D7FF]" />
                {report.processing_time_ms} ms pipeline duration
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <span className="text-xs text-[#A0A0AA] font-mono font-semibold uppercase tracking-wider">Predicted Network Type</span>
            <div
              className={`px-4 py-2 rounded-xl text-sm font-extrabold font-mono border ${catBadgeColor}`}
            >
              {report.network_type}
            </div>
          </div>
        </div>

        {/* 3 Core Metric Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          {/* Classifier Confidence Score */}
          <div className="p-4 rounded-xl bg-[#202027]/70 border border-white/[0.08] relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A0A0AA] font-mono">
                Classifier Confidence
              </span>
              <Tooltip content="Heuristic rule-fusion score (0-100) reflecting multi-source consensus and conflict penalties. Not a statistical probability." />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                {report.confidence_score}
              </span>
              <span className="text-xs font-bold text-[#777782] font-mono">/ 100</span>
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wider ml-auto px-2.5 py-0.5 rounded-full ${
                  report.confidence_score >= 70
                    ? 'bg-[#36D67E]/15 text-[#36D67E] border border-[#36D67E]/30'
                    : report.confidence_score >= 50
                    ? 'bg-[#F0B45C]/15 text-[#F0B45C] border border-[#F0B45C]/30'
                    : 'bg-[#FF626E]/15 text-[#FF626E] border border-[#FF626E]/30'
                }`}
              >
                {report.confidence_level}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-[#17171B] h-2 rounded-full mt-3 overflow-hidden border border-white/[0.05]">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  report.confidence_score >= 70
                    ? 'bg-[#36D67E]'
                    : report.confidence_score >= 50
                    ? 'bg-[#F0B45C]'
                    : 'bg-[#FF626E]'
                }`}
                style={{ width: `${report.confidence_score}%` }}
              />
            </div>
            <p className="text-[10px] text-[#777782] mt-2 font-mono leading-tight">
              Rule-fusion score; calibrated consensus model.
            </p>
          </div>

          {/* Evidence Quality */}
          <div className="p-4 rounded-xl bg-[#202027]/70 border border-white/[0.08]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A0A0AA] font-mono">
                Evidence Quality
              </span>
              <Tooltip content="Independent of confidence score. Assesses evidence breadth across distinct source families, freshness, and absence of sensor errors." />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {report.evidence_quality}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-[#8C7BFF] ml-auto px-2 py-0.5 rounded bg-[#8C7BFF]/10 border border-[#8C7BFF]/25">
                {report.evidence.filter((e) => e.status !== 'error').length} signals
              </span>
            </div>
            <p className="text-[11px] text-[#A0A0AA] mt-2 font-mono">
              Spans {new Set(report.evidence.map((e) => e.source)).size} sensor sources ({report.evidence.filter((e) => e.status === 'error').length} errors)
            </p>
          </div>

          {/* Conflict Count */}
          <div className="p-4 rounded-xl bg-[#202027]/70 border border-white/[0.08]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A0A0AA] font-mono">
                Signal Contradictions
              </span>
              <Tooltip content="Disagreements between reverse DNS, ASN registration, or BGP announcements." />
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl sm:text-3xl font-extrabold font-mono ${
                  report.conflicts.length > 0 ? 'text-[#F0B45C]' : 'text-[#36D67E]'
                }`}
              >
                {report.conflicts.length}
              </span>
              <span className="text-xs text-[#777782] font-mono">conflicts detected</span>
            </div>
            <p className="text-[11px] text-[#A0A0AA] mt-2 font-mono">
              {report.conflicts.length === 0
                ? 'Complete cross-source agreement'
                : 'Audited and calibrated into scoring'}
            </p>
          </div>
        </div>

        {/* Quick Entity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 py-4 border-t border-b border-white/[0.08] text-xs font-mono">
          <div>
            <span className="text-[#777782] text-[11px]">Origin ASN:</span>
            <p className="font-bold text-white mt-0.5">
              {report.asn || 'None / Unannounced'}
            </p>
          </div>
          <div>
            <span className="text-[#777782] text-[11px]">Network Operator:</span>
            <p className="font-semibold text-white mt-0.5 truncate">
              {report.org_name || 'Unregistered Org'}
            </p>
          </div>
          <div>
            <span className="text-[#777782] text-[11px]">BGP Subnet Prefix:</span>
            <p className="font-bold text-white mt-0.5">
              {report.prefix || 'None / Not Advertised'}
            </p>
          </div>
          <div>
            <span className="text-[#777782] text-[11px]">Reverse DNS Hostname:</span>
            <p className="text-white mt-0.5 truncate" title={report.hostname}>
              {report.hostname || 'None (No PTR)'}
            </p>
          </div>
        </div>
      </div>

      {/* "Why did we get this result?" Plain-English Narrative */}
      <div className="glass-shard p-6 sm:p-8 relative print:break-inside-avoid">
        <div className="flex items-center gap-2 mb-5">
          <span className="p-2 rounded-xl bg-[#8C7BFF]/15 border border-[#8C7BFF]/30 text-[#8C7BFF]">
            <Cpu className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-bold text-white text-base sm:text-lg">
              Why did we get this result?
            </h3>
            <p className="text-xs text-[#A0A0AA] font-mono">
              Plain-English step-by-step reasoning breakdown for transparent forensic auditing.
            </p>
          </div>
        </div>

        {/* Executive Summary Callout */}
        <div className="p-4 rounded-xl bg-[#8C7BFF]/10 border border-[#8C7BFF]/30 mb-6">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#B9ABFF] uppercase tracking-wider mb-1">
            <FileText className="w-3.5 h-3.5 text-[#8C7BFF]" /> Executive Summary
          </div>
          <p className="text-xs sm:text-sm text-[#E5E5EA] font-medium leading-relaxed">
            {report.summary}
          </p>
        </div>

        {/* Formatted Markdown Explanation */}
        <div className="text-xs sm:text-sm text-[#E5E5EA] space-y-3 leading-relaxed font-sans">
          <Markdown
            components={{
              h3: ({ node, ...props }) => (
                <h3 className="text-base font-bold text-white mt-5 mb-2 first:mt-0 font-mono" {...props} />
              ),
              h4: ({ node, ...props }) => (
                <h4 className="text-sm font-semibold text-white mt-4 mb-1" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="text-[#E5E5EA] leading-relaxed my-1.5" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-5 space-y-1.5 my-2 text-[#A0A0AA]" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="text-[#E5E5EA]" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="p-3.5 my-3 rounded-xl bg-[#202027]/70 border-l-4 border-[#8C7BFF] text-xs text-[#A0A0AA] italic"
                  {...props}
                />
              ),
              strong: ({ node, ...props }) => (
                <strong className="font-bold text-white" {...props} />
              ),
              code: ({ node, ...props }) => (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-[#202027] font-mono text-xs text-[#70D7FF] border border-white/[0.08]"
                  {...props}
                />
              ),
            }}
          >
            {report.explanation}
          </Markdown>
        </div>
      </div>

      {/* Methodology Scope & Operational Limitations */}
      <div className="glass-shard p-6 sm:p-7 relative print:break-inside-avoid">
        <div className="flex items-center gap-2 mb-4">
          <span className="p-2 rounded-xl bg-[#F0B45C]/15 border border-[#F0B45C]/30 text-[#F0B45C]">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-bold text-white text-base">
              Methodology Scope & Operational Limitations
            </h3>
            <p className="text-xs text-[#A0A0AA] font-mono">
              Heuristic bounds, dynamic address reallocation, and recommended forensic verification steps.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-[#202027]/70 border border-white/[0.08] space-y-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F0B45C]" />
              Dynamic IP Reassignment (DHCP)
            </span>
            <p className="text-[#A0A0AA] leading-relaxed text-[11px] font-sans">
              Residential and mobile subscriber addresses rotate over variable DHCP lease periods. This classification reflects multi-source routing telemetry captured at query time.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#202027]/70 border border-white/[0.08] space-y-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F0B45C]" />
              Stale or Unconfigured Reverse DNS (PTR)
            </span>
            <p className="text-[#A0A0AA] leading-relaxed text-[11px] font-sans">
              Reverse DNS depends on network operator record maintenance. Missing PTR entries lower evidence completeness scores but do not falsify authoritative BGP announcements.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#202027]/70 border border-white/[0.08] space-y-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F0B45C]" />
              Shared CDNs & Anycast Clouds
            </span>
            <p className="text-[#A0A0AA] leading-relaxed text-[11px] font-sans">
              Datacenter-hosted edge proxies (e.g. Cloudflare, Fastly, AWS CloudFront) terminate client requests globally, presenting datacenter infrastructure for content delivery.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#202027]/70 border border-white/[0.08] space-y-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F0B45C]" />
              Carrier-Grade NAT (CGNAT) Aggregation
            </span>
            <p className="text-[#A0A0AA] leading-relaxed text-[11px] font-sans">
              Cellular and rural broadband carriers route thousands of subscribers through shared IPv4 NAT gateways (RFC 6598), aggregating multiple mobile handsets behind single addresses.
            </p>
          </div>
        </div>

        {/* Verification guidance */}
        <div className="mt-4 p-3 rounded-xl bg-[#8C7BFF]/10 border border-[#8C7BFF]/25 text-[11px] text-[#B9ABFF] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#8C7BFF] shrink-0 mt-0.5" />
          <p className="leading-relaxed font-sans">
            <strong className="font-semibold text-white">Recommended Forensic Verification:</strong> For high-stakes incident response, corroborate this classification using active traceroute TTL hops, historical WHOIS registration changes, and internal network telemetry logs.
          </p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050507]/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-shard w-full max-w-md p-6 sm:p-7 shadow-2xl border-[#8C7BFF]/30">
            <h3 className="text-base font-bold text-white mb-1 font-mono">
              Save Analysis Snapshot
            </h3>
            <p className="text-xs text-[#A0A0AA] mb-4 font-mono">
              Bookmark this report in your local database for future comparisons and auditing.
            </p>

            <div className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block font-bold text-white mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.10] bg-[#202027] text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#8C7BFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-white mb-1">
                  Investigation Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={saveNotes}
                  placeholder="e.g. Verified residential subscriber IP during incident response."
                  onChange={(e) => setSaveNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.10] bg-[#202027] text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#8C7BFF]"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A0A0AA] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReport}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#8C7BFF] hover:bg-[#7b68ff] text-white shadow-sm transition-colors"
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
