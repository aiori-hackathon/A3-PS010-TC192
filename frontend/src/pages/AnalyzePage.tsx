import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Cpu,
  Layers,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Flame,
  Globe,
  Zap,
  Server,
  Smartphone,
  Building,
  Home,
  Check,
  RotateCcw,
  Terminal,
} from 'lucide-react';
import { api } from '../services/api';
import { IPValidationResult, AnalysisResponse } from '../types';

export const AnalyzePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [ipInput, setIpInput] = useState<string>('');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<IPValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ipFromUrl = searchParams.get('ip');
    if (ipFromUrl) {
      setIpInput(ipFromUrl);
      handleInputChange(ipFromUrl);
    }
  }, [searchParams]);

  const stages = [
    { id: 1, title: 'Validating IP address', desc: 'Verifying IPv4/IPv6 syntax & RFC network scope', icon: ShieldAlert },
    { id: 2, title: 'Collecting available evidence', desc: 'Querying BGP routing tables, ASN registries & DNS PTR', icon: Globe },
    { id: 3, title: 'Checking evidence quality', desc: 'Evaluating source credibility, record freshness & coverage', icon: Layers },
    { id: 4, title: 'Comparing signals', desc: 'Cross-referencing operator keywords & identifying conflicts', icon: Cpu },
    { id: 5, title: 'Generating report', desc: 'Constructing explainable narrative & entity topology graph', icon: Sparkles },
  ];

  const presets = [
    { label: 'Residential Broadband', ip: '73.168.45.112', type: 'Residential', badge: 'Clear Signals', icon: Home, color: 'text-[#70D7FF] bg-[#70D7FF]/10 border-[#70D7FF]/30' },
    { label: 'Cloud Datacenter', ip: '54.214.12.89', type: 'Hosting / Datacenter', badge: 'AWS EC2', icon: Server, color: 'text-[#8C7BFF] bg-[#8C7BFF]/10 border-[#8C7BFF]/30' },
    { label: 'University Campus', ip: '18.178.2.55', type: 'Enterprise / Campus', badge: 'MIT Research', icon: Building, color: 'text-[#B9ABFF] bg-[#B9ABFF]/10 border-[#B9ABFF]/30' },
    { label: 'Mobile Carrier APN', ip: '174.216.78.90', type: 'Mobile', badge: 'Verizon APN', icon: Smartphone, color: 'text-[#36D67E] bg-[#36D67E]/10 border-[#36D67E]/30' },
    { label: 'Conflicting Signals', ip: '198.54.117.44', type: 'Disagreement', badge: 'Host vs ISP', icon: Flame, color: 'text-[#F0B45C] bg-[#F0B45C]/10 border-[#F0B45C]/30' },
    { label: 'Insufficient Evidence', ip: '192.0.2.1', type: 'Unknown', badge: 'Unrouted Block', icon: HelpCircle, color: 'text-[#A0A0AA] bg-[#202027] border-white/[0.10]' },
    { label: 'Private Local IP', ip: '192.168.1.1', type: 'Private RFC 1918', badge: 'Zero External Leaks', icon: ShieldAlert, color: 'text-[#FF626E] bg-[#FF626E]/10 border-[#FF626E]/30' },
    { label: 'Provider Resilience', ip: '104.244.42.1', type: 'Hosting', badge: 'Outage Fallback', icon: Zap, color: 'text-[#70D7FF] bg-[#70D7FF]/10 border-[#70D7FF]/30' },
  ];

  const handleInputChange = async (val: string) => {
    setIpInput(val);
    setError(null);
    if (!val.trim()) {
      setValidationResult(null);
      return;
    }
    try {
      const res = await api.validateIp(val.trim());
      setValidationResult(res);
    } catch {
      // silent
    }
  };

  const handleAnalyze = async (overrideDemoMode?: boolean) => {
    const clean = ipInput.trim();
    if (!clean) {
      setError('Please enter a valid IPv4 or IPv6 address to analyze.');
      return;
    }

    const activeDemo = overrideDemoMode !== undefined ? overrideDemoMode : isDemoMode;
    setIsProcessing(true);
    setError(null);
    setCurrentStage(1);

    const timer2 = setTimeout(() => setCurrentStage(2), 250);
    const timer3 = setTimeout(() => setCurrentStage(3), 500);
    const timer4 = setTimeout(() => setCurrentStage(4), 750);

    try {
      const val = await api.validateIp(clean);
      setValidationResult(val);
      if (!val.is_valid) {
        throw new Error(val.explanation);
      }

      const res: AnalysisResponse = await api.analyzeIp({
        ip_address: clean,
        force_demo: activeDemo,
      });

      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      setCurrentStage(5);

      setTimeout(() => {
        if (res.id) {
          navigate(`/report/${res.id}`);
        }
      }, 350);
    } catch (err: any) {
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      setError(err.message || 'An error occurred during analysis.');
      setIsProcessing(false);
      setCurrentStage(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7 animate-in fade-in duration-300">
      {/* Title & Explainer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#8C7BFF]/15 border border-[#8C7BFF]/30 text-[#B9ABFF]">
              <Search className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Investigate Target IP
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#A0A0AA]">
            Multi-source rule-fusion engine. Interrogates BGP routing tables, ASN registries, and DNS naming conventions.
          </p>
        </div>

        {/* Mode Selector Radio Pills */}
        <div className="flex items-center p-1 rounded-xl backdrop-blur-md bg-[#17171B]/80 border border-white/[0.10] text-xs font-medium">
          <button
            onClick={() => setIsDemoMode(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-mono ${
              !isDemoMode
                ? 'bg-[#202027] text-white shadow-xs font-semibold border border-white/[0.12]'
                : 'text-[#A0A0AA] hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Sensors</span>
          </button>
          <button
            onClick={() => setIsDemoMode(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-mono ${
              isDemoMode
                ? 'bg-[#8C7BFF] text-white shadow-xs font-semibold'
                : 'text-[#A0A0AA] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Evaluator Demo</span>
          </button>
        </div>
      </div>

      {/* Main Analysis Console Glass Shard */}
      <div className="glass-shard p-5 sm:p-7">
        {/* Active Mode Notice Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-white/[0.08] gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isDemoMode ? 'bg-[#8C7BFF]' : 'bg-[#36D67E]'
              }`}
            />
            <span className="text-xs font-semibold text-white">
              {isDemoMode ? 'Evaluator Demo Suite Active' : 'Live External Intelligence Active'}
            </span>
            <span className="text-[11px] text-[#A0A0AA] hidden sm:inline">
              {isDemoMode
                ? '• Transparent ground-truth simulation for evaluation'
                : '• Direct live queries to RIPEstat BGP & DNS PTR'}
            </span>
          </div>

          <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-lg backdrop-blur-md bg-[#202027] text-[#8C7BFF] border border-white/[0.08]">
            Engine: Rule-Fusion v1.2
          </span>
        </div>

        {/* Input Form */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Target IP Address (IPv4 / IPv6)
            </label>
            <span className="text-[11px] text-[#36D67E] font-mono">RFC 1918 / 6598 Safe</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="e.g. 73.168.45.112 or 2001:4860:4860::8888"
                value={ipInput}
                disabled={isProcessing}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isProcessing && handleAnalyze()}
                className="w-full pl-4 pr-16 py-3 rounded-xl glass-input text-sm font-mono placeholder-[#777782]"
              />
              {ipInput && (
                <button
                  onClick={() => {
                    setIpInput('');
                    setValidationResult(null);
                    setError(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[11px] font-mono text-[#777782] hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              onClick={() => handleAnalyze()}
              disabled={isProcessing || !ipInput.trim()}
              className="px-6 py-3 rounded-xl font-medium text-xs bg-gradient-to-r from-[#8C7BFF] to-[#70D7FF] hover:opacity-95 text-white shadow-[0_4px_24px_rgba(140,123,255,0.35)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shrink-0 font-mono tracking-wide"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Analyze IP</span>
                </>
              )}
            </button>
          </div>

          {/* Inline Live Validation Banner */}
          {validationResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-mono flex items-start gap-2.5 transition-all ${
                validationResult.is_valid
                  ? !validationResult.is_public
                    ? 'bg-[#F0B45C]/10 border-[#F0B45C]/30 text-[#F0B45C]'
                    : 'bg-[#36D67E]/10 border-[#36D67E]/30 text-[#36D67E]'
                  : 'bg-[#FF626E]/10 border-[#FF626E]/30 text-[#FF626E]'
              }`}
            >
              {validationResult.is_valid ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-semibold block">
                  {validationResult.is_valid
                    ? `${validationResult.category || (validationResult.is_public ? 'Public IP' : 'Private IP')} Syntax Verified`
                    : 'Invalid Target Address'}
                </span>
                <span className="text-[11px] opacity-90 block mt-0.5">
                  {validationResult.explanation}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-[#FF626E]/10 border border-[#FF626E]/30 text-[#FF626E] text-xs font-mono">
              {error}
            </div>
          )}
        </div>

        {/* 5-Stage Live Investigation Progress Pipeline */}
        {isProcessing && (
          <div className="mt-6 pt-5 border-t border-white/[0.08] space-y-3">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#8C7BFF] block">
              Multi-Source Synthesis in Progress
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {stages.map((stage) => {
                const Icon = stage.icon;
                const isDone = currentStage > stage.id;
                const isCurr = currentStage === stage.id;
                return (
                  <div
                    key={stage.id}
                    className={`p-2.5 rounded-xl border text-xs transition-all ${
                      isDone
                        ? 'bg-[#36D67E]/10 border-[#36D67E]/40 text-[#36D67E]'
                        : isCurr
                        ? 'bg-[#8C7BFF]/15 border-[#8C7BFF]/50 text-white shadow-[0_0_16px_rgba(140,123,255,0.2)]'
                        : 'bg-[#202027]/40 border-white/[0.06] text-[#777782]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 font-mono">
                      {isDone ? (
                        <Check className="w-3.5 h-3.5 text-[#36D67E]" />
                      ) : isCurr ? (
                        <div className="w-2 h-2 rounded-full bg-[#8C7BFF] animate-ping" />
                      ) : (
                        <span className="text-[10px]">{stage.id}</span>
                      )}
                      <span className="text-[10px] font-semibold truncate">{stage.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Preset Evaluation Scenarios Glass Shards */}
      <div className="glass-shard p-5 sm:p-7">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white text-sm">
              Benchmark & Verification Scenarios
            </h3>
            <p className="text-xs text-[#A0A0AA] mt-0.5">
              Select verified test vectors to observe rule-fusion behavior across operational networks.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#8C7BFF] hidden sm:inline">
            1-Click Interrogation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.ip}
                onClick={() => {
                  setIpInput(preset.ip);
                  handleInputChange(preset.ip);
                }}
                className="p-3.5 rounded-xl backdrop-blur-md bg-[#202027]/50 border border-white/[0.08] hover:border-[#8C7BFF]/40 hover:bg-[#202027]/80 hover:shadow-[0_8px_24px_rgba(140,123,255,0.12)] text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg border ${preset.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#17171B] border border-white/[0.08] text-[#A0A0AA]">
                    {preset.badge}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-white group-hover:text-[#8C7BFF] transition-colors">
                  {preset.label}
                </h4>
                <p className="font-mono text-[11px] text-[#A0A0AA] mt-1 truncate">
                  {preset.ip}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
