import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { AnalysisResponse } from '../types';
import { EvidenceGraph } from '../components/EvidenceGraph';
import { ConflictCard } from '../components/ConflictCard';
import { EvidenceTable } from '../components/EvidenceTable';

export const EvidenceExplorerPage: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('residential_clear');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const presets = [
    { id: 'residential_clear', label: '1. Residential (Comcast)', ip: '73.168.45.112', type: 'Residential' },
    { id: 'datacenter_clear', label: '2. Hosting / Cloud (AWS)', ip: '54.214.12.89', type: 'Hosting / Datacenter' },
    { id: 'enterprise_campus', label: '3. University Campus (MIT)', ip: '18.178.2.55', type: 'Enterprise / Campus' },
    { id: 'mobile_carrier', label: '4. Mobile Carrier (Verizon)', ip: '174.216.78.90', type: 'Mobile' },
    { id: 'conflicting_signals', label: '5. Conflicting Signals', ip: '198.54.117.44', type: 'Hosting / Datacenter' },
    { id: 'insufficient_evidence', label: '6. Insufficient Evidence', ip: '192.0.2.1', type: 'Unknown / Insufficient Evidence' },
    { id: 'special_purpose_ip', label: '7. Special-Purpose LAN', ip: '192.168.1.1', type: 'Non-Public (RFC 1918)' },
  ];

  const loadScenario = async (caseId: string) => {
    setSelectedCaseId(caseId);
    setIsLoading(true);
    try {
      const preset = presets.find((p) => p.id === caseId);
      if (preset) {
        const res = await api.analyzeIp({
          ip_address: preset.ip,
          force_demo: true,
          demo_case_id: caseId
        });
        setAnalysis(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScenario(selectedCaseId);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl mx-auto pb-12 font-sans">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#8C7BFF]/15 border border-[#8C7BFF]/30 flex items-center justify-center text-[#8C7BFF]">
            <Network className="w-4 h-4" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Evidence Entity Explorer
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#A0A0AA] font-mono">
          Inspect and verify how NetEvidence AI links IP addresses, BGP routing subnets, Autonomous Systems, and reverse DNS across 7 reference scenarios.
        </p>
      </div>

      {/* Scenario Selector Bar */}
      <div className="glass-shard p-5 sm:p-6 font-mono">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
          <span className="text-xs font-bold text-[#A0A0AA] uppercase tracking-wider">
            Select Reference Scenario (Evaluator Suite):
          </span>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#F0B45C]/15 text-[#F0B45C] border border-[#F0B45C]/30 uppercase tracking-wider">
            SYNTHETIC DEMO DATA
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => loadScenario(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedCaseId === p.id
                  ? 'bg-[#8C7BFF] text-white shadow-[0_0_16px_rgba(140,123,255,0.4)] font-semibold'
                  : 'backdrop-blur-md bg-[#202027]/70 text-[#A0A0AA] hover:text-white hover:bg-white/[0.06] border border-white/[0.08]'
              }`}
            >
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Overview Card */}
      {isLoading ? (
        <div className="py-24 text-center font-mono">
          <div className="w-10 h-10 border-4 border-[#8C7BFF]/30 border-t-[#8C7BFF] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#A0A0AA]">Evaluating multi-source scenario through classification engine...</p>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          {/* Active Scenario Context Banner */}
          <div className="glass-shard p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  Target: {analysis.ip_address}
                </span>
                <span className="text-xs text-[#777782]">•</span>
                <span className="font-bold text-xs text-[#8C7BFF]">
                  {analysis.network_type}
                </span>
                <span className="text-xs text-[#777782]">•</span>
                <span className="text-xs text-[#A0A0AA]">
                  Confidence: {analysis.confidence_score}/100 ({analysis.confidence_level})
                </span>
              </div>
              <p className="text-xs text-[#A0A0AA] font-sans">
                {analysis.summary}
              </p>
            </div>

            {analysis.id && (
              <button
                onClick={() => navigate(`/report/${analysis.id}`)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#8C7BFF]/15 hover:bg-[#8C7BFF]/30 border border-[#8C7BFF]/30 text-[#B9ABFF] transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto shrink-0"
              >
                <span>View Full Audit Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Interactive Topology Graph */}
          <EvidenceGraph graphData={analysis.graph} ipAddress={analysis.ip_address} />

          {/* Detected Conflicts */}
          {analysis.conflicts.length > 0 && (
            <ConflictCard conflicts={analysis.conflicts} />
          )}

          {/* Synchronized Evidence Ledger */}
          <EvidenceTable evidence={analysis.evidence} />
        </div>
      ) : null}
    </div>
  );
};
