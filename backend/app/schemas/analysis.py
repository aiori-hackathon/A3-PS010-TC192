"""
Pydantic Schemas for IP Analysis, Evidence, and Explainability
"""
from datetime import datetime
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class IPValidationResult(BaseModel):
    is_valid: bool
    ip: str
    version: int = 4
    is_public: bool = True
    category: str = "public"
    explanation: str
    can_query_public_sources: bool = True

class EvidenceItem(BaseModel):
    id: str
    source: str
    category: str
    key: str
    value: Any
    freshness: str = "Live"
    status: str = "verified"  # verified, observed, inferred, error, missing
    contribution: str = "Neutral"
    impact_category: Optional[str] = None
    score_impact: float = 0.0
    reference_url: Optional[str] = None
    error_details: Optional[str] = None
    collected_at: datetime

class EvidenceConflict(BaseModel):
    id: str
    title: str
    source_a: str
    value_a: str
    source_b: str
    value_b: str
    why_it_matters: str
    severity: str = "Moderate"  # High, Moderate, Low
    affected_outcome: bool = True
    resolution_strategy: str

class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # ip, prefix, asn, org, hostname, source
    details: Dict[str, Any] = Field(default_factory=dict)

class GraphEdge(BaseModel):
    source: str
    target: str
    relationship: str
    is_inferred: bool = False

class EvidenceGraph(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class AnalysisRequest(BaseModel):
    ip_address: str
    force_demo: bool = False
    demo_case_id: Optional[str] = None

class AnalysisResponse(BaseModel):
    id: Optional[int] = None
    ip_address: str
    ip_version: int
    is_public: bool
    ip_category_type: str
    network_type: str
    confidence_score: int
    confidence_level: str
    evidence_quality: str
    summary: str
    explanation: str
    asn: Optional[str] = None
    org_name: Optional[str] = None
    prefix: Optional[str] = None
    hostname: Optional[str] = None
    is_demo: bool = False
    processing_time_ms: float = 0.0
    created_at: datetime
    evidence: List[EvidenceItem] = Field(default_factory=list)
    signals: List[Dict[str, Any]] = Field(default_factory=list)
    conflicts: List[EvidenceConflict] = Field(default_factory=list)
    graph: Dict[str, Any] = Field(default_factory=dict)
    candidate_scores: Dict[str, float] = Field(default_factory=dict)

class CompareRequest(BaseModel):
    analysis_id_a: int
    analysis_id_b: int

class SaveReportRequest(BaseModel):
    analysis_id: int
    title: str
    notes: Optional[str] = None
    tags: Optional[str] = None
