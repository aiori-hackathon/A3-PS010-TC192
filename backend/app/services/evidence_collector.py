"""
Evidence Collection Orchestrator
Gathers network evidence from modular source adapters in parallel,
preserving source attribution, timestamps, and error states.
"""
import asyncio
from datetime import datetime, timezone
from typing import List, Tuple, Optional, Dict, Any

from app.schemas.analysis import EvidenceItem, IPValidationResult
from app.services.adapters.rdns_adapter import ReverseDNSAdapter
from app.services.adapters.ripestat_adapter import RIPEStatAdapter
from app.services.adapters.demo_adapter import DemoAdapter, DEMO_CASES

class EvidenceCollector:
    def __init__(self):
        self.rdns_adapter = ReverseDNSAdapter()
        self.ripestat_adapter = RIPEStatAdapter()

    async def collect_live_evidence(self, ip: str, validation: IPValidationResult) -> List[EvidenceItem]:
        """
        Queries live external and system sensors concurrently.
        Safely respects non-public addresses by refusing to query public registries.
        """
        now = datetime.now(timezone.utc)
        items: List[EvidenceItem] = []

        # If IP is not public, do NOT query public internet providers
        if not validation.can_query_public_sources:
            items.append(EvidenceItem(
                id=f"scope_restriction_{ip}",
                source="NetEvidence Security Policy",
                category="policy",
                key="query_restriction",
                value=f"Public intelligence queries suppressed for {validation.category.upper()} address.",
                freshness="Policy Rule",
                status="verified",
                contribution="Neutral (Protected local network privacy)",
                score_impact=0.0,
                reference_url=None,
                error_details=validation.explanation,
                collected_at=now
            ))
            return items

        # Query live sensors concurrently with asyncio.gather
        rdns_task = self.rdns_adapter.collect(ip)
        ripestat_task = self.ripestat_adapter.collect(ip)

        results = await asyncio.gather(rdns_task, ripestat_task, return_exceptions=True)

        for res in results:
            if isinstance(res, list):
                items.extend(res)
            elif isinstance(res, Exception):
                items.append(EvidenceItem(
                    id=f"adapter_unhandled_err_{ip}",
                    source="Evidence Collector",
                    category="system",
                    key="adapter_failure",
                    value="Sensor exception occurred",
                    freshness="Live attempt",
                    status="error",
                    contribution="Unavailable provider",
                    score_impact=0.0,
                    reference_url=None,
                    error_details=str(res),
                    collected_at=now
                ))

        return items

    def load_demo_evidence(self, demo_case_data: Dict[str, Any]) -> List[EvidenceItem]:
        """
        Loads pre-configured simulated evidence items for demo evaluation.
        Every item is clearly labeled as SIMULATED / DEMO.
        """
        now = datetime.now(timezone.utc)
        items: List[EvidenceItem] = []

        for raw in demo_case_data.get("evidence", []):
            items.append(EvidenceItem(
                id=raw.get("id", f"demo_{raw.get('key')}"),
                source=f"{raw.get('source')} (DEMO DATA)",
                category=raw.get("category", "intelligence"),
                key=raw.get("key", "attribute"),
                value=raw.get("value"),
                freshness="SIMULATED (Demo Data)",
                status=raw.get("status", "simulated"),
                contribution=raw.get("contribution", "Simulated demo signal"),
                impact_category=raw.get("impact_category"),
                score_impact=raw.get("score_impact", 0.0),
                reference_url=None,
                error_details=raw.get("error_details"),
                collected_at=now
            ))

        return items
