export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface IPValidationResult {
  is_valid: boolean;
  ip: string;
  version: number;
  is_public: boolean;
  category: string;
  explanation: string;
  can_query_public_sources: boolean;
}

export interface EvidenceItem {
  id: string;
  source: string;
  category: string;
  key: string;
  value: any;
  freshness: string;
  status: 'verified' | 'observed' | 'inferred' | 'error' | 'missing' | 'simulated';
  contribution: string;
  impact_category?: string;
  score_impact: number;
  reference_url?: string;
  error_details?: string;
  collected_at: string;
}

export interface EvidenceConflict {
  id: string;
  title: string;
  source_a: string;
  value_a: string;
  source_b: string;
  value_b: string;
  why_it_matters: string;
  severity: 'High' | 'Moderate' | 'Low';
  affected_outcome: boolean;
  resolution_strategy: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string; // ip, prefix, asn, org, hostname, source, policy
  category?: string;
  details?: Record<string, any>;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  is_inferred: boolean;
}

export interface EvidenceGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface AnalysisResponse {
  id?: number;
  ip_address: string;
  ip_version: number;
  is_public: boolean;
  ip_category_type: string;
  network_type: string;
  confidence_score: number;
  confidence_level: string;
  evidence_quality: string;
  summary: string;
  explanation: string;
  asn?: string;
  org_name?: string;
  prefix?: string;
  hostname?: string;
  is_demo: boolean;
  processing_time_ms: number;
  created_at: string;
  evidence: EvidenceItem[];
  signals: any[];
  conflicts: EvidenceConflict[];
  graph: EvidenceGraphData;
  candidate_scores: Record<string, number>;
}

export interface DashboardStats {
  user_name: string;
  total_analyses: number;
  live_analyses_count: number;
  demo_analyses_count: number;
  unique_ips: number;
  conflicts_count: number;
  high_quality_ratio: number | null;
  category_distribution: { name: string; count: number; percentage: number }[];
  evidence_quality_distribution: { quality: string; count: number }[];
  recent_analyses: {
    id: number;
    ip_address: string;
    network_type: string;
    confidence_score: number;
    confidence_level: string;
    evidence_quality: string;
    asn?: string;
    org_name?: string;
    created_at: string;
    is_demo: boolean;
  }[];
  team_meta: {
    project_name: string;
    team_name: string;
    team_code: string;
    institution: string;
    classifier_version: string;
  };
}

export interface BenchmarkItem {
  ip: string;
  ground_truth: string;
  predicted: string;
  confidence: number;
  is_correct: boolean;
  evidence_quality: string;
  notes: string;
}

export interface CategoryMetrics {
  category: string;
  precision: number;
  recall: number;
  f1_score: number;
  total_samples: number;
}

export interface BenchmarkResult {
  total_samples: number;
  correct_predictions: number;
  overall_accuracy: number;
  macro_f1: number;
  unknown_abstention_rate: number;
  category_metrics: CategoryMetrics[];
  confusion_matrix: Record<string, Record<string, number>>;
  baseline_accuracy: number;
  baseline_notes: string;
  items: BenchmarkItem[];
  timestamp: string;
  is_custom_dataset: boolean;
  dataset_info: Record<string, any>;
}

export interface AuditEvent {
  id: number;
  user_id: number;
  analysis_id?: number;
  action: string;
  ip_address?: string;
  status: string;
  details: Record<string, any>;
  created_at: string;
}
