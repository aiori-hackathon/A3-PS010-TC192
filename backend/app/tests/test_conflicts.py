"""
Unit tests for Conflict Detection
"""
from datetime import datetime, timezone
from app.services.conflict_detector import ConflictDetector
from app.schemas.analysis import EvidenceItem

detector = ConflictDetector()

def test_detect_residential_hosting_conflict():
    now = datetime.now(timezone.utc)
    evidence = [
        EvidenceItem(
            id="1", source="BGP Routing", category="asn", key="asn_holder_org",
            value="Comcast Cable", freshness="Live", status="verified",
            contribution="+40 Residential", impact_category="Residential", score_impact=40.0, collected_at=now
        ),
        EvidenceItem(
            id="2", source="Reverse DNS", category="rdns", key="ptr_hostname",
            value="server01.compute.vpscloud.com", freshness="Live", status="verified",
            contribution="+35 Hosting", impact_category="Hosting / Datacenter", score_impact=35.0, collected_at=now
        )
    ]
    conflicts = detector.detect_conflicts(evidence)
    assert len(conflicts) >= 1
    c = conflicts[0]
    assert c.severity == "High"
    assert "Residential vs. Cloud/Datacenter" in c.title
    assert c.affected_outcome is True
