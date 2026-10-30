"""
Comprehensive End-to-End API Test Suite using FastAPI TestClient
Tests the entire user lifecycle, authentication, validation, analysis,
conflict detection, bookmarks, history, benchmarking, and audit trails.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine, SessionLocal
from app.database.init_db import init_db

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    init_db()

def test_health_and_root():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["project"] == "NetEvidence AI"

    health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"

def test_login_demo_user():
    res = client.post("/api/v1/auth/login", json={
        "email": "demo@netevidence.ai",
        "password": "Password123!"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "demo@netevidence.ai"

import uuid

def test_register_and_login_new_user():
    email = f"researcher_{uuid.uuid4().hex[:8]}@domain.org"
    reg_res = client.post("/api/v1/auth/register", json={
        "email": email,
        "full_name": "Aditi Sharma",
        "password": "StrongPassword123!"
    })
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]
    assert token is not None

    # Test me
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == email

def test_ip_validation_endpoint():
    res = client.post("/api/v1/analysis/validate", json={"ip_address": "8.8.8.8"})
    assert res.status_code == 200
    data = res.json()
    assert data["is_valid"] is True
    assert data["is_public"] is True

    # Private
    priv = client.post("/api/v1/analysis/validate", json={"ip_address": "192.168.1.1"})
    assert priv.status_code == 200
    assert priv.json()["is_public"] is False
    assert priv.json()["category"] == "private"

def test_full_analysis_pipeline_and_audit():
    # Login as demo user
    login_res = client.post("/api/v1/auth/login", json={
        "email": "demo@netevidence.ai",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Analyze residential demo
    res1 = client.post("/api/v1/analysis/analyze", json={
        "ip_address": "73.168.45.112",
        "force_demo": True
    }, headers=headers)
    assert res1.status_code == 200
    d1 = res1.json()
    assert d1["network_type"] == "Residential"
    assert d1["confidence_score"] >= 60
    assert d1["id"] is not None
    id_1 = d1["id"]

    # 2. Analyze conflicting signals demo
    res2 = client.post("/api/v1/analysis/analyze", json={
        "ip_address": "198.54.117.44",
        "force_demo": True
    }, headers=headers)
    assert res2.status_code == 200
    d2 = res2.json()
    assert len(d2["conflicts"]) >= 1
    id_2 = d2["id"]

    # 3. Save / Bookmark report
    save_res = client.post("/api/v1/analysis/save", json={
        "analysis_id": id_1,
        "title": "Suspected Residential Node",
        "notes": "Verified for hackathon demo"
    }, headers=headers)
    assert save_res.status_code == 200

    # 4. Compare reports
    cmp_res = client.post("/api/v1/analysis/compare", json={
        "analysis_id_a": id_1,
        "analysis_id_b": id_2
    }, headers=headers)
    assert cmp_res.status_code == 200
    cmp_data = cmp_res.json()
    assert "detected_changes" in cmp_data

    # 5. Fetch Dashboard stats
    dash_res = client.get("/api/v1/dashboard/stats", headers=headers)
    assert dash_res.status_code == 200
    assert dash_res.json()["total_analyses"] >= 2

    # 6. Run Benchmark
    bm_res = client.get("/api/v1/benchmark/run", headers=headers)
    assert bm_res.status_code == 200
    bm_data = bm_res.json()
    assert bm_data["overall_accuracy"] >= 80.0
    assert len(bm_data["items"]) == 20

    # 7. Check Audit Trail
    audit_res = client.get("/api/v1/audit/", headers=headers)
    assert audit_res.status_code == 200
    assert audit_res.json()["total"] >= 3
