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
  ChevronRight,
  Sparkles,
  Terminal,
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
import { useGlass } from '../components/ShatteredGlassEngine';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [quickIp, setQuickIp] = useState<string>('');
  const navigate = useNavigate();
  const { triggerShatter } = useGlass();

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

  // Smoked-glass iridescence palette: lavender, cyan, emerald, amber, coral, indigo
  const CHART_COLORS = ['#8C7BFF', '#70D7FF', '#36D67E', '#F0B45C', '#FF626E', '#A0A0AA'];

  return (
    <div className="space-y-6">
      {/* Executive Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono font-semibold tracking-widest text-[#8C7BFF]">
              3D Glass Laboratory
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#36D67E]" />
            <span className="text-[10px] font-mono text-[#36D67E]">Sensors Online</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Network Intelligence Console
          </h1>
          <p className="text-xs text-[#A0A0AA] mt-0.5">
            Empirical IP classification fusing Autonomous Systems, BGP routing, and reverse DNS heuristics.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={triggerShatter}
            className="px-3.5 py-2 rounded-xl text-xs font-mono font-medium border border-[#8C7BFF]/30 backdrop-blur-md bg-[#202027]/70 text-[#B9ABFF] hover:bg-[#8C7BFF]/20 hover:border-[#8C7BFF]/60 hover:shadow-[0_0_20px_rgba(140,123,255,0.25)] transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8C7BFF]" />
            <span>3D Methodology</span>
          </button>
          <button
            onClick={() => navigate('/benchmark')}
            className="px-3.5 py-2 rounded-xl text-xs font-medium border border-white/[0.10] backdrop-blur-md bg-[#202027]/70 text-[#E5E5EA] hover:bg-[#202027] hover:border-white/[0.20] transition-all shadow-xs"
          >
            Benchmark Lab
          </button>
          <button
            onClick={() => navigate('/analyze')}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-[#8C7BFF] hover:bg-[#7b68ff] text-white transition-all shadow-[0_4px_16px_rgba(140,123,255,0.35)] flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Analyze IP</span>
          </button>
        </div>
      </div>

      {/* Target Investigation Console Shard */}
      <div className="glass-shard p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#8C7BFF]" />
              <span>Target Investigation Console</span>
            </h2>
            <p className="text-xs text-[#A0A0AA] mt-0.5">
              Input any IPv4 or IPv6 address to extract BGP route announcements, ASN metadata, and DNS hostnames.
            </p>
          </div>
          <span className="self-start sm:self-auto text-[10px] font-mono text-[#36D67E] backdrop-blur-md bg-[#36D67E]/10 px-2.5 py-0.5 rounded-lg border border-[#36D67E]/30">
            RFC 1918 / 6598 Safe
          </span>
        </div>

        {/* Search input form */}
        <form onSubmit={handleQuickAnalyze} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#777782] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={quickIp}
              onChange={(e) => setQuickIp(e.target.value)}
              placeholder="Enter IPv4 or IPv6 target (e.g. 73.168.45.112, 54.214.12.89)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm font-mono placeholder-[#777782]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl font-medium text-xs bg-gradient-to-r from-[#8C7BFF] to-[#70D7FF] hover:opacity-95 text-white shadow-[0_4px_20px_rgba(140,123,255,0.35)] flex items-center justify-center gap-1.5 transition-all shrink-0 font-mono"
          >
            <span>Investigate Target</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Presets */}
        <div className="mt-4 pt-3.5 border-t border-white/[0.08] flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] text-[#A0A0AA] font-medium font-mono">Test Scenarios:</span>
          <button
            type="button"
            onClick={() => handlePresetClick('73.168.45.112')}
            className="px-2.5 py-1 rounded-lg backdrop-blur-md bg-[#202027]/70 hover:bg-[#202027] text-[#E5E5EA] border border-white/[0.08] hover:border-[#8C7BFF]/40 font-mono text-[11px] transition-all"
          >
            Residential (73.168.45.112)
          </button>
          <button
            type="button"
            onClick={() => handlePresetClick('54.214.12.89')}
            className="px-2.5 py-1 rounded-lg backdrop-blur-md bg-[#202027]/70 hover:bg-[#202027] text-[#E5E5EA] border border-white/[0.08] hover:border-[#70D7FF]/40 font-mono text-[11px] transition-all"
          >
            Cloud Hosting (54.214.12.89)
          </button>
          <button
            type="button"
            onClick={() => handlePresetClick('18.178.2.55')}
            className="px-2.5 py-1 rounded-lg backdrop-blur-md bg-[#202027]/70 hover:bg-[#202027] text-[#E5E5EA] border border-white/[0.08] hover:border-[#36D67E]/40 font-mono text-[11px] transition-all"
          >
            Enterprise Campus (18.178.2.55)
          </button>
          <button
            type="button"
            onClick={() => handlePresetClick('198.54.117.44')}
            className="px-2.5 py-1 rounded-lg backdrop-blur-md bg-[#202027]/70 hover:bg-[#202027] text-[#E5E5EA] border border-white/[0.08] hover:border-[#FF626E]/40 font-mono text-[11px] transition-all"
          >
            Conflicting Signals (198.54.117.44)
          </button>
        </div>
      </div>

      {/* 4 Telemetry Glass Shards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Analyses */}
        <div className="glass-shard p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A0A0AA] font-mono">
              Total Analyses
            </span>
            <div className="w-8 h-8 rounded-xl backdrop-blur-md bg-[#8C7BFF]/15 text-[#B9ABFF] border border-[#8C7BFF]/30 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-white">
              {stats?.total_analyses ?? 0}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#A0A0AA] font-mono">
              <span>{stats?.live_analyses_count ?? 0} live</span>
              <span>•</span>
              <span>{stats?.demo_analyses_count ?? 0} demo</span>
            </div>
          </div>
        </div>

        {/* Unique Targets */}
        <div className="glass-shard p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A0A0AA] font-mono">
              Unique Targets
            </span>
            <div className="w-8 h-8 rounded-xl backdrop-blur-md bg-[#70D7FF]/15 text-[#70D7FF] border border-[#70D7FF]/30 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-white">
              {stats?.unique_ips ?? 0}
            </span>
            <p className="mt-1 text-[11px] text-[#A0A0AA] font-mono">
              Distinct targets interrogated
            </p>
          </div>
        </div>

        {/* Signal Conflicts */}
        <div className="glass-shard p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A0A0AA] font-mono">
              Signal Conflicts
            </span>
            <div className="w-8 h-8 rounded-xl backdrop-blur-md bg-[#F0B45C]/15 text-[#F0B45C] border border-[#F0B45C]/30 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-white">
              {stats?.conflicts_count ?? 0}
            </span>
            <p className="mt-1 text-[11px] text-[#A0A0AA] font-mono">
              {stats && stats.conflicts_count > 0 ? 'Contradictions resolved' : 'Zero contradictions found'}
            </p>
          </div>
        </div>

        {/* Consensus Quality */}
        <div className="glass-shard p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A0A0AA] font-mono">
              High Quality Ratio
            </span>
            <div className="w-8 h-8 rounded-xl backdrop-blur-md bg-[#36D67E]/15 text-[#36D67E] border border-[#36D67E]/30 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-white">
              {stats && stats.total_analyses > 0 && stats.high_quality_ratio !== null
                ? `${stats.high_quality_ratio}%`
                : 'N/A'}
            </span>
            <p className="mt-1 text-[11px] text-[#A0A0AA] font-mono">
              Multi-source corroborated
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Recent Analyses Shard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Types Distribution Donut Shard */}
        <div className="glass-shard p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">
                Network Type Distribution
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md backdrop-blur-md bg-[#202027] border border-white/[0.08] text-[#8C7BFF]">
                Empirical
              </span>
            </div>
            <p className="text-xs text-[#A0A0AA] mt-1">
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
                      backgroundColor: 'rgba(23, 23, 27, 0.95)',
                      backdropFilter: 'blur(16px)',
                      borderColor: 'rgba(140, 123, 255, 0.3)',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-[#777782] p-6 font-mono">
                No telemetry data yet. Run an analysis to visualize distribution.
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-white/[0.08] pt-3">
            {stats?.category_distribution?.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-2 text-[#A0A0AA]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                  />
                  <span className="truncate max-w-[140px]">{item.name}</span>
                </span>
                <span className="font-semibold text-white">
                  {item.count} <span className="text-[#777782] font-normal">({item.percentage}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Analyses Activity Feed Shard */}
        <div className="glass-shard p-5 sm:p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
              <div>
                <h3 className="font-semibold text-white text-sm">
                  Recent Target Analyses
                </h3>
                <p className="text-xs text-[#A0A0AA] mt-0.5">
                  Audited intelligence snapshots from the persistent database.
                </p>
              </div>
              <button
                onClick={() => navigate('/history')}
                className="text-xs font-mono font-medium text-[#8C7BFF] hover:text-[#B9ABFF] flex items-center gap-1 transition-colors"
              >
                <span>Full Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {stats?.recent_analyses && stats.recent_analyses.length > 0 ? (
              <div className="divide-y divide-white/[0.06] mt-1">
                {stats.recent_analyses.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => navigate(`/report/${rec.id}`)}
                    className="py-3 px-2 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs sm:text-sm text-white group-hover:text-[#8C7BFF] transition-colors">
                          {rec.ip_address}
                        </span>
                        {rec.is_demo && (
                          <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded backdrop-blur-sm bg-[#F0B45C]/15 text-[#F0B45C] border border-[#F0B45C]/30">
                            DEMO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#A0A0AA] truncate mt-0.5 flex items-center gap-1.5 font-mono">
                        <span className="text-[11px] text-[#B9ABFF]">{rec.asn || 'ASN —'}</span>
                        <span>•</span>
                        <span className="truncate">{rec.org_name || 'Autonomous Network Allocation'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium backdrop-blur-sm bg-[#202027] text-white border border-white/[0.08]">
                        {rec.network_type}
                      </span>
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-mono font-bold text-white">
                          {rec.confidence_score}%
                        </span>
                        <p className="text-[10px] text-[#777782] font-mono">Certainty</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#777782] group-hover:text-[#8C7BFF] transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Search className="w-8 h-8 text-[#777782] mx-auto mb-2" />
                <h4 className="text-xs font-semibold text-white">
                  No analyses recorded yet
                </h4>
                <p className="text-xs text-[#A0A0AA] mt-1 max-w-sm mx-auto">
                  Investigate any address using live RIPEstat BGP sensors or test pre-configured evaluator scenarios.
                </p>
                <button
                  onClick={() => navigate('/analyze')}
                  className="mt-3 px-4 py-2 rounded-xl text-xs font-medium bg-[#8C7BFF] hover:bg-[#7b68ff] text-white shadow-sm transition-colors"
                >
                  Analyze an IP Address
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* How NetEvidence AI Works - 4-Stage Rule Fusion Architecture Shards */}
      <div className="glass-shard p-5 sm:p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-white text-sm">
            How NetEvidence AI Works
          </h3>
          <p className="text-xs text-[#A0A0AA] mt-0.5">
            Transparent, explainable 4-stage pipeline for verifiable network classification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl backdrop-blur-md bg-[#202027]/50 border border-white/[0.08] hover:border-[#8C7BFF]/40 transition-all">
            <div className="w-6 h-6 rounded-full bg-[#8C7BFF]/20 text-[#B9ABFF] border border-[#8C7BFF]/40 flex items-center justify-center font-mono font-bold text-xs mb-2.5">
              1
            </div>
            <h4 className="font-semibold text-xs text-white uppercase tracking-wider font-mono">
              Target IP Syntax & Scope
            </h4>
            <p className="mt-1 text-xs text-[#A0A0AA] leading-relaxed">
              Validates IPv4/IPv6 syntax and RFC boundaries (1918, 6598) to prevent public leakage of local networks.
            </p>
          </div>

          <div className="p-4 rounded-xl backdrop-blur-md bg-[#202027]/50 border border-white/[0.08] hover:border-[#70D7FF]/40 transition-all">
            <div className="w-6 h-6 rounded-full bg-[#70D7FF]/20 text-[#70D7FF] border border-[#70D7FF]/40 flex items-center justify-center font-mono font-bold text-xs mb-2.5">
              2
            </div>
            <h4 className="font-semibold text-xs text-white uppercase tracking-wider font-mono">
              Multi-Source Telemetry
            </h4>
            <p className="mt-1 text-xs text-[#A0A0AA] leading-relaxed">
              Interrogates Autonomous Systems (ASN), BGP route announcements, WHOIS netnames, and DNS PTR records.
            </p>
          </div>

          <div className="p-4 rounded-xl backdrop-blur-md bg-[#202027]/50 border border-white/[0.08] hover:border-[#F0B45C]/40 transition-all">
            <div className="w-6 h-6 rounded-full bg-[#F0B45C]/20 text-[#F0B45C] border border-[#F0B45C]/40 flex items-center justify-center font-mono font-bold text-xs mb-2.5">
              3
            </div>
            <h4 className="font-semibold text-xs text-white uppercase tracking-wider font-mono">
              Signal Fusion & Conflicts
            </h4>
            <p className="mt-1 text-xs text-[#A0A0AA] leading-relaxed">
              Weighs independent evidence sources, detects contradictory signals, and penalizes uncertain classifications.
            </p>
          </div>

          <div className="p-4 rounded-xl backdrop-blur-md bg-[#202027]/50 border border-white/[0.08] hover:border-[#36D67E]/40 transition-all">
            <div className="w-6 h-6 rounded-full bg-[#36D67E]/20 text-[#36D67E] border border-[#36D67E]/40 flex items-center justify-center font-mono font-bold text-xs mb-2.5">
              4
            </div>
            <h4 className="font-semibold text-xs text-white uppercase tracking-wider font-mono">
              Auditability & Forensics
            </h4>
            <p className="mt-1 text-xs text-[#A0A0AA] leading-relaxed">
              Provides an interactive entity graph, plain-English "Why?" breakdown, immutable audit log, and exportable findings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
