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
            <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
              <Search className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Investigate Target IP
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Multi-source rule-fusion engine. Interrogates BGP routing tables, ASN registries, and DNS naming conventions.
          </p>
        </div>

        {/* Mode Selector Radio Pills */}
        <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium">
          <button
            onClick={() => setIsDemoMode(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              !isDemoMode
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Sensors</span>
          </button>
          <button
            onClick={() => setIsDemoMode(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              isDemoMode
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Evaluator Demo</span>
          </button>
        </div>
      </div>

      {/* Main Analysis Console Card */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-7 shadow-sm">
        {/* Active Mode Notice Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isDemoMode ? 'bg-blue-600' : 'bg-emerald-500'
              }`}
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {isDemoMode ? 'Evaluator Demo Suite Active' : 'Live External Intelligence Active'}
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {isDemoMode
                ? '• Transparent ground-truth simulation for evaluation'
                : '• Direct live queries to RIPEstat BGP & DNS PTR'}
            </span>
          </div>

          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Engine: PS-010-v1.2
          </span>
        </div>

        {/* Input Form */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Target IP Address (IPv4 / IPv6)
            </label>
            <span className="text-[11px] text-slate-400 font-mono">RFC 1918 / 6598 Safe</span>
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
                className="w-full pl-4 pr-16 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white font-mono text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
              {ipInput && (
                <button
                  onClick={() => {
                    setIpInput('');
                    setValidationResult(null);
                    setError(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              onClick={() => handleAnalyze()}
              disabled={isProcessing || !ipInput.trim()}
              className="px-6 py-2.5 rounded-lg font-medium text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shrink-0"
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
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
          <div className="mt-6 p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                Evidence Harvesting Pipeline
              </h4>
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 font-semibold">
                Stage {currentStage} of 5
              </span>
            </div>

            {/* Solid progress bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mb-4 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(currentStage / 5) * 100}%` }}
              />
            </div>

            <div className="space-y-2">
              {stages.map((stage) => {
                const isCompleted = currentStage > stage.id;
                const isCurrent = currentStage === stage.id;

                return (
                  <div
                    key={stage.id}
                    className={`p-2.5 rounded-lg border transition-colors flex items-center justify-between gap-3 text-xs ${
                      isCurrent
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
                        : isCompleted
                        ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        : 'bg-transparent border-slate-200 dark:border-slate-800/40 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-semibold text-xs shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : stage.id}
                      </div>

                      <div>
                        <span
                          className={`font-semibold ${
                            isCurrent
                              ? 'text-blue-700 dark:text-blue-300'
                              : isCompleted
                              ? 'text-slate-900 dark:text-white'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {stage.title}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                          {stage.desc}
                        </p>
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-medium shrink-0">
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
        <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Curated Evaluator Test Cases
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click any scenario below to auto-populate and test specific network conditions.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
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
                  className="p-3 text-left rounded-lg bg-slate-50 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {preset.badge}
                      </span>
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {preset.ip}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {preset.label}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{preset.type}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
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
