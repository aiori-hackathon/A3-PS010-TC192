"""
Benchmark & Model Evaluation Pydantic Schemas
"""
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class BenchmarkItem(BaseModel):
    ip: str
    ground_truth: str
    predicted: str
    confidence: int
    is_correct: bool
    evidence_quality: str
    notes: str

class CategoryMetrics(BaseModel):
    category: str
    precision: float
    recall: float
    f1_score: float
    total_samples: int

class BenchmarkResult(BaseModel):
    total_samples: int
    correct_predictions: int
    overall_accuracy: float
    macro_f1: float
    unknown_abstention_rate: float = 0.0
    category_metrics: List[CategoryMetrics]
    confusion_matrix: Dict[str, Dict[str, int]]
    baseline_accuracy: float
    baseline_notes: str
    items: List[BenchmarkItem]
    timestamp: datetime
    is_custom_dataset: bool = False
    dataset_info: Dict[str, Any]
