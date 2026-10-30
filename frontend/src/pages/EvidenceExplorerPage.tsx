import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Search, Layers, ExternalLink, Cpu, CheckCircle2, ShieldAlert, ArrowRight, Database } from 'lucide-react';
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

  const activePreset = presets.find((p) => p.id === selectedCaseId);

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl mx-auto pb-12">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Network className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Evidence Entity Explorer
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Inspect and verify how NetEvidence AI links IP addresses, BGP routing subnets, Autonomous Systems, and reverse DNS across 7 reference scenarios.
        </p>
      </div>

      {/* Scenario Selector Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Select Reference Scenario (Evaluator Suite):
          </span>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider">
            SYNTHETIC DEMO DATA
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => loadScenario(p.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCaseId === p.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Overview Card */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Evaluating multi-source scenario through classification engine...</p>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          {/* Active Scenario Context Banner */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                  Target: {analysis.ip_address}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="font-extrabold text-xs text-blue-600 dark:text-blue-400">
                  {analysis.network_type}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Confidence: {analysis.confidence_score}/100 ({analysis.confidence_level})
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {analysis.summary}
              </p>
            </div>

            {analysis.id && (
              <button
                onClick={() => navigate(`/report/${analysis.id}`)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1.5 self-start sm:self-auto shrink-0"
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
