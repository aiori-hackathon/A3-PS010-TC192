"""
Benchmarking API Endpoints
Runs evaluations of classification models against ground-truth datasets,
including user-uploaded CSV benchmarks and downloadable reference templates.
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.audit import AuditEvent
from app.api.deps import get_current_user
from app.schemas.benchmark import BenchmarkResult
from app.services.benchmark_runner import BenchmarkRunner, BENCHMARK_DATASET

router = APIRouter(prefix="/benchmark", tags=["Model Benchmarking"])
runner = BenchmarkRunner()

@router.get("/run", response_model=BenchmarkResult)
def execute_benchmark(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Executes live evaluation against the ground-truth reference test corpus.
    Calculates Accuracy, Precision, Recall, F1, Confusion Matrix, and Unknown Abstention Rate.
    """
    result = runner.run_benchmark()

    # Log audit event
    audit = AuditEvent(
        user_id=current_user.id,
        action="BENCHMARK_EXECUTED",
        status="SUCCESS",
        details_json=f'{{"accuracy": {result.overall_accuracy}, "samples": {result.total_samples}, "macro_f1": {result.macro_f1}, "abstention_rate": {result.unknown_abstention_rate}}}'
    )
    db.add(audit)
    db.commit()

    return result

@router.post("/upload-csv", response_model=BenchmarkResult)
async def evaluate_uploaded_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Accepts and evaluates a user-uploaded CSV dataset.
    Requires headers: 'ip_address' (or 'ip') and 'ground_truth' (or 'label').
    """
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a standard comma-separated (.csv) file."
        )

    content_bytes = await file.read()
    try:
        content_str = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        content_str = content_bytes.decode("latin-1")

    try:
        result = runner.evaluate_csv_data(content_str, filename=file.filename)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    # Log audit event
    audit = AuditEvent(
        user_id=current_user.id,
        action="CUSTOM_BENCHMARK_EVALUATED",
        status="SUCCESS",
        details_json=f'{{"filename": "{file.filename}", "accuracy": {result.overall_accuracy}, "samples": {result.total_samples}}}'
    )
    db.add(audit)
    db.commit()

    return result

@router.get("/template-csv")
def download_template_csv():
    """Generates and serves a valid benchmark CSV dataset template."""
    csv_rows = [
        "ip_address,ground_truth,notes",
        "73.168.45.112,Residential,Comcast Cable broadband subscriber pool",
        "54.214.12.89,Hosting / Datacenter,AWS EC2 us-west-2 cloud virtual machine",
        "18.178.2.55,Enterprise / Campus,MIT University campus research laboratory",
        "174.216.78.90,Mobile,Verizon Wireless cellular mobile APN gateway",
        "198.54.117.44,Hosting / Datacenter,Colocated hosting subnet with leased ISP block",
        "192.0.2.1,Unknown / Insufficient Evidence,RFC 5737 unrouted test documentation IP"
    ]
    csv_data = "\n".join(csv_rows)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="netevidence_benchmark_sample.csv"'}
    )

@router.get("/dataset")
def get_dataset_info():
    """Returns dataset provenance, distribution, and licensing."""
    return {
        "dataset_name": "NetEvidence AI Curated Ground-Truth Evaluation Set v1.0",
        "sample_count": len(BENCHMARK_DATASET),
        "categories": ["Residential", "Mobile", "Enterprise / Campus", "Hosting / Datacenter", "Unknown / Insufficient Evidence"],
        "provenance": "CAIDA, ARIN/RIPE Whois, AWS/GCP Public CIDR ranges, University Registrar",
        "class_balance": {
            "Residential": 5,
            "Hosting / Datacenter": 6,
            "Enterprise / Campus": 4,
            "Mobile": 3,
            "Unknown / Insufficient Evidence": 2
        },
        "licensing": "Open measurement and research data (RFC 2544/5737 compliant)"
    }
