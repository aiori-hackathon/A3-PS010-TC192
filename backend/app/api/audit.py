"""
Audit Trail API Endpoints
Provides an auditable record of all operations, evidence collection, and classifications.
"""
import json
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.user import User
from app.models.audit import AuditEvent
from app.api.deps import get_current_user

router = APIRouter(prefix="/audit", tags=["Audit Trail"])

@router.get("/")
def get_audit_trail(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    action: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns an auditable log of the user's analyses, logins, and report modifications.
    """
    query = db.query(AuditEvent).filter(AuditEvent.user_id == current_user.id)
    if action:
        query = query.filter(AuditEvent.action == action)

    total_count = query.count()
    records = query.order_by(desc(AuditEvent.created_at)).offset((page - 1) * limit).limit(limit).all()

    items = []
    for r in records:
        try:
            details = json.loads(r.details_json or "{}")
        except Exception:
            details = {"raw": r.details_json}

        items.append({
            "id": r.id,
            "user_id": r.user_id,
            "analysis_id": r.analysis_id,
            "action": r.action,
            "ip_address": r.ip_address,
            "status": r.status,
            "details": details,
            "created_at": r.created_at
        })

    return {
        "items": items,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit if total_count > 0 else 1
    }
