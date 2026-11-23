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
  RotateCcw
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

  // Check URL params on load (e.g. from Dashboard quick search)
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
    { label: 'Residential Broadband', ip: '73.168.45.112', type: 'Residential', badge: 'Clear Signals', icon: Home, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Cloud Datacenter', ip: '54.214.12.89', type: 'Hosting / Datacenter', badge: 'AWS EC2', icon: Server, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { label: 'University Campus', ip: '18.178.2.55', type: 'Enterprise / Campus', badge: 'MIT Research', icon: Building, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { label: 'Mobile Carrier APN', ip: '174.216.78.90', type: 'Mobile', badge: 'Verizon APN', icon: Smartphone, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Conflicting Signals', ip: '198.54.117.44', type: 'Disagreement', badge: 'Host vs ISP', icon: Flame, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { label: 'Insufficient Evidence', ip: '192.0.2.1', type: 'Unknown', badge: 'Unrouted Block', icon: HelpCircle, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
    { label: 'Private Local IP', ip: '192.168.1.1', type: 'Private RFC 1918', badge: 'Zero External Leaks', icon: ShieldAlert, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { label: 'Provider Resilience', ip: '104.244.42.1', type: 'Hosting', badge: 'Outage Fallback', icon: Zap, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
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
      // Handled silently during live typing
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
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
              <Search className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Investigate Target IP
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Multi-source rule-fusion engine. Interrogates BGP tables, ASN registries, and DNS naming conventions.
          </p>
        </div>

        {/* Mode Selector Radio Pills */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setIsDemoMode(false)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              !isDemoMode
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Sensors</span>
          </button>
          <button
            onClick={() => setIsDemoMode(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              isDemoMode
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Evaluator Demo</span>
          </button>
        </div>
      </div>

      {/* Main Analysis Console Card */}
      <div className="cyber-card p-6 sm:p-8 relative overflow-hidden">
        {/* Active Mode Notice Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800/80 gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isDemoMode ? 'bg-cyan-500 animate-pulse' : 'bg-emerald-500 animate-ping'
              }`}
            />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isDemoMode ? 'Evaluator Demo Suite Active' : 'Live External Intelligence Active'}
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {isDemoMode
                ? '• Transparent ground-truth simulation for hackathon jury'
                : '• Direct live queries to RIPEstat BGP & DNS PTR'}
            </span>
          </div>

          <span className="font-mono text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Engine: PS-010-v1.2
          </span>
        </div>

        {/* High-Tech Terminal Command Input */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="text-cyan-500">&gt;</span> Target IP Address (IPv4 / IPv6)
            </label>
            <span className="text-[11px] text-slate-400 font-mono">RFC 1918 / 6598 Protected</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <input
                type="text"
                placeholder="e.g. 73.168.45.112 or 2001:4860:4860::8888"
                value={ipInput}
                disabled={isProcessing}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isProcessing && handleAnalyze()}
                className="w-full pl-4 pr-16 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#070D1E] text-slate-900 dark:text-white font-mono text-sm placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15 transition-all shadow-inner"
              />
              {ipInput && (
                <button
                  onClick={() => {
                    setIpInput('');
                    setValidationResult(null);
                    setError(null);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-[11px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              onClick={() => handleAnalyze()}
              disabled={isProcessing || !ipInput.trim()}
              className="px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 shrink-0 font-mono"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-cyan-200" />
                  <span>Analyze IP</span>
                </>
              )}
            </button>
          </div>

          {/* Real-time Inline Validation Message */}
          {validationResult && (
            <div
              className={`p-3.5 rounded-2xl text-xs border flex items-start gap-3 animate-in fade-in ${
                !validationResult.is_valid
                  ? 'bg-rose-50/80 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
                  : !validationResult.is_public
                  ? 'bg-amber-50/80 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50'
                  : 'bg-emerald-50/80 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50'
              }`}
            >
              {!validationResult.is_valid ? (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              ) : !validationResult.is_public ? (
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-extrabold font-mono">
                    {!validationResult.is_valid
                      ? 'Malformed IP Address'
                      : !validationResult.is_public
                      ? `Non-Public Scope (${validationResult.category.toUpperCase()})`
                      : `Valid Public IPv${validationResult.version}`}
                  </p>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
                    Checked
                  </span>
                </div>
                <p className="mt-1 text-[11px] opacity-90 leading-relaxed font-sans">{validationResult.explanation}</p>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-2xl text-xs bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <div>
                  <span className="font-extrabold">Analysis Notice: </span>
                  <span>{error}</span>
                </div>
              </div>
              {!isDemoMode && (
                <button
                  onClick={() => {
                    setIsDemoMode(true);
                    handleAnalyze(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-[11px] shrink-0 hover:bg-blue-500 transition-colors shadow-sm"
                >
                  Switch to Demo Mode
                </button>
              )}
            </div>
          )}
        </div>

        {/* 5-Stage Processing Indicator */}
        {isProcessing && (
          <div className="mt-8 p-6 rounded-3xl bg-white dark:bg-[#070D1E]/90 border border-blue-200 dark:border-cyan-500/30 shadow-xl shadow-blue-500/5 dark:shadow-cyan-950/20 animate-in fade-in">
            <div className="flex items-center justify-between mb-5">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                <Cpu className="w-4 h-4 text-cyan-500 animate-spin" />
                Live Rule-Fusion Processing Pipeline
              </h4>
              <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                Stage {currentStage} of 5
              </span>
            </div>

            {/* Glowing progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mb-5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(currentStage / 5) * 100}%` }}
              />
            </div>

            <div className="space-y-3">
              {stages.map((stage) => {
                const isCompleted = currentStage > stage.id;
                const isCurrent = currentStage === stage.id;
                const Icon = stage.icon;

                return (
                  <div
                    key={stage.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                      isCurrent
                        ? 'bg-cyan-50/80 dark:bg-cyan-950/30 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                        : isCompleted
                        ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80'
                        : 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-200/50 dark:border-slate-800/40 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : isCurrent
                            ? 'bg-cyan-500 text-white animate-pulse'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4" /> : stage.id}
                      </div>

                      <div>
                        <span
                          className={`font-bold ${
                            isCurrent
                              ? 'text-cyan-700 dark:text-cyan-300'
                              : isCompleted
                              ? 'text-slate-900 dark:text-white'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {stage.title}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
                          {stage.desc}
                        </p>
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400 animate-pulse shrink-0">
                        Analyzing...
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Preset IP Cards Grid */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                Curated Evaluator Test Cases
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click any scenario below to auto-populate and test specific network conditions.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
              8 Verified Cases
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
                  disabled={isProcessing}
                  className="p-3.5 text-left rounded-2xl bg-slate-50/70 dark:bg-[#070D1E]/90 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/50 hover:shadow-glow-cyan transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${preset.color}`}>
                        {preset.badge}
                      </span>
                      <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <div className="font-mono text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors">
                      {preset.ip}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
                      {preset.label}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{preset.type}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
