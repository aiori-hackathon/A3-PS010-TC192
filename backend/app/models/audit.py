"""
Audit Log Model for NetEvidence AI
Preserves an immutable and explainable audit trail of every analysis and evaluation.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    analysis_id = Column(Integer, ForeignKey("analysis_records.id"), nullable=True, index=True)
    action = Column(String(64), nullable=False, index=True)
    ip_address = Column(String(128), nullable=True)
    status = Column(String(32), default="SUCCESS")
    details_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    user = relationship("User", back_populates="audit_events")
    analysis = relationship("AnalysisRecord", back_populates="audit_events")
