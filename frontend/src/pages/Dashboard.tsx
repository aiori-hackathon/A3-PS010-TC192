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
  Award
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import { Tooltip } from '../components/Tooltip';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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

  const COLORS = ['#2563EB', '#14B8A6', '#8B5CF6', '#F59E0B', '#64748B'];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Welcome & Banner */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#1C2541] to-[#1E293B] text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <Cpu className="w-3.5 h-3.5 animate-pulse" /> Evidence-Based Network Classification Platform
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {stats?.user_name || 'Cybersecurity Analyst'}
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            NetEvidence AI determines the likely network type of any IP address by fusing multi-source evidence from Autonomous Systems, BGP routing, reverse DNS, and registries with explainable rule scoring.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/analyze')}
              className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Search className="w-4 h-4" />
              Analyze New IP
            </button>
            <button
              onClick={() => navigate('/benchmark')}
              className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/70 flex items-center gap-1.5 transition-colors"
            >
              <Award className="w-4 h-4 text-teal-400" />
              Run Benchmarks
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-12 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Analyses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-all hover:border-blue-400/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Analyses</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {stats?.total_analyses ?? 0}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              {stats && stats.total_analyses > 0
                ? `${stats.live_analyses_count ?? 0} Live • ${stats.demo_analyses_count ?? 0} Demo`
                : 'No stored analyses yet'}
            </p>
          </div>
        </div>

        {/* Unique IPs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-all hover:border-teal-400/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Unique Targets</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {stats?.unique_ips ?? 0}
            </span>
            <p className="text-xs text-slate-400 mt-1">Distinct IP targets inspected</p>
          </div>
        </div>

        {/* Detected Conflicts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-all hover:border-amber-400/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Signal Conflicts</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {stats?.conflicts_count ?? 0}
            </span>
            <p className="text-xs text-slate-400 mt-1">Disagreements detected & resolved</p>
          </div>
        </div>

        {/* Evidence Quality */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-all hover:border-purple-400/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">High Quality Ratio</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {stats && stats.total_analyses > 0 && stats.high_quality_ratio !== null
                ? `${stats.high_quality_ratio}%`
                : 'N/A'}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              {stats && stats.total_analyses > 0
                ? 'Strong multi-source consensus'
                : 'Requires at least 1 analysis'}
            </p>
          </div>
        </div>
      </div>

      {/* "How NetEvidence AI Works" - 4 Simple Steps */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              How NetEvidence AI Works
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Explainable network classification in 4 straightforward stages for transparent verification.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 relative">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs mb-3 shadow-md shadow-blue-500/20">
              1
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Enter an IP Address
            </h4>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Input any IPv4 or IPv6 address. Our RFC validator ensures private or loopback addresses are recognized safely without public leaks.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 relative">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs mb-3 shadow-md shadow-teal-500/20">
              2
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Collect Network Evidence
            </h4>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Modular sensors query Autonomous System Numbers (ASN), BGP route announcements, WHOIS netnames, and reverse DNS PTR hostnames.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 relative">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs mb-3 shadow-md shadow-indigo-500/20">
              3
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Evaluate and Compare
            </h4>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              The explainable classification engine scores weighted signals, detects contradictions, checks freshness, and determines confidence.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 relative">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs mb-3 shadow-md shadow-purple-500/20">
              4
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Understand the Report
            </h4>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Explore the interactive entity graph, plain-English "Why?" breakdown, immutable audit log, and exportable findings.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Recent Analyses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Types Distribution Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Detected Network Types
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Empirical breakdown across your analyzed address space.
            </p>
          </div>

          <div className="h-56 w-full my-3 flex items-center justify-center">
            {stats?.category_distribution && stats.category_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.category_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {stats.category_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '12px',
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

          <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
            {stats?.category_distribution?.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  {item.name}
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Analyses List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Recent Analyses
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Saved snapshots from your SQLite audit ledger.
              </p>
            </div>
            <button
              onClick={() => navigate('/history')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View Full History <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats?.recent_analyses && stats.recent_analyses.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
              {stats.recent_analyses.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => navigate(`/report/${rec.id}`)}
                  className="py-3 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                        {rec.ip_address}
                      </span>
                      {rec.is_demo && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          DEMO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {rec.org_name || rec.asn || 'General Subscriber Range'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {rec.network_type}
                    </span>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {rec.confidence_score}%
                      </span>
                      <p className="text-[10px] text-slate-400">Confidence</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No analyses performed yet
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Ready to investigate an address? Click "Analyze New IP" or choose from pre-configured evaluator scenarios.
              </p>
              <button
                onClick={() => navigate('/analyze')}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                Analyze an IP Address
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
