import React, { useState } from 'react';
import { EvidenceGraphData, GraphNode } from '../types';
import { ZoomIn, ZoomOut, RotateCcw, Network, Maximize2, Minimize2, Eye } from 'lucide-react';

interface EvidenceGraphProps {
  graphData: EvidenceGraphData;
  ipAddress: string;
}

export const EvidenceGraph: React.FC<EvidenceGraphProps> = ({ graphData, ipAddress }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];

  // Categorize nodes
  const sourceNodes = nodes.filter((n) => n.type === 'source');
  const ipNode = nodes.find((n) => n.type === 'ip') || { id: 'ip_node', label: ipAddress, type: 'ip' };
  const hostNode = nodes.find((n) => n.type === 'hostname');
  const prefixNode = nodes.find((n) => n.type === 'prefix');
  const asnNode = nodes.find((n) => n.type === 'asn');
  const orgNode = nodes.find((n) => n.type === 'org');

  // Node position map:
  // Layout coordinates in a generous 1200 x 620 canvas
  const nodePositions: Record<
    string,
    {
      x: number;
      y: number;
      w: number;
      h: number;
      bg: string;
      stroke: string;
      badgeText: string;
      badgeColor: string;
      textColor: string;
      iconText: string;
    }
  > = {};

  // 1. Sources on the left
  const srcCount = Math.max(1, sourceNodes.length);
  const srcSpacing = 480 / (srcCount + 1);
  sourceNodes.forEach((node, idx) => {
    nodePositions[node.id] = {
      x: 30,
      y: 50 + srcSpacing * (idx + 1),
      w: 220,
      h: 60,
      bg: '#064E3B',
      stroke: '#10B981',
      badgeText: 'INTELLIGENCE SENSOR',
      badgeColor: '#6EE7B7',
      textColor: '#FFFFFF',
      iconText: 'SRC',
    };
  });

  // 2. Target IP Node in the Center
  nodePositions[ipNode.id] = {
    x: 430,
    y: 240,
    w: 250,
    h: 74,
    bg: '#1E3A8A',
    stroke: '#60A5FA',
    badgeText: 'TARGET IP ADDRESS',
    badgeColor: '#93C5FD',
    textColor: '#FFFFFF',
    iconText: 'IP',
  };

  // 3. Reverse DNS Hostname (Top Right)
  if (hostNode) {
    nodePositions[hostNode.id] = {
      x: 840,
      y: 60,
      w: 260,
      h: 64,
      bg: '#4C1D95',
      stroke: '#C084FC',
      badgeText: 'REVERSE DNS PTR',
      badgeColor: '#E9D5FF',
      textColor: '#FFFFFF',
      iconText: 'DNS',
    };
  }

  // 4. BGP Subnet Prefix (Middle Right)
  if (prefixNode) {
    nodePositions[prefixNode.id] = {
      x: 840,
      y: 220,
      w: 250,
      h: 64,
      bg: '#78350F',
      stroke: '#FBBF24',
      badgeText: 'BGP ROUTED SUBNET',
      badgeColor: '#FDE68A',
      textColor: '#FFFFFF',
      iconText: 'PFX',
    };
  }

  // 5. Autonomous System (ASN)
  if (asnNode) {
    nodePositions[asnNode.id] = {
      x: 840,
      y: 360,
      w: 250,
      h: 64,
      bg: '#312E81',
      stroke: '#818CF8',
      badgeText: 'AUTONOMOUS SYSTEM',
      badgeColor: '#C7D2FE',
      textColor: '#FFFFFF',
      iconText: 'ASN',
    };
  }

  // 6. Operator Organization
  if (orgNode) {
    nodePositions[orgNode.id] = {
      x: 840,
      y: 490,
      w: 260,
      h: 64,
      bg: '#134E4A',
      stroke: '#2DD4BF',
      badgeText: 'NETWORK OPERATOR',
      badgeColor: '#99F6E4',
      textColor: '#FFFFFF',
      iconText: 'ORG',
    };
  }

  // Fallback positioning for any other node
  nodes.forEach((node, idx) => {
    if (!nodePositions[node.id]) {
      nodePositions[node.id] = {
        x: 450 + (idx % 2) * 200,
        y: 100 + idx * 80,
        w: 220,
        h: 60,
        bg: '#1E293B',
        stroke: '#94A3B8',
        badgeText: node.type.toUpperCase(),
        badgeColor: '#CBD5E1',
        textColor: '#FFFFFF',
        iconText: node.type.slice(0, 3).toUpperCase(),
      };
    }
  });

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 overflow-auto bg-slate-950 p-8 shadow-2xl' : ''
      }`}
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">
              Interactive Evidence Topology Graph
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              High-Visibility View
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visual relationships between Target IP, BGP prefixes, Autonomous Systems, Reverse DNS, and verified intelligence sources.
          </p>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setZoom((z) => Math.min(2.0, Number((z + 0.15).toFixed(2))))}
            className="p-1.5 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
            <span>{(zoom * 100).toFixed(0)}%</span>
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))))}
            className="p-1.5 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1.0)}
            className="p-1.5 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Reset Zoom to 100%"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-x-auto rounded-2xl bg-[#080E1E] border border-slate-800 shadow-inner">
        <svg
          viewBox="0 0 1200 620"
          className="w-full min-w-[950px] h-[520px] transition-transform duration-150 select-none"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          {/* Definitions for glowing filters and arrows */}
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <marker
              id="arrow-solid"
              viewBox="0 0 12 12"
              refX="10"
              refY="6"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 6 L 0 11 z" fill="#94A3B8" />
            </marker>

            <marker
              id="arrow-dashed"
              viewBox="0 0 12 12"
              refX="10"
              refY="6"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 6 L 0 11 z" fill="#38BDF8" />
            </marker>

            {/* Grid Pattern */}
            <pattern id="bg-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#1E293B" opacity="0.6" />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect width="1200" height="620" fill="url(#bg-grid)" />

          {/* Edges (Connecting Lines) */}
          {edges.map((edge, idx) => {
            const p1 = nodePositions[edge.source];
            const p2 = nodePositions[edge.target];
            if (!p1 || !p2) return null;

            // Compute center of node cards
            const x1 = p1.x + p1.w / 2;
            const y1 = p1.y + p1.h / 2;
            const x2 = p2.x + p2.w / 2;
            const y2 = p2.y + p2.h / 2;

            const isDashed = edge.is_inferred;
            const strokeColor = isDashed ? '#38BDF8' : '#64748B';
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            // Formatted label text
            const labelText = edge.relationship
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase());
            const labelWidth = Math.max(100, labelText.length * 8.5 + 24);

            return (
              <g key={`edge-${idx}`}>
                {/* Edge line */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={strokeColor}
                  strokeWidth="2.8"
                  strokeDasharray={isDashed ? '6,6' : 'none'}
                  markerEnd={isDashed ? 'url(#arrow-dashed)' : 'url(#arrow-solid)'}
                  opacity="0.85"
                />

                {/* Relationship Pill Badge on edge */}
                <rect
                  x={midX - labelWidth / 2}
                  y={midY - 12}
                  width={labelWidth}
                  height="24"
                  rx="7"
                  fill="#0B132B"
                  stroke={isDashed ? '#0284C7' : '#475569'}
                  strokeWidth="1.5"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                />
                <text
                  x={midX}
                  y={midY + 4}
                  fill="#F1F5F9"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                  className="select-none"
                >
                  {labelText}
                </text>
              </g>
            );
          })}

          {/* Node Cards */}
          {nodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;
            const isSelected = selectedNode?.id === node.id;
            const isCenterIP = node.type === 'ip';

            // Clean, uncluttered label text
            let primaryLabel = node.label;
            if (node.type === 'source') {
              if (primaryLabel.includes('RIPEstat')) primaryLabel = 'RIPEstat NCC';
              else if (primaryLabel.includes('DNS')) primaryLabel = 'DNS PTR';
              else if (primaryLabel.includes('BGP')) primaryLabel = 'BGP Routing';
              else if (primaryLabel.includes('ARIN')) primaryLabel = 'ARIN WHOIS';
            }

            return (
              <g
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer group transition-transform"
                transform={`translate(${pos.x}, ${pos.y})`}
              >
                {/* Active Selection Glow Ring */}
                {isSelected && (
                  <rect
                    x="-5"
                    y="-5"
                    width={pos.w + 10}
                    height={pos.h + 10}
                    rx="18"
                    fill="none"
                    stroke={pos.stroke}
                    strokeWidth="3.5"
                    className="animate-pulse"
                  />
                )}

                {/* Node Card Background */}
                <rect
                  width={pos.w}
                  height={pos.h}
                  rx="14"
                  fill={pos.bg}
                  stroke={pos.stroke}
                  strokeWidth={isCenterIP ? '3.5' : '2.5'}
                  filter="drop-shadow(0 6px 12px rgba(0,0,0,0.4))"
                  className="transition-all group-hover:brightness-125"
                />

                {/* Left Icon Badge Circle */}
                <circle
                  cx={isCenterIP ? 36 : 30}
                  cy={pos.h / 2}
                  r={isCenterIP ? 20 : 17}
                  fill="#0B132B"
                  stroke={pos.stroke}
                  strokeWidth="2"
                />
                <text
                  x={isCenterIP ? 36 : 30}
                  y={pos.h / 2 + 4}
                  textAnchor="middle"
                  fill={pos.badgeColor}
                  fontSize={isCenterIP ? '12' : '10'}
                  fontWeight="900"
                  fontFamily="sans-serif"
                  className="select-none"
                >
                  {pos.iconText}
                </text>

                {/* Header Subtitle (Type) */}
                <text
                  x={isCenterIP ? 68 : 56}
                  y={pos.h / 2 - 8}
                  fill={pos.badgeColor}
                  fontSize={isCenterIP ? '11' : '10'}
                  fontWeight="800"
                  fontFamily="sans-serif"
                  letterSpacing="0.05em"
                  className="select-none uppercase"
                >
                  {pos.badgeText}
                </text>

                {/* Main Value Text */}
                <text
                  x={isCenterIP ? 68 : 56}
                  y={pos.h / 2 + 13}
                  fill={pos.textColor}
                  fontSize={isCenterIP ? '16' : '13'}
                  fontWeight={isCenterIP ? '900' : '700'}
                  fontFamily={isCenterIP || node.type === 'prefix' ? 'monospace' : 'sans-serif'}
                  className="select-none"
                >
                  {primaryLabel.length > 24 ? primaryLabel.slice(0, 23) + '…' : primaryLabel}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-[#070D1A] border-t border-slate-800 text-xs text-slate-300">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-blue-400" />
              Node Legend:
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3.5 h-3.5 rounded-md bg-blue-600 border border-blue-400 inline-block" />
              Target IP Address
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-600 border border-amber-400 inline-block" />
              BGP Prefix
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3.5 h-3.5 rounded-md bg-indigo-600 border border-indigo-400 inline-block" />
              Autonomous System (ASN)
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3.5 h-3.5 rounded-md bg-purple-600 border border-purple-400 inline-block" />
              Reverse DNS Hostname
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 border border-emerald-400 inline-block" />
              Intelligence Source
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <span className="w-5 h-0.5 bg-slate-400 inline-block" /> Solid: Observed Relation
            </span>
            <span className="flex items-center gap-1.5 text-sky-400 font-medium">
              <span className="w-5 h-0.5 border-b-2 border-dashed border-sky-400 inline-block" /> Dashed: Inferred Attestation
            </span>
          </div>
        </div>
      </div>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="mt-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-600 text-white shadow-sm">
                {selectedNode.type} Node Details
              </span>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100 font-mono">
                {selectedNode.label}
              </h4>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300"
            >
              Close
            </button>
          </div>

          <div className="mt-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-slate-400 font-semibold">Entity Type:</span>{' '}
              <span className="font-bold text-slate-900 dark:text-slate-100 capitalize">{selectedNode.type}</span>
            </div>
            {selectedNode.details &&
              Object.entries(selectedNode.details).map(([k, v]) => (
                <div key={k}>
                  <span className="text-slate-400 font-semibold capitalize">{k.replace(/_/g, ' ')}:</span>{' '}
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{String(v)}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
