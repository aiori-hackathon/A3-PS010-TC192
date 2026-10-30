"""
RIPEstat Open API Evidence Adapter
Queries RIPE NCC's official open routing and allocation intelligence.
"""
import httpx
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.services.adapters.base_adapter import BaseEvidenceAdapter
from app.schemas.analysis import EvidenceItem
from app.core.config import settings

class RIPEStatAdapter(BaseEvidenceAdapter):
    @property
    def source_name(self) -> str:
        return "RIPEstat Open Intelligence (RIPE NCC)"

    @property
    def source_category(self) -> str:
        return "intelligence"

    async def collect(self, ip: str) -> List[EvidenceItem]:
        items: List[EvidenceItem] = []
        now = datetime.now(timezone.utc)
        timeout = settings.HTTP_TIMEOUT_SECONDS

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                # 1. Query network-info
                net_url = f"{settings.RIPE_STAT_BASE_URL}/network-info/data.json?resource={ip}"
                net_resp = await client.get(net_url)
                
                prefix: Optional[str] = None
                asns: List[int] = []

                if net_resp.status_code == 200:
                    raw_net = net_resp.json() or {}
                    net_data = raw_net.get("data") or {}
                    prefix = net_data.get("prefix")
                    asns = net_data.get("asns") or []

                    if prefix:
                        items.append(EvidenceItem(
                            id=f"ripestat_prefix_{ip}",
                            source=self.source_name,
                            category="bgp",
                            key="routed_prefix",
                            value=prefix,
                            freshness="Live (RIPE NCC)",
                            status="verified",
                            contribution="Routing prefix observed in global BGP routing tables",
                            score_impact=0.0,
                            reference_url=net_url,
                            error_details=None,
                            collected_at=now
                        ))

                    if asns and len(asns) > 0:
                        asn_str = f"AS{asns[0]}"
                        items.append(EvidenceItem(
                            id=f"ripestat_asn_{ip}",
                            source=self.source_name,
                            category="asn",
                            key="origin_asn",
                            value=asn_str,
                            freshness="Live (RIPE NCC)",
                            status="verified",
                            contribution="Origin Autonomous System advertising this IP prefix",
                            score_impact=0.0,
                            reference_url=net_url,
                            error_details=None,
                            collected_at=now
                        ))

                # 2. Query prefix-overview for announced status & holder
                if prefix or asns:
                    overview_url = f"{settings.RIPE_STAT_BASE_URL}/prefix-overview/data.json?resource={ip}"
                    ov_resp = await client.get(overview_url)
                    if ov_resp.status_code == 200:
                        raw_ov = ov_resp.json() or {}
                        ov_data = raw_ov.get("data") or {}
                        is_announced = ov_data.get("is_announced", True)
                        asns_details = ov_data.get("asns") or []
                        holder = asns_details[0].get("holder") if asns_details and isinstance(asns_details[0], dict) else None

                        if holder:
                            items.append(EvidenceItem(
                                id=f"ripestat_holder_{ip}",
                                source=self.source_name,
                                category="asn",
                                key="asn_holder_org",
                                value=holder,
                                freshness="Live (RIPE NCC)",
                                status="verified",
                                contribution="Registered Autonomous System Operator Organization",
                                score_impact=0.0,
                                reference_url=overview_url,
                                error_details=None,
                                collected_at=now
                            ))

                        items.append(EvidenceItem(
                            id=f"ripestat_announced_{ip}",
                            source=self.source_name,
                            category="bgp",
                            key="bgp_announced_state",
                            value="Announced in BGP" if is_announced else "Not Announced in Active BGP Tables",
                            freshness="Live (RIPE NCC)",
                            status="verified" if is_announced else "missing",
                            contribution="+10 Routable Network" if is_announced else "-30 Unannounced Route",
                            score_impact=10.0 if is_announced else -30.0,
                            reference_url=overview_url,
                            error_details=None if is_announced else "Prefix is not actively announced in BGP route collectors.",
                            collected_at=now
                        ))

                # 3. Query whois data for netname / descriptions
                whois_url = f"{settings.RIPE_STAT_BASE_URL}/whois/data.json?resource={ip}"
                whois_resp = await client.get(whois_url)
                if whois_resp.status_code == 200:
                    raw_whois = whois_resp.json() or {}
                    whois_data = raw_whois.get("data") or {}
                    records = whois_data.get("records") or []
                    netname = None
                    descr_list = []
                    
                    for group in records:
                        if isinstance(group, list):
                            for entry in group:
                                if isinstance(entry, dict):
                                    key = entry.get("key", "").lower()
                                    val = entry.get("value", "")
                                    if key in ["netname", "network-name"] and not netname:
                                        netname = val
                                    elif key in ["descr", "description"]:
                                        descr_list.append(val)

                    if netname:
                        items.append(EvidenceItem(
                            id=f"ripestat_netname_{ip}",
                            source=self.source_name,
                            category="whois",
                            key="whois_netname",
                            value=netname,
                            freshness="Live (RIR Registry)",
                            status="verified",
                            contribution=f"Registry Network Identifier: {netname}",
                            score_impact=0.0,
                            reference_url=whois_url,
                            error_details=None,
                            collected_at=now
                        ))

                    if descr_list:
                        combined_descr = " | ".join(descr_list[:3])
                        items.append(EvidenceItem(
                            id=f"ripestat_descr_{ip}",
                            source=self.source_name,
                            category="whois",
                            key="whois_description",
                            value=combined_descr,
                            freshness="Live (RIR Registry)",
                            status="verified",
                            contribution="Descriptive text from regional internet registry",
                            score_impact=0.0,
                            reference_url=whois_url,
                            error_details=None,
                            collected_at=now
                        ))

        except httpx.TimeoutException:
            items.append(EvidenceItem(
                id=f"ripestat_timeout_{ip}",
                source=self.source_name,
                category=self.source_category,
                key="ripestat_status",
                value="Query timed out",
                freshness="Live attempt",
                status="error",
                contribution="Provider unavailable (request exceeded timeout)",
                score_impact=0.0,
                reference_url=settings.RIPE_STAT_BASE_URL,
                error_details=f"RIPEstat API did not respond within {timeout}s.",
                collected_at=now
            ))
        except Exception as e:
            items.append(EvidenceItem(
                id=f"ripestat_error_{ip}",
                source=self.source_name,
                category=self.source_category,
                key="ripestat_status",
                value="Service Error",
                freshness="Live attempt",
                status="error",
                contribution="Provider query failed",
                score_impact=0.0,
                reference_url=settings.RIPE_STAT_BASE_URL,
                error_details=f"Network error: {str(e)}",
                collected_at=now
            ))

        return items
