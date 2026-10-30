"""
IP Analysis API Endpoints: Validation, Multi-Source Analysis, Save & Compare
"""
import time
import json
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.analysis import AnalysisRecord, SavedReport
from app.models.audit import AuditEvent
from app.schemas.analysis import (
    IPValidationResult,
    AnalysisRequest,
    AnalysisResponse,
    SaveReportRequest,
    CompareRequest,
    EvidenceItem,
    EvidenceConflict
)
from app.api.deps import get_current_user
from app.services.ip_validator import validate_and_classify_ip
from app.services.evidence_collector import EvidenceCollector
from app.services.classifier import NetworkClassifier
from app.services.adapters.demo_adapter import DemoAdapter

router = APIRouter(prefix="/analysis", tags=["IP Analysis"])
collector = EvidenceCollector()
classifier = NetworkClassifier()

@router.post("/validate", response_model=IPValidationResult)
def validate_ip(request: AnalysisRequest):
    """Validates an IP address and determines if it is public or restricted."""
    return validate_and_classify_ip(request.ip_address)

@router.get("/demo-cases")
def list_demo_cases():
    """Returns curated demo scenarios for hackathon evaluators."""
    return DemoAdapter.list_demo_cases()

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_ip(
    request: AnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Main IP network type classification pipeline:
    1. Validates IP address
    2. Collects network evidence from active sensors or demo suite
    3. Detects conflicts and scores signals
    4. Generates explainable result, confidence, and evidence graph
    5. Preserves auditable record in database
    """
    start_time = time.time()
    
    # Step 1: Validate IP
    validation = validate_and_classify_ip(request.ip_address)
    if not validation.is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=validation.explanation
        )

    # Step 2: Evidence Collection
    is_demo = False
    demo_expected_cat = None
    demo_case_data = None

    if request.force_demo or request.demo_case_id:
        demo_key = request.demo_case_id or request.ip_address
        demo_case_data = DemoAdapter.get_demo_case(demo_key)
        if demo_case_data:
            is_demo = True
            demo_expected_cat = demo_case_data.get("expected_category")
            evidence = collector.load_demo_evidence(demo_case_data)
        else:
            evidence = await collector.collect_live_evidence(validation.ip, validation)
    else:
        # Check if the IP matches a predefined demo IP automatically when live providers are slow
        demo_case_data = DemoAdapter.get_demo_case(validation.ip)
        if demo_case_data and request.force_demo:
            is_demo = True
            demo_expected_cat = demo_case_data.get("expected_category")
            evidence = collector.load_demo_evidence(demo_case_data)
        else:
            evidence = await collector.collect_live_evidence(validation.ip, validation)

    # Step 3: Classify and Explain
    response = classifier.classify(
        ip=validation.ip,
        validation=validation,
        evidence=evidence,
        is_demo=is_demo,
        demo_expected_category=demo_expected_cat
    )

    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    response.processing_time_ms = elapsed_ms

    # Step 4: Persist in Database
    record = AnalysisRecord(
        user_id=current_user.id,
        ip_address=response.ip_address,
        ip_version=response.ip_version,
        is_public=response.is_public,
        ip_category_type=response.ip_category_type,
        network_type=response.network_type,
        confidence_score=response.confidence_score,
        confidence_level=response.confidence_level,
        evidence_quality=response.evidence_quality,
        summary=response.summary,
        explanation=response.explanation,
        asn=response.asn,
        org_name=response.org_name,
        prefix=response.prefix,
        hostname=response.hostname,
        processing_time_ms=elapsed_ms,
        is_demo=response.is_demo,
        raw_evidence_json=json.dumps([e.model_dump(mode="json") for e in response.evidence]),
        signals_json=json.dumps(response.signals),
        conflicts_json=json.dumps([c.model_dump(mode="json") for c in response.conflicts]),
        graph_json=json.dumps(response.graph),
        created_at=datetime.now(timezone.utc)
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    response.id = record.id

    # Step 5: Save Audit Event
    audit = AuditEvent(
        user_id=current_user.id,
        analysis_id=record.id,
        action="ANALYSIS_PERFORMED",
        ip_address=record.ip_address,
        status="SUCCESS",
        details_json=json.dumps({
            "network_type": record.network_type,
            "confidence": record.confidence_score,
            "evidence_quality": record.evidence_quality,
            "conflicts_count": len(response.conflicts),
            "is_demo": record.is_demo,
            "time_ms": elapsed_ms
        })
    )
    db.add(audit)
    db.commit()

    return response

@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis_by_id(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves an existing analysis report by ID."""
    record = db.query(AnalysisRecord).filter(
        AnalysisRecord.id == analysis_id,
        AnalysisRecord.user_id == current_user.id
    ).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis record not found."
        )

    # Reconstruct structured objects from JSON
    raw_evidence = [EvidenceItem(**item) for item in json.loads(record.raw_evidence_json or "[]")]
    conflicts = [EvidenceConflict(**c) for c in json.loads(record.conflicts_json or "[]")]
    signals = json.loads(record.signals_json or "[]")
    graph = json.loads(record.graph_json or "{}")

    return AnalysisResponse(
        id=record.id,
        ip_address=record.ip_address,
        ip_version=record.ip_version,
        is_public=record.is_public,
        ip_category_type=record.ip_category_type,
        network_type=record.network_type,
        confidence_score=record.confidence_score,
        confidence_level=record.confidence_level,
        evidence_quality=record.evidence_quality,
        summary=record.summary,
        explanation=record.explanation,
        asn=record.asn,
        org_name=record.org_name,
        prefix=record.prefix,
        hostname=record.hostname,
        is_demo=record.is_demo,
        processing_time_ms=record.processing_time_ms,
        created_at=record.created_at,
        evidence=raw_evidence,
        signals=signals,
        conflicts=conflicts,
        graph=graph,
        candidate_scores={}
    )

@router.post("/save")
def save_report(
    req: SaveReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Bookmarks/saves an analysis report with a custom title and notes."""
    analysis = db.query(AnalysisRecord).filter(
        AnalysisRecord.id == req.analysis_id,
        AnalysisRecord.user_id == current_user.id
    ).first()

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    existing = db.query(SavedReport).filter(SavedReport.analysis_id == req.analysis_id).first()
    if existing:
        existing.title = req.title
        existing.notes = req.notes
        existing.tags = req.tags
    else:
        existing = SavedReport(
            user_id=current_user.id,
            analysis_id=req.analysis_id,
            title=req.title,
            notes=req.notes,
            tags=req.tags
        )
        db.add(existing)

    audit = AuditEvent(
        user_id=current_user.id,
        analysis_id=req.analysis_id,
        action="REPORT_SAVED",
        ip_address=analysis.ip_address,
        status="SUCCESS",
        details_json=json.dumps({"title": req.title})
    )
    db.add(audit)
    db.commit()

    return {"message": "Report saved successfully.", "id": existing.id}

@router.post("/compare")
def compare_analyses(
    req: CompareRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Compares two historical analyses side-by-side to highlight differences."""
    a = db.query(AnalysisRecord).filter(AnalysisRecord.id == req.analysis_id_a, AnalysisRecord.user_id == current_user.id).first()
    b = db.query(AnalysisRecord).filter(AnalysisRecord.id == req.analysis_id_b, AnalysisRecord.user_id == current_user.id).first()

    if not a or not b:
        raise HTTPException(status_code=404, detail="One or both analysis records were not found.")

    changes = []
    if a.network_type != b.network_type:
        changes.append(f"Network category changed from '{a.network_type}' to '{b.network_type}'")
    if a.confidence_score != b.confidence_score:
        changes.append(f"Confidence score changed from {a.confidence_score}% to {b.confidence_score}%")
    if a.asn != b.asn:
        changes.append(f"Origin ASN changed from '{a.asn or 'None'}' to '{b.asn or 'None'}'")
    if a.prefix != b.prefix:
        changes.append(f"Routing prefix changed from '{a.prefix or 'None'}' to '{b.prefix or 'None'}'")
    if a.hostname != b.hostname:
        changes.append(f"Reverse DNS hostname changed from '{a.hostname or 'None'}' to '{b.hostname or 'None'}'")

    return {
        "analysis_a": {
            "id": a.id, "ip": a.ip_address, "network_type": a.network_type,
            "confidence": a.confidence_score, "evidence_quality": a.evidence_quality,
            "asn": a.asn, "prefix": a.prefix, "hostname": a.hostname, "timestamp": a.created_at
        },
        "analysis_b": {
            "id": b.id, "ip": b.ip_address, "network_type": b.network_type,
            "confidence": b.confidence_score, "evidence_quality": b.evidence_quality,
            "asn": b.asn, "prefix": b.prefix, "hostname": b.hostname, "timestamp": b.created_at
        },
        "detected_changes": changes,
        "is_same_ip": a.ip_address == b.ip_address
    }
