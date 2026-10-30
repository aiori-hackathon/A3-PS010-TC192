"""
Analysis History Endpoints
Search, filter, sort, paginate, and delete past analyses.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc

from app.core.database import get_db
from app.models.user import User
from app.models.analysis import AnalysisRecord, SavedReport
from app.models.audit import AuditEvent
from app.api.deps import get_current_user

router = APIRouter(prefix="/history", tags=["Analysis History"])

@router.get("/")
def get_history(
    search: Optional[str] = Query(None, description="Search by IP or Org"),
    category: Optional[str] = Query(None, description="Filter by network type"),
    evidence_quality: Optional[str] = Query(None, description="Filter by quality"),
    is_saved_only: bool = Query(False, description="Filter only bookmarked/saved reports"),
    sort_by: str = Query("recent", description="recent, oldest, confidence_high, confidence_low"),
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns paginated, searchable, and filtered analysis history for the logged-in user."""
    query = db.query(AnalysisRecord).filter(AnalysisRecord.user_id == current_user.id)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (AnalysisRecord.ip_address.ilike(s)) |
            (AnalysisRecord.org_name.ilike(s)) |
            (AnalysisRecord.asn.ilike(s)) |
            (AnalysisRecord.hostname.ilike(s))
        )

    if category and category != "All":
        query = query.filter(AnalysisRecord.network_type == category)

    if evidence_quality and evidence_quality != "All":
        query = query.filter(AnalysisRecord.evidence_quality == evidence_quality)

    if is_saved_only:
        query = query.join(SavedReport, SavedReport.analysis_id == AnalysisRecord.id)

    total_count = query.count()

    # Sort
    if sort_by == "oldest":
        query = query.order_by(asc(AnalysisRecord.created_at))
    elif sort_by == "confidence_high":
        query = query.order_by(desc(AnalysisRecord.confidence_score))
    elif sort_by == "confidence_low":
        query = query.order_by(asc(AnalysisRecord.confidence_score))
    else:  # default 'recent'
        query = query.order_by(desc(AnalysisRecord.created_at))

    offset = (page - 1) * limit
    records = query.offset(offset).limit(limit).all()

    # Check which records are bookmarked/saved
    saved_ids = set(
        r[0] for r in db.query(SavedReport.analysis_id).filter(SavedReport.user_id == current_user.id).all()
    )

    items = [
        {
            "id": r.id,
            "ip_address": r.ip_address,
            "ip_version": r.ip_version,
            "network_type": r.network_type,
            "confidence_score": r.confidence_score,
            "confidence_level": r.confidence_level,
            "evidence_quality": r.evidence_quality,
            "asn": r.asn,
            "org_name": r.org_name,
            "hostname": r.hostname,
            "is_demo": r.is_demo,
            "is_saved": r.id in saved_ids,
            "created_at": r.created_at
        }
        for r in records
    ]

    return {
        "items": items,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit if total_count > 0 else 1
    }

@router.delete("/{analysis_id}")
def delete_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletes an analysis record belonging to the current user."""
    record = db.query(AnalysisRecord).filter(
        AnalysisRecord.id == analysis_id,
        AnalysisRecord.user_id == current_user.id
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    ip = record.ip_address
    db.delete(record)

    audit = AuditEvent(
        user_id=current_user.id,
        analysis_id=None,
        action="REPORT_DELETED",
        ip_address=ip,
        status="SUCCESS",
        details_json=f'{{"deleted_analysis_id": {analysis_id}, "ip": "{ip}"}}'
    )
    db.add(audit)
    db.commit()

    return {"message": "Analysis record deleted successfully."}
