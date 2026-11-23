import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  Activity,
  Layers,
  CheckCircle,
  ArrowRight,
  Globe,
  ShieldCheck,
  Check,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { DashboardStats } from '../types';

export const Dashboard: React.FC = () => {
  const { theme } = useTheme();
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
      console.error('Failed to load dashboard statistics:', err);
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

  const CHART_COLORS = ['#2563EB', '#0D9488', '#6366F1', '#10B981', '#F59E0B', '#64748B'];

  return (
    <div className="space-y-6">
      {/* Executive Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Network Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Empirical IP classification fusing Autonomous Systems, BGP routing, and reverse DNS heuristics.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/benchmark')}
            className="px-3.5 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            Benchmark Suite
          </button>
          <button
            onClick={() => navigate('/analyze')}
            className="px-3.5 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Analyze IP</span>
          </button>
        </div>
      </div>

      {/* Target Investigation Console Card */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Target Investigation Console
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Input any IPv4 or IPv6 address to extract BGP route announcements, ASN metadata, and DNS hostnames.
            </p>
          </div>
          <span className="self-start sm:self-auto text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            RFC 1918 / 6598 Safe
          </span>
        </div>

        {/* Search input form */}
        <form onSubmit={handleQuickAnalyze} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={quickIp}
              onChange={(e) => setQuickIp(e.target.value)}
              placeholder="Enter IPv4 or IPv6 target (e.g. 73.168.45.112, 54.214.12.89)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg font-medium text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors shrink-0"
          >
            <span>Investigate Target</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Presets */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Test Presets:</span>
          <button
            type="button"
            onClick={() => handlePresetClick('73.168.45.112')}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono text-[11px] transition-colors"
          >
            Residential (73.168.45.112)
          </button>
          <button
            type="button"
            onClick={() => handlePresetClick('54.214.12.89')}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono text-[11px] transition-colors"
          >
            Cloud Hosting (54.214.12.89)
          </button>
          <button
            type="button"
            onClick={() => handlePresetClick('18.178.2.55')}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono text-[11px] transition-colors"
          >
            Enterprise Campus (18.178.2.55)
          </button>
          <button
            type="button"
            onClick={() => handlePresetClick('198.54.117.44')}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono text-[11px] transition-colors"
          >
            Conflicting Signals (198.54.117.44)
          </button>
        </div>
      </div>

      {/* 4 Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Analyses */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Analyses
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {stats?.total_analyses ?? 0}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span>{stats?.live_analyses_count ?? 0} live</span>
              <span>•</span>
              <span>{stats?.demo_analyses_count ?? 0} demo</span>
            </div>
          </div>
        </div>

        {/* Unique Targets */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Unique Targets
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {stats?.unique_ips ?? 0}
            </span>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Distinct IP addresses inspected
            </p>
          </div>
        </div>

        {/* Signal Conflicts */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Signal Conflicts
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {stats?.conflicts_count ?? 0}
            </span>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {stats && stats.conflicts_count > 0 ? 'Disagreements resolved' : 'Zero contradictions found'}
            </p>
          </div>
        </div>

        {/* Consensus Quality */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              High Quality Ratio
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {stats && stats.total_analyses > 0 && stats.high_quality_ratio !== null
                ? `${stats.high_quality_ratio}%`
                : 'N/A'}
            </span>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Multi-source corroborated
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Recent Analyses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Types Distribution Donut */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                Network Type Distribution
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                Empirical
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Classified address space across operational categories.
            </p>
          </div>

          <div className="h-52 w-full my-4 flex items-center justify-center relative">
            {stats?.category_distribution && stats.category_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.category_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {stats.category_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#111827' : '#FFFFFF',
                      borderColor: theme === 'dark' ? '#374151' : '#E2E8F0',
                      borderRadius: '8px',
                      color: theme === 'dark' ? '#F9FAFB' : '#111827',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400 p-6">
                No analysis data yet. Run an analysis to visualize distribution.
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            {stats?.category_distribution?.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-sans">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                  />
                  <span className="truncate max-w-[140px]">{item.name}</span>
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {item.count} <span className="text-slate-400 font-normal">({item.percentage}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Analyses Activity Feed */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Recent Target Analyses
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Audited intelligence snapshots from the persistent database.
                </p>
              </div>
              <button
                onClick={() => navigate('/history')}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                <span>Full Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {stats?.recent_analyses && stats.recent_analyses.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-1">
                {stats.recent_analyses.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => navigate(`/report/${rec.id}`)}
                    className="py-3 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {rec.ip_address}
                        </span>
                        {rec.is_demo && (
                          <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            DEMO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-1.5">
                        <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">{rec.asn || 'ASN —'}</span>
                        <span>•</span>
                        <span className="truncate">{rec.org_name || 'Autonomous Network Allocation'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {rec.network_type}
                      </span>
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                          {rec.confidence_score}%
                        </span>
                        <p className="text-[10px] text-slate-400">Certainty</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Search className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  No analyses recorded yet
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Investigate any address using live RIPEstat BGP sensors or test pre-configured evaluator scenarios.
                </p>
                <button
                  onClick={() => navigate('/analyze')}
                  className="mt-3 px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
                >
                  Analyze an IP Address
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* How NetEvidence AI Works - The 4-Stage Rule Fusion Architecture */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
            How NetEvidence AI Works
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transparent, explainable 4-stage pipeline for verifiable network classification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-mono font-bold text-xs mb-2.5">
              1
            </div>
            <h4 className="font-semibold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Enter Target IP
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Validates IPv4/IPv6 syntax and RFC boundaries (1918, 6598) to prevent public leakage of local networks.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-mono font-bold text-xs mb-2.5">
              2
            </div>
            <h4 className="font-semibold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Collect Multi-Source Data
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Interrogates Autonomous Systems (ASN), BGP route announcements, WHOIS netnames, and DNS PTR records.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-mono font-bold text-xs mb-2.5">
              3
            </div>
            <h4 className="font-semibold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Score & Detect Conflicts
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Weighs independent evidence sources, detects contradictory signals, and penalizes uncertain classifications.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-mono font-bold text-xs mb-2.5">
              4
            </div>
            <h4 className="font-semibold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Explainable Report & Graph
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Provides an interactive entity graph, plain-English "Why?" breakdown, immutable audit log, and exportable findings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
