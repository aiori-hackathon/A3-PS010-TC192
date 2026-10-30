"""
Unit tests for Network Classifier, Confidence Scoring, and Benchmark Evaluation
"""
from datetime import datetime, timezone
from app.services.ip_validator import validate_and_classify_ip
from app.services.classifier import NetworkClassifier
from app.services.benchmark_runner import BenchmarkRunner
from app.schemas.analysis import EvidenceItem

classifier = NetworkClassifier()

def test_clear_residential_classification():
    ip = "73.168.45.112"
    val = validate_and_classify_ip(ip)
    now = datetime.now(timezone.utc)
    evidence = [
        EvidenceItem(
            id="1", source="ASN Registry", category="asn", key="asn_holder_org",
            value="Comcast Cable Communications", freshness="Live", status="verified",
            contribution="+40 Residential", impact_category="Residential", score_impact=40.0, collected_at=now
        ),
        EvidenceItem(
            id="2", source="Reverse DNS", category="rdns", key="ptr_hostname",
            value="c-73-168-45-112.hsd1.co.comcast.net", freshness="Live", status="verified",
            contribution="+30 Residential", impact_category="Residential", score_impact=30.0, collected_at=now
        )
    ]
    resp = classifier.classify(ip, val, evidence)
    assert resp.network_type == "Residential"
    assert resp.confidence_score >= 60
    assert resp.evidence_quality in ["Strong", "Moderate"]
    assert "Comcast" in resp.explanation

def test_insufficient_evidence():
    # Public IP with zero evidence
    ip = "192.88.99.1"
    val = validate_and_classify_ip(ip)
    resp = classifier.classify(ip, val, [])
    assert resp.network_type == "Unknown / Insufficient Evidence"
    assert resp.confidence_score == 0
    assert "insufficient supporting evidence" in resp.summary.lower() or "not enough conclusive evidence" in resp.explanation.lower()

def test_weak_score_falls_back_to_insufficient_evidence():
    # Only 1 weak signal giving 15 points (below the 35 threshold)
    ip = "192.88.99.2"
    val = validate_and_classify_ip(ip)
    now = datetime.now(timezone.utc)
    evidence = [
        EvidenceItem(
            id="weak1", source="BGP Routing", category="bgp", key="routed_prefix",
            value="192.88.99.0/24", freshness="Live", status="verified",
            contribution="+15 Residential", impact_category="Residential", score_impact=15.0, collected_at=now
        )
    ]
    resp = classifier.classify(ip, val, evidence)
    # Must NOT guess Residential on 15 points
    assert resp.network_type == "Unknown / Insufficient Evidence"
    assert resp.confidence_score == 0

def test_single_source_family_caps_confidence_as_tentative():
    # Two observations, but both from the SAME source family (routing_bgp)
    ip = "54.214.12.89"
    val = validate_and_classify_ip(ip)
    now = datetime.now(timezone.utc)
    evidence = [
        EvidenceItem(
            id="bgp1", source="BGP Route Table", category="bgp", key="routed_prefix",
            value="54.214.0.0/16", freshness="Live", status="verified",
            contribution="+20 Hosting", impact_category="Hosting / Datacenter", score_impact=20.0, collected_at=now
        ),
        EvidenceItem(
            id="bgp2", source="BGP Origin Registry", category="asn", key="origin_asn",
            value="AS16509", freshness="Live", status="verified",
            contribution="+40 Hosting", impact_category="Hosting / Datacenter", score_impact=40.0, collected_at=now
        )
    ]
    resp = classifier.classify(ip, val, evidence)
    assert resp.network_type == "Hosting / Datacenter"
    # Because only 1 source family agreed, confidence must be capped below high certainty
    assert resp.confidence_score <= 65
    assert resp.confidence_level in ["Tentative", "Moderate"]

def test_custom_csv_benchmark_evaluation():
    csv_sample = (
        "ip_address,ground_truth,notes\n"
        "73.168.45.112,Residential,Sample 1\n"
        "54.214.12.89,Hosting / Datacenter,Sample 2\n"
        "192.0.2.1,Unknown / Insufficient Evidence,Sample 3\n"
    )
    runner = BenchmarkRunner()
    result = runner.evaluate_csv_data(csv_sample, filename="test_eval.csv")
    assert result.total_samples == 3
    assert result.correct_predictions >= 2
    assert result.overall_accuracy > 0
    assert result.is_custom_dataset is True
    assert "Custom Upload: test_eval.csv" in result.dataset_info["name"]
