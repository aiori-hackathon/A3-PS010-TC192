"""
Audit Pydantic Schemas
"""
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel

class AuditEventResponse(BaseModel):
    id: int
    user_id: int
    analysis_id: Optional[int]
    action: str
    ip_address: Optional[str]
    status: str
    details: Dict[str, Any]
    created_at: datetime

    model_config = {"from_attributes": True}
