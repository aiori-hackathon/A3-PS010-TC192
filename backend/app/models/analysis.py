"""
Analysis Database Models
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class AnalysisRecord(Base):
    __tablename__ = "analysis_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    ip_address = Column(String(128), index=True, nullable=False)
    ip_version = Column(Integer, default=4)
    is_public = Column(Boolean, default=True)
    ip_category_type = Column(String(64), default="public")
    
    # Classification Results
    network_type = Column(String(64), nullable=False, index=True)
    confidence_score = Column(Integer, default=0)
    confidence_level = Column(String(32), default="Low")
    evidence_quality = Column(String(32), default="Limited")
    summary = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    
    # Quick access fields
    asn = Column(String(64), nullable=True)
    org_name = Column(String(255), nullable=True)
    prefix = Column(String(128), nullable=True)
    hostname = Column(String(255), nullable=True)
    
    # Execution metrics & audit
    processing_time_ms = Column(Float, default=0.0)
    is_demo = Column(Boolean, default=False)
    classifier_version = Column(String(32), default="v1.2-rule-fusion")
    
    # Deep structured data stored as JSON strings
    raw_evidence_json = Column(Text, default="[]")
    signals_json = Column(Text, default="[]")
    conflicts_json = Column(Text, default="[]")
    graph_json = Column(Text, default="{}")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    user = relationship("User", back_populates="analyses")
    audit_events = relationship("AuditEvent", back_populates="analysis", cascade="all, delete-orphan")
    saved_report = relationship("SavedReport", back_populates="analysis", uselist=False, cascade="all, delete-orphan")

class SavedReport(Base):
    __tablename__ = "saved_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    analysis_id = Column(Integer, ForeignKey("analysis_records.id"), nullable=False, unique=True)
    title = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    tags = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    analysis = relationship("AnalysisRecord", back_populates="saved_report")
