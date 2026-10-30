"""
Database Initialization and Seed Data for NetEvidence AI
"""
from datetime import datetime, timezone
import json
from app.core.database import engine, Base, SessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.analysis import AnalysisRecord, SavedReport
from app.models.audit import AuditEvent
from app.services.classifier import NetworkClassifier

classifier_instance = NetworkClassifier()

def init_db():
    # Create all tables in SQLite
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if demo user exists
        demo_user = db.query(User).filter(User.email == "demo@netevidence.ai").first()
        if not demo_user:
            demo_user = User(
                email="demo@netevidence.ai",
                full_name="AIORI Evaluator / Analyst",
                hashed_password=hash_password("Password123!"),
                is_active=True,
                is_admin=True
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print(f"[+] Created default demo user: demo@netevidence.ai / Password123!")

            # Seed demo analyses for demo user
            for key in ["residential_clear", "datacenter_clear", "conflicting_signals"]:
                case = DEMO_CASES[key]
                has_conflict = case.get("has_conflict", False)
                conflicts = []
                if has_conflict:
                    conflicts = [{
                        "id": "demo_conflict",
                        "title": "Residential vs. Hosting Contradiction",
                        "source_a": "BGP Routing Registry",
                        "value_a": "AS20115 (Charter Spectrum)",
                        "source_b": "Reverse DNS (PTR)",
                        "value_b": "server01.hostcloudvps.net",
                        "why_it_matters": "Consumer broadband subnets normally do not host commercial cloud virtual machines.",
                        "severity": "High",
                        "affected_outcome": True,
                        "resolution_strategy": "Downweights confidence score by 25 points."
                    }]

                evidence_objs = [
                    from_dict for from_dict in case.get("evidence", [])
                ]
                from app.schemas.analysis import EvidenceItem
                ev_items = [
                    EvidenceItem(
                        id=e.get("id", "ev"),
                        source=e.get("source", "Sensor"),
                        category=e.get("category", "intelligence"),
                        key=e.get("key", "attr"),
                        value=e.get("value"),
                        freshness="Seed Data",
                        status=e.get("status", "verified"),
                        contribution=e.get("contribution", "Supporting"),
                        impact_category=e.get("impact_category"),
                        score_impact=e.get("score_impact", 0.0),
                        reference_url=None,
                        error_details=None,
                        collected_at=datetime.now(timezone.utc)
                    )
                    for e in case.get("evidence", [])
                ]
                built_graph = classifier_instance._build_evidence_graph(
                    ip=case["ip"],
                    asn=case.get("asn"),
                    org=case.get("org_name"),
                    hostname=case.get("hostname"),
                    prefix=case.get("prefix"),
                    evidence=ev_items,
                    winning_category=case["expected_category"]
                )

                record = AnalysisRecord(
                    user_id=demo_user.id,
                    ip_address=case["ip"],
                    ip_version=4,
                    is_public=True,
                    ip_category_type="public",
                    network_type=case["expected_category"],
                    confidence_score=78 if has_conflict else 92,
                    confidence_level="Moderate" if has_conflict else "High",
                    evidence_quality=case["evidence_quality"],
                    summary=f"{case['ip']} is classified as {case['expected_category']}.",
                    explanation=f"Demonstration analysis for {case['name']}. {case['description']}",
                    asn=case.get("asn"),
                    org_name=case.get("org_name"),
                    prefix=case.get("prefix"),
                    hostname=case.get("hostname"),
                    processing_time_ms=124.5,
                    is_demo=True,
                    raw_evidence_json=json.dumps(case.get("evidence", [])),
                    signals_json="[]",
                    conflicts_json=json.dumps(conflicts),
                    graph_json=json.dumps(built_graph),
                    created_at=datetime.now(timezone.utc)
                )
                db.add(record)
                db.commit()
                db.refresh(record)

                # Add audit event
                audit = AuditEvent(
                    user_id=demo_user.id,
                    analysis_id=record.id,
                    action="ANALYSIS_PERFORMED",
                    ip_address=record.ip_address,
                    status="SUCCESS",
                    details_json=json.dumps({"is_demo": True, "category": record.network_type})
                )
                db.add(audit)
                db.commit()

            print("[+] Seeded demo analysis records successfully.")
        else:
            print("[*] Demo user already exists.")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
