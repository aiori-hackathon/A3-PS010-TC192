import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  Activity,
  Layers,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  ExternalLink,
  Award,
  Sparkles,
  Zap,
  Globe,
  Radio,
  Fingerprint
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { api } from '../services/api';
import { DashboardStats } from '../types';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [quickIp, setQuickIp] = useState<string>('');
  const navigate = useNavigate();

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuickAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickIp.trim()) {
      navigate(`/analyze?ip=${encodeURIComponent(quickIp.trim())}`);
    } else {
      navigate('/analyze');
    }
  };

  const handlePresetClick = (ip: string) => {
    navigate(`/analyze?ip=${encodeURIComponent(ip)}`);
  };

  const COLORS = ['#06B6D4', '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#64748B'];

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Hero Command Center Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0B1530] via-[#0E1A38] to-[#070D1E] text-white p-6 sm:p-9 border border-cyan-500/20 shadow-2xl shadow-cyan-950/20 overflow-hidden">
        {/* Cyber grid overlay */}
        <div className="absolute inset-0 cyber-grid opacity-40 pointer-events-none" />
        
        {/* Ambient glow orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-1/3 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          {/* Top Pill Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono font-bold tracking-wider uppercase">
              <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> PS-010 Rule-Fusion Engine
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Live RIPEstat BGP
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 text-[11px] font-mono font-semibold">
              Zero RFC Leakage Guard
            </div>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Welcome back, <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">{stats?.user_name || 'Cybersecurity Analyst'}</span>
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Classify any IPv4 or IPv6 network type with explainable multi-source evidence. Fuses Autonomous Systems, BGP routing announcements, and Reverse DNS heuristics into auditable intelligence.
          </p>

          {/* Inline Quick IP Search Bar */}
          <form onSubmit={handleQuickAnalyze} className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={quickIp}
                onChange={(e) => setQuickIp(e.target.value)}
                placeholder="Enter IP (e.g. 8.8.8.8, 73.168.45.112)..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-white placeholder-slate-400 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 shrink-0"
            >
              <Zap className="w-4 h-4 text-cyan-200" />
              Analyze Target
            </button>
          </form>

          {/* Quick Scenario Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-400 font-medium">Quick presets:</span>
            <button
              onClick={() => handlePresetClick('73.168.45.112')}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-slate-700/60 font-mono text-[11px] transition-colors"
            >
              Residential (73.168.45.112)
            </button>
            <button
              onClick={() => handlePresetClick('54.214.12.89')}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-blue-300 border border-slate-700/60 font-mono text-[11px] transition-colors"
            >
              Cloud VPS (54.214.12.89)
            </button>
            <button
              onClick={() => handlePresetClick('198.54.117.44')}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 border border-slate-700/60 font-mono text-[11px] transition-colors"
            >
              Conflict (198.54.117.44)
            </button>
          </div>
        </div>
      </div>

      {/* 4 Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Analyses */}
        <div className="cyber-card p-5 relative overflow-hidden group hover:border-cyan-500/50 hover:shadow-glow-cyan">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Analyses</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200/50 dark:border-cyan-800/50 flex items-center justify-center transition-transform group-hover:scale-110">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {stats?.total_analyses ?? 0}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span>{stats?.live_analyses_count ?? 0} Live</span>
              <span>•</span>
              <span>{stats?.demo_analyses_count ?? 0} Demo</span>
            </div>
          </div>
        </div>

        {/* Unique Targets */}
        <div className="cyber-card p-5 relative overflow-hidden group hover:border-blue-500/50 hover:shadow-glow-blue">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Unique Targets</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 flex items-center justify-center transition-transform group-hover:scale-110">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {stats?.unique_ips ?? 0}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Distinct public / private subnets</span>
            </div>
          </div>
        </div>

        {/* Signal Conflicts */}
        <div className="cyber-card p-5 relative overflow-hidden group hover:border-amber-500/50 hover:shadow-glow-amber">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Signal Conflicts</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50 flex items-center justify-center transition-transform group-hover:scale-110">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {stats?.conflicts_count ?? 0}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 font-mono">
              <span>{stats && stats.conflicts_count > 0 ? 'Disagreements penalized' : 'Zero contradictions detected'}</span>
            </div>
          </div>
        </div>

        {/* Evidence Quality Ratio */}
        <div className="cyber-card p-5 relative overflow-hidden group hover:border-emerald-500/50 hover:shadow-glow-emerald">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">High Quality Consensus</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 flex items-center justify-center transition-transform group-hover:scale-110">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {stats && stats.total_analyses > 0 && stats.high_quality_ratio !== null
                ? `${stats.high_quality_ratio}%`
                : 'N/A'}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 font-mono">
              <span>Multi-Source Corroborated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Recent Analyses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Types Distribution Donut */}
        <div className="cyber-card p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Network Type Distribution
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                Empirical
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Distribution of classified address space across operational categories.
            </p>
          </div>

          <div className="h-56 w-full my-4 flex items-center justify-center relative">
            {stats?.category_distribution && stats.category_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.category_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {stats.category_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#070D1E',
                      borderColor: '#1E293B',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      fontFamily: 'JetBrains Mono, monospace'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400 p-6">
                No analysis data yet. Run your first analysis to visualize distribution!
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-3.5">
            {stats?.category_distribution?.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-sans">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="truncate max-w-[140px]">{item.name}</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {item.count} <span className="text-slate-400 font-normal">({item.percentage}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Analyses Activity Feed */}
        <div className="cyber-card p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Recent Investigated Addresses
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Audited intelligence snapshots from your persistent database.
                </p>
              </div>
              <button
                onClick={() => navigate('/history')}
                className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 flex items-center gap-1 group transition-colors"
              >
                <span>Full Ledger</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {stats?.recent_analyses && stats.recent_analyses.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
                {stats.recent_analyses.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => navigate(`/report/${rec.id}`)}
                    className="py-3.5 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all flex items-center justify-between gap-3 group border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors">
                          {rec.ip_address}
                        </span>
                        {rec.is_demo && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            DEMO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1 flex items-center gap-1.5">
                        <span className="font-mono text-[11px] text-cyan-500/80 dark:text-cyan-400/80">{rec.asn || 'ASN —'}</span>
                        <span>•</span>
                        <span className="truncate">{rec.org_name || 'Autonomous Network Allocation'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200/50 dark:border-cyan-800/50">
                        {rec.network_type}
                      </span>
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-mono font-extrabold text-slate-900 dark:text-white">
                          {rec.confidence_score}%
                        </span>
                        <p className="text-[10px] text-slate-400">Certainty</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-14 text-center">
                <Search className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No analyses recorded yet
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Investigate any address using live RIPEstat BGP sensors or test pre-configured evaluator scenarios.
                </p>
                <button
                  onClick={() => navigate('/analyze')}
                  className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md shadow-blue-500/20"
                >
                  Analyze an IP Address
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* How NetEvidence AI Works - The 4-Stage Rule Fusion Architecture */}
      <div className="cyber-card p-6 sm:p-7 relative overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500 dark:text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                Core Methodology
              </span>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                How NetEvidence AI Works
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Transparent, explainable 4-stage pipeline designed for 10th-standard student clarity and auditability.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-cyan-500 text-white flex items-center justify-center font-mono font-bold text-xs mb-3 shadow-md shadow-cyan-500/30">
              01
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Enter an IP Address
            </h4>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Accepts IPv4 and IPv6. RFC boundary validation ensures private (192.168.x) or loopback addresses are recognized safely without public leaks.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-xs mb-3 shadow-md shadow-blue-600/30">
              02
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Collect Multi-Source Data
            </h4>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Modular sensors query Autonomous System Numbers (ASN), BGP route announcements, WHOIS netnames, and recursive reverse DNS hostnames.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-xs mb-3 shadow-md shadow-indigo-600/30">
              03
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Evaluate & Conflict Detection
            </h4>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Engine weights signals by independent source family, identifies contradictions (e.g. residential ISP running cloud VPS), and penalizes uncertainty.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-mono font-bold text-xs mb-3 shadow-md shadow-emerald-600/30">
              04
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Explainable Report & Graph
            </h4>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Explore the interactive entity topology graph, plain-English "Why?" explanation, immutable audit ledger, and exportable findings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
