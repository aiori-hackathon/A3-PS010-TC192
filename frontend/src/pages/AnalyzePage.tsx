import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Flame
} from 'lucide-react';
import { api } from '../services/api';
import { IPValidationResult, AnalysisResponse } from '../types';
import { Tooltip } from '../components/Tooltip';

export const AnalyzePage: React.FC = () => {
  const [ipInput, setIpInput] = useState<string>('');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<IPValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const stages = [
    { id: 1, title: 'Validating IP address', desc: 'Verifying IPv4/IPv6 syntax & RFC network scope' },
    { id: 2, title: 'Collecting available evidence', desc: 'Querying BGP routing tables, ASN registries & DNS PTR' },
    { id: 3, title: 'Checking evidence quality', desc: 'Evaluating source credibility, record freshness & coverage' },
    { id: 4, title: 'Comparing signals', desc: 'Cross-referencing operator keywords & identifying conflicts' },
    { id: 5, title: 'Generating report', desc: 'Constructing explainable narrative & entity graph' },
  ];

  const presets = [
    { label: 'Residential Broadband', ip: '73.168.45.112', type: 'Residential', badge: 'Clear Signals' },
    { label: 'Cloud Datacenter', ip: '54.214.12.89', type: 'Hosting / Datacenter', badge: 'AWS EC2' },
    { label: 'University Campus', ip: '18.178.2.55', type: 'Enterprise / Campus', badge: 'MIT Research' },
    { label: 'Mobile Carrier APN', ip: '174.216.78.90', type: 'Mobile', badge: 'Verizon APN' },
    { label: 'Conflicting Signals', ip: '198.54.117.44', type: 'Disagreement', badge: 'Host vs ISP' },
    { label: 'Insufficient Evidence', ip: '192.0.2.1', type: 'Unknown', badge: 'Unrouted Block' },
    { label: 'Private Local IP', ip: '192.168.1.1', type: 'Private RFC 1918', badge: 'Internal Only' },
    { label: 'Provider Resilience', ip: '104.244.42.1', type: 'Hosting', badge: 'Outage Fallback' },
  ];

  const handleInputChange = async (val: string) => {
    setIpInput(val);
    setError(null);
    if (!val.trim()) {
      setValidationResult(null);
      return;
    }
    // Quick live client validation
    try {
      const res = await api.validateIp(val.trim());
      setValidationResult(res);
    } catch {
      // Ignored during typing
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

    // Staged visual feedback timers
    const timer2 = setTimeout(() => setCurrentStage(2), 250);
    const timer3 = setTimeout(() => setCurrentStage(3), 500);
    const timer4 = setTimeout(() => setCurrentStage(4), 750);

    try {
      // Step 1: Client/Server IP validation
      const val = await api.validateIp(clean);
      setValidationResult(val);
      if (!val.is_valid) {
        throw new Error(val.explanation);
      }

      // Step 2: Main analysis call
      const res: AnalysisResponse = await api.analyzeIp({
        ip_address: clean,
        force_demo: activeDemo,
      });

      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      setCurrentStage(5);

      // Navigate to full explainable report
      setTimeout(() => {
        if (res.id) {
          navigate(`/report/${res.id}`);
        }
      }, 300);
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
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      {/* Title & Explainer */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Analyze IP Address
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Enter an IP to classify its network type using transparent multi-source evidence fusion.
        </p>
      </div>

      {/* Main Analysis Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* Demo Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isDemoMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isDemoMode ? 'Evaluator Demo Suite Active' : 'Live Sensor Mode'}
            </span>
            <span className="text-[11px] text-slate-400">
              {isDemoMode
                ? '(Serves high-fidelity simulated test cases for hackathon evaluators)'
                : '(Queries real live RIPEstat and DNS sensors)'}
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isDemoMode}
              onChange={(e) => setIsDemoMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              Demo Mode
            </span>
          </label>
        </div>

        {/* Input Bar */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Target IP Address (IPv4 or IPv6)
          </label>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="e.g. 73.168.45.112 or 2001:4860:4860::8888"
                value={ipInput}
                disabled={isProcessing}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isProcessing && handleAnalyze()}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-mono text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {ipInput && (
                <button
                  onClick={() => {
                    setIpInput('');
                    setValidationResult(null);
                    setError(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              onClick={() => handleAnalyze()}
              disabled={isProcessing || !ipInput.trim()}
              className="px-7 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shrink-0"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Analyze IP</span>
                </>
              )}
            </button>
          </div>

          {/* Real-time Inline Validation Message */}
          {validationResult && (
            <div
              className={`p-3 rounded-xl text-xs border flex items-start gap-2.5 ${
                !validationResult.is_valid
                  ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                  : !validationResult.is_public
                  ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              }`}
            >
              {!validationResult.is_valid ? (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              ) : !validationResult.is_public ? (
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">
                  {!validationResult.is_valid
                    ? 'Malformed IP Address'
                    : !validationResult.is_public
                    ? `Non-Public Scope (${validationResult.category.toUpperCase()})`
                    : `Valid Public IPv${validationResult.version}`}
                </p>
                <p className="mt-0.5 text-[11px] opacity-90">{validationResult.explanation}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl text-xs bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <div>
                  <span className="font-bold">Analysis Notice: </span>
                  <span>{error}</span>
                </div>
              </div>
              {!isDemoMode && (
                <button
                  onClick={() => {
                    setIsDemoMode(true);
                    handleAnalyze(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-[11px] shrink-0 hover:bg-blue-500 transition-colors"
                >
                  Switch to Demo Mode
                </button>
              )}
            </div>
          )}
        </div>

        {/* 5-Stage Processing Indicator */}
        {isProcessing && (
          <div className="mt-8 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 animate-in fade-in">
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600 animate-spin" />
              Real Processing Stages:
            </h4>

            <div className="space-y-3">
              {stages.map((stage) => {
                const isCompleted = currentStage > stage.id;
                const isCurrent = currentStage === stage.id;

                return (
                  <div key={stage.id} className="flex items-center gap-3 text-xs">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 animate-pulse'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : stage.id}
                    </div>

                    <div className="flex-1">
                      <span
                        className={`font-semibold ${
                          isCurrent
                            ? 'text-blue-600 dark:text-blue-400'
                            : isCompleted
                            ? 'text-slate-800 dark:text-slate-200'
                            : 'text-slate-400'
                        }`}
                      >
                        {stage.title}
                      </span>
                      <span className="hidden sm:inline text-slate-400 text-[11px] ml-2">
                        — {stage.desc}
                      </span>
                    </div>

                    {isCurrent && (
                      <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 animate-pulse">
                        Analyzing...
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Preset IP Cards */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Quick Test Cases for Evaluators:
            </h4>
            <span className="text-[11px] text-slate-400">Click any card to auto-fill</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {presets.map((preset) => (
              <button
                key={preset.ip}
                onClick={() => {
                  setIpInput(preset.ip);
                  handleInputChange(preset.ip);
                }}
                disabled={isProcessing}
                className="p-3 text-left rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-400 dark:hover:border-blue-500 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {preset.badge}
                  </span>
                  <span className="text-[10px] text-slate-400">{preset.type}</span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                  {preset.ip}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {preset.label}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
