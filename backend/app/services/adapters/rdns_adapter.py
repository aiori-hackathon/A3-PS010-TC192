"""
Reverse DNS (PTR) Evidence Adapter
Performs real PTR queries to discover hostname and extracts naming heuristics.
"""
import asyncio
import socket
import re
from datetime import datetime, timezone
from typing import List, Optional
from app.services.adapters.base_adapter import BaseEvidenceAdapter
from app.schemas.analysis import EvidenceItem

def _sync_reverse_dns_lookup(ip: str) -> str:
    """Helper executed in a background worker thread to prevent event-loop blocking."""
    host, _, _ = socket.gethostbyaddr(ip)
    return host

class ReverseDNSAdapter(BaseEvidenceAdapter):
    @property
    def source_name(self) -> str:
        return "System DNS Resolver (PTR)"

    @property
    def source_category(self) -> str:
        return "rdns"

    async def collect(self, ip: str) -> List[EvidenceItem]:
        items: List[EvidenceItem] = []
        now = datetime.now(timezone.utc)
        
        # Step 1: Perform reverse lookup asynchronously with strict 3.0s timeout
        hostname: Optional[str] = None
        error_msg: Optional[str] = None
        try:
            hostname = await asyncio.wait_for(
                asyncio.to_thread(_sync_reverse_dns_lookup, ip),
                timeout=3.0
            )
        except asyncio.TimeoutError:
            error_msg = "Reverse DNS lookup timed out after 3.0 seconds."
        except socket.herror:
            error_msg = "No PTR (Pointer) record found in authoritative DNS."
        except Exception as e:
            error_msg = f"DNS lookup error: {str(e)}"

        if hostname:
            items.append(EvidenceItem(
                id=f"rdns_hostname_{ip}",
                source=self.source_name,
                category=self.source_category,
                key="ptr_hostname",
                value=hostname,
                freshness="Live (Real-time query)",
                status="verified",
                contribution="Neutral",
                score_impact=0.0,
                reference_url=f"dns://{ip}",
                error_details=None,
                collected_at=now
            ))

            # Step 2: Analyze naming patterns for network clues
            lower_host = hostname.lower()

            # Pattern check: Residential / Consumer
            res_matches = re.findall(r"(res|cpe|dynamic|dhcp|dsl|cable|broadband|pool|customer|user|home|ftth)", lower_host)
            if res_matches:
                items.append(EvidenceItem(
                    id=f"rdns_hint_res_{ip}",
                    source="Reverse DNS Heuristics",
                    category=self.source_category,
                    key="hostname_naming_pattern",
                    value=f"Matches consumer/residential patterns: '{', '.join(set(res_matches))}'",
                    freshness="Derived from PTR",
                    status="inferred",
                    contribution="+25 towards Residential",
                    impact_category="Residential",
                    score_impact=25.0,
                    reference_url=None,
                    error_details=None,
                    collected_at=now
                ))

            # Pattern check: Mobile / Cellular
            mobile_matches = re.findall(r"(mobile|cellular|lte|4g|5g|gprs|spcsdns|wireless|cell)", lower_host)
            if mobile_matches:
                items.append(EvidenceItem(
                    id=f"rdns_hint_mob_{ip}",
                    source="Reverse DNS Heuristics",
                    category=self.source_category,
                    key="hostname_naming_pattern",
                    value=f"Matches cellular/mobile carrier patterns: '{', '.join(set(mobile_matches))}'",
                    freshness="Derived from PTR",
                    status="inferred",
                    contribution="+35 towards Mobile",
                    impact_category="Mobile",
                    score_impact=35.0,
                    reference_url=None,
                    error_details=None,
                    collected_at=now
                ))

            # Pattern check: Hosting / Cloud
            cloud_matches = re.findall(r"(compute|amazonaws|googleusercontent|cloud|vps|server|dedicated|linode|digitalocean|hetzner|ovh|datacenter|rack|host)", lower_host)
            if cloud_matches:
                items.append(EvidenceItem(
                    id=f"rdns_hint_cloud_{ip}",
                    source="Reverse DNS Heuristics",
                    category=self.source_category,
                    key="hostname_naming_pattern",
                    value=f"Matches hosting/datacenter infrastructure: '{', '.join(set(cloud_matches))}'",
                    freshness="Derived from PTR",
                    status="inferred",
                    contribution="+35 towards Hosting / Datacenter",
                    impact_category="Hosting / Datacenter",
                    score_impact=35.0,
                    reference_url=None,
                    error_details=None,
                    collected_at=now
                ))

            # Pattern check: Enterprise / Campus (.edu, .ac, univ, campus)
            edu_matches = re.findall(r"(\.edu|\.ac\.|campus|univ|school|college|research|institute)", lower_host)
            if edu_matches:
                items.append(EvidenceItem(
                    id=f"rdns_hint_edu_{ip}",
                    source="Reverse DNS Heuristics",
                    category=self.source_category,
                    key="hostname_naming_pattern",
                    value=f"Matches educational or academic campus domain: '{', '.join(set(edu_matches))}'",
                    freshness="Derived from PTR",
                    status="inferred",
                    contribution="+40 towards Enterprise / Campus",
                    impact_category="Enterprise / Campus",
                    score_impact=40.0,
                    reference_url=None,
                    error_details=None,
                    collected_at=now
                ))
        else:
            items.append(EvidenceItem(
                id=f"rdns_hostname_{ip}",
                source=self.source_name,
                category=self.source_category,
                key="ptr_hostname",
                value="None (Not Found)",
                freshness="Live query",
                status="missing",
                contribution="Missing hostname evidence (common in consumer broadband and some cloud endpoints)",
                score_impact=0.0,
                reference_url=None,
                error_details=error_msg,
                collected_at=now
            ))

        return items
