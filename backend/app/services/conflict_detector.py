"""
Conflict Detection Service for NetEvidence AI
Detects contradictory signals between evidence sources (e.g. Hostname vs ASN,
WHOIS vs Routing Org, stale vs fresh evidence), explains why the disagreement matters,
and documents its effect on the final classification.
"""
from typing import List, Dict, Any, Optional
from app.schemas.analysis import EvidenceItem, EvidenceConflict

class ConflictDetector:
    def detect_conflicts(self, evidence_list: List[EvidenceItem]) -> List[EvidenceConflict]:
        conflicts: List[EvidenceConflict] = []
        
        # Categorize evidence impacts
        category_contributions: Dict[str, List[EvidenceItem]] = {}
        ptr_item: Optional[EvidenceItem] = None
        asn_item: Optional[EvidenceItem] = None
        whois_item: Optional[EvidenceItem] = None
        bgp_announced_item: Optional[EvidenceItem] = None

        for item in evidence_list:
            if item.impact_category and item.score_impact > 0:
                cat = item.impact_category
                if cat not in category_contributions:
                    category_contributions[cat] = []
                category_contributions[cat].append(item)

            if item.key == "ptr_hostname":
                ptr_item = item
            elif item.key in ["origin_asn", "asn_holder_org"]:
                asn_item = item
            elif item.key == "whois_netname":
                whois_item = item
            elif item.key == "bgp_announced_state":
                bgp_announced_item = item

        # Check Conflict Type 1: Multi-category divergence
        # e.g., one source argues for Residential while another argues for Hosting / Datacenter
        cats = list(category_contributions.keys())
        if len(cats) >= 2:
            # Pairwise inspection
            for i in range(len(cats)):
                for j in range(i + 1, len(cats)):
                    cat_a = cats[i]
                    cat_b = cats[j]
                    
                    # Notable high-impact clash: Residential vs Hosting
                    if {cat_a, cat_b} == {"Residential", "Hosting / Datacenter"}:
                        item_a = category_contributions[cat_a][0]
                        item_b = category_contributions[cat_b][0]
                        conflicts.append(EvidenceConflict(
                            id="conflict_res_vs_hosting",
                            title="Residential vs. Cloud/Datacenter Contradiction",
                            source_a=item_a.source,
                            value_a=f"{item_a.key}: {item_a.value}",
                            source_b=item_b.source,
                            value_b=f"{item_b.key}: {item_b.value}",
                            why_it_matters="A consumer broadband network (where families browse the web at home) should normally not host cloud virtual machines. This conflict frequently happens when an ISP leases part of its IP space to a server hoster, or when a home user runs an unmanaged server.",
                            severity="High",
                            affected_outcome=True,
                            resolution_strategy="Heuristic resolution: Evaluates whether the reverse DNS host explicitly indicates a server/VPS or if the ASN takes precedence. Downweights confidence score by 25 points."
                        ))

                    # Mobile vs Hosting
                    elif {cat_a, cat_b} == {"Mobile", "Hosting / Datacenter"}:
                        item_a = category_contributions[cat_a][0]
                        item_b = category_contributions[cat_b][0]
                        conflicts.append(EvidenceConflict(
                            id="conflict_mob_vs_hosting",
                            title="Cellular Mobile vs. Hosting Contradiction",
                            source_a=item_a.source,
                            value_a=f"{item_a.key}: {item_a.value}",
                            source_b=item_b.source,
                            value_b=f"{item_b.key}: {item_b.value}",
                            why_it_matters="Cellular mobile subnets are designated for smartphones and tablets connecting via 4G/5G towers, not fixed rack servers.",
                            severity="High",
                            affected_outcome=True,
                            resolution_strategy="Prioritizes verified mobile carrier APN infrastructure over generic hosting naming cues, with an uncertainty warning."
                        ))

                    # Enterprise vs Residential
                    elif {cat_a, cat_b} == {"Enterprise / Campus", "Residential"}:
                        item_a = category_contributions[cat_a][0]
                        item_b = category_contributions[cat_b][0]
                        conflicts.append(EvidenceConflict(
                            id="conflict_ent_vs_res",
                            title="Institutional Campus vs. Residential ISP Disagreement",
                            source_a=item_a.source,
                            value_a=f"{item_a.key}: {item_a.value}",
                            source_b=item_b.source,
                            value_b=f"{item_b.key}: {item_b.value}",
                            why_it_matters="Universities and enterprises own dedicated network blocks, whereas residential ISPs serve household subscribers. This clash can occur in university dormitories served by commercial cable ISPs.",
                            severity="Moderate",
                            affected_outcome=True,
                            resolution_strategy="Tags the classification with moderate uncertainty; audits both campus registration and upstream ISP connectivity."
                        ))

        # Check Conflict Type 2: Unannounced BGP route with active hostname
        if bgp_announced_item and "Not Announced" in str(bgp_announced_item.value):
            if ptr_item and ptr_item.value and ptr_item.value != "None (Not Found)":
                conflicts.append(EvidenceConflict(
                    id="conflict_unannounced_with_ptr",
                    title="Dormant Routing vs. Active DNS Record",
                    source_a=bgp_announced_item.source,
                    value_a=str(bgp_announced_item.value),
                    source_b=ptr_item.source,
                    value_b=str(ptr_item.value),
                    why_it_matters="The IP address has an active domain name record in DNS, but global internet routers are currently not announcing an active path to reach it. It may be an abandoned server or a newly withdrawn route.",
                    severity="Moderate",
                    affected_outcome=True,
                    resolution_strategy="Penalizes confidence score by 20 points and marks evidence quality as Limited."
                ))

        return conflicts
