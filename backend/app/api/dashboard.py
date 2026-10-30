"""
Dashboard Statistics API Endpoints
Aggregates real statistics from SQLite database for the logged-in user.
Provides real vs. demo separation, verifiable denominators, and explicit empty states.
"""
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.core.database import get_db
from app.models.user import User
from app.models.analysis import AnalysisRecord
from app.api.deps import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns real statistics computed directly from the SQLite database.
    Provides verified metrics, distinction between live and demo analyses,
    and returns None for uncomputable metrics (e.g. 0 total analyses).
    """
    user_query = db.query(AnalysisRecord).filter(AnalysisRecord.user_id == current_user.id)
    total_analyses = user_query.count()

    # Separate Live vs Demo analyses
    live_count = user_query.filter(AnalysisRecord.is_demo == False).count()
    demo_count = user_query.filter(AnalysisRecord.is_demo == True).count()

    # Unique IPs analyzed
    unique_ips = db.query(func.count(func.distinct(AnalysisRecord.ip_address))).filter(
        AnalysisRecord.user_id == current_user.id
    ).scalar() or 0

    # Category distribution
    cat_counts = db.query(
        AnalysisRecord.network_type,
        func.count(AnalysisRecord.id)
    ).filter(
        AnalysisRecord.user_id == current_user.id
    ).group_by(AnalysisRecord.network_type).all()

    category_distribution = [
        {
            "name": cat,
            "count": cnt,
            "percentage": round((cnt / total_analyses) * 100, 1) if total_analyses > 0 else 0.0
        }
        for cat, cnt in cat_counts
    ]

    # Evidence quality overview
    quality_counts = db.query(
        AnalysisRecord.evidence_quality,
        func.count(AnalysisRecord.id)
    ).filter(
        AnalysisRecord.user_id == current_user.id
    ).group_by(AnalysisRecord.evidence_quality).all()

    evidence_quality_distribution = [
        {"quality": q, "count": cnt} for q, cnt in quality_counts
    ]

    # High Quality Ratio Calculation:
    # Denominator = total_analyses (stored user records)
    # Numerator = records with evidence_quality == 'Strong'
    strong_quality_count = sum(cnt for q, cnt in quality_counts if q == "Strong")
    high_quality_ratio: Optional[float] = None
    if total_analyses > 0:
        high_quality_ratio = round((strong_quality_count / total_analyses) * 100, 1)

    # Analyses with detected contradictions
    conflicts_count = db.query(AnalysisRecord).filter(
        AnalysisRecord.user_id == current_user.id,
        AnalysisRecord.conflicts_json != "[]",
        AnalysisRecord.conflicts_json.isnot(None)
    ).count()

    # Recent 5 analyses
    recent_records = user_query.order_by(desc(AnalysisRecord.created_at)).limit(5).all()
    recent = [
        {
            "id": r.id,
            "ip_address": r.ip_address,
            "network_type": r.network_type,
            "confidence_score": r.confidence_score,
            "confidence_level": r.confidence_level,
            "evidence_quality": r.evidence_quality,
            "asn": r.asn,
            "org_name": r.org_name,
            "created_at": r.created_at,
            "is_demo": r.is_demo
        }
        for r in recent_records
    ]

    return {
        "user_name": current_user.full_name,
        "total_analyses": total_analyses,
        "live_analyses_count": live_count,
        "demo_analyses_count": demo_count,
        "unique_ips": unique_ips,
        "conflicts_count": conflicts_count,
        "high_quality_ratio": high_quality_ratio,
        "category_distribution": category_distribution,
        "evidence_quality_distribution": evidence_quality_distribution,
        "recent_analyses": recent,
        "team_meta": {
            "project_name": settings.PROJECT_NAME,
            "team_name": settings.TEAM_NAME,
            "team_code": settings.TEAM_CODE,
            "institution": settings.INSTITUTION,
            "classifier_version": settings.CLASSIFIER_VERSION
        }
    }
