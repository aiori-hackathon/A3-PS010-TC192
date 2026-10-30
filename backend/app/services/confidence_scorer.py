"""
Confidence and Evidence Quality Scoring Service
Calculates explainable, bounded confidence scores (0-100) and evidence quality
assessments based on source family independence, signal agreement, freshness, and conflicts.
"""
from typing import List, Dict, Tuple, Set
from enum import Enum
from app.schemas.analysis import EvidenceItem, EvidenceConflict

class SourceFamily(str, Enum):
    ROUTING_BGP = "routing_bgp"
    REGISTRY_WHOIS = "registry_whois"
    DNS_NAMING = "dns_naming"
    IP_INTEL = "ip_intel"
    POLICY_LOCAL = "policy_local"
    UNKNOWN = "unknown"

def map_item_to_source_family(item: EvidenceItem) -> SourceFamily:
    """Maps an individual evidence item to its independent source family."""
    src = (item.source or "").lower()
    cat = (item.category or "").lower()
    key = (item.key or "").lower()

    if "policy" in src or "policy" in cat:
        return SourceFamily.POLICY_LOCAL
    if "rdns" in cat or "dns" in cat or "ptr" in key or "dns" in src:
        return SourceFamily.DNS_NAMING
    if "bgp" in cat or "prefix" in key or "bgp" in src:
        return SourceFamily.ROUTING_BGP
    if "whois" in cat or "whois" in src or "arin" in src or "netname" in key:
        return SourceFamily.REGISTRY_WHOIS
    if "asn" in cat or "origin_asn" in key:
        # ASN announcement is routing registry information
        return SourceFamily.ROUTING_BGP
    if "intel" in cat or "intel" in src or "ripestat" in src:
        return SourceFamily.IP_INTEL
    return SourceFamily.UNKNOWN

class ConfidenceScorer:
    """
    Evaluates classification confidence and evidence quality as separate concepts:
    - Classification Confidence: Probability/certainty of the specific network type verdict (0-100).
    - Evidence Quality: Integrity, depth, and reliability of the collected evidence corpus.
    """

    # Configurable Engineering Thresholds
    MIN_SCORE_FOR_CLASSIFICATION = 35.0  # Minimum raw rule points
    MIN_CONFIDENCE_FOR_VERDICT = 50     # Below this, verdict becomes Unknown / Insufficient Evidence
    TENTATIVE_CONFIDENCE_THRESHOLD = 70  # 50-69 = Tentative, >= 70 = High Confidence

    def evaluate(
        self,
        winning_category: str,
        category_scores: Dict[str, float],
        evidence_list: List[EvidenceItem],
        conflicts: List[EvidenceConflict]
    ) -> Tuple[int, str, str, str]:
        """
        Calculates:
        - confidence_score (0-100 integer)
        - confidence_level ("High", "Tentative", "Low", "None")
        - evidence_quality ("Strong", "Moderate", "Limited")
        - explanation (Plain-English 10th-grade explanation of certainty & quality)
        """
        # If insufficient evidence or non-public
        if winning_category == "Unknown / Insufficient Evidence":
            return (
                0,
                "None",
                "Limited",
                "We could not determine the network type reliably because there is not enough supporting evidence."
            )

        usable_items = [item for item in evidence_list if item.status in ["verified", "inferred", "simulated"]]
        missing_count = sum(1 for item in evidence_list if item.status == "missing")
        error_count = sum(1 for item in evidence_list if item.status == "error")

        # 1. Map evidence to independent source families
        all_families_queried: Set[SourceFamily] = set()
        supporting_families: Set[SourceFamily] = set()

        for item in evidence_list:
            fam = map_item_to_source_family(item)
            all_families_queried.add(fam)

        for item in usable_items:
            fam = map_item_to_source_family(item)
            # Item is supporting if impact matches winning category or item has positive impact
            if item.impact_category == winning_category and item.score_impact > 0:
                supporting_families.add(fam)
            elif item.score_impact > 0 and not item.impact_category:
                supporting_families.add(fam)

        # 2. Base Score from Winning Category Points (0-60 base)
        win_score = category_scores.get(winning_category, 0.0)
        base_score = min(60.0, (win_score / 80.0) * 60.0)

        # 3. Source Family Diversity Bonus (up to +30 points)
        # Correlated fields from the same source family do NOT give separate bonuses.
        # Only distinct independent source families count towards diversity.
        family_count = len(supporting_families)
        if family_count >= 3:
            diversity_bonus = 30.0
        elif family_count == 2:
            diversity_bonus = 20.0
        elif family_count == 1:
            diversity_bonus = 8.0
        else:
            diversity_bonus = 0.0

        # 4. Freshness & Usability Adjustment
        freshness_bonus = 5.0 if any("live" in (i.freshness or "").lower() for i in usable_items) else 0.0

        # 5. Penalties
        # Penalty for detected conflicts (20 points per conflict)
        has_high_conflict = any(c.severity == "High" for c in conflicts)
        conflict_penalty = len(conflicts) * 18.0
        if has_high_conflict:
            conflict_penalty += 10.0

        # Missing or sensor error penalties
        missing_penalty = (missing_count * 4.0) + (error_count * 8.0)

        raw_calc = base_score + diversity_bonus + freshness_bonus - conflict_penalty - missing_penalty
        
        # 6. Apply Independence Guardrail:
        # If only 1 source family supports the verdict, cap confidence at 62 (Tentative)
        if family_count <= 1:
            raw_calc = min(raw_calc, 62.0)

        # If there are active high-severity conflicts, cap confidence at 65
        if has_high_conflict:
            raw_calc = min(raw_calc, 65.0)

        final_score = int(max(10.0, min(95.0, round(raw_calc))))

        # Determine Confidence Level
        if final_score >= self.TENTATIVE_CONFIDENCE_THRESHOLD:
            conf_level = "High"
        elif final_score >= self.MIN_CONFIDENCE_FOR_VERDICT:
            conf_level = "Tentative"
        else:
            conf_level = "Low"

        # 7. Independent Evidence Quality Assessment
        # Criteria: number of usable signals, number of queried source families, errors, and freshness
        total_usable = len(usable_items)
        queried_family_count = len([f for f in all_families_queried if f != SourceFamily.UNKNOWN])

        if total_usable >= 4 and queried_family_count >= 3 and error_count == 0 and not has_high_conflict:
            evidence_quality = "Strong"
        elif total_usable >= 2 and queried_family_count >= 2 and error_count <= 1:
            evidence_quality = "Moderate"
        else:
            evidence_quality = "Limited"

        # 8. Explainable Plain-English Summary
        family_names = [f.value.replace("_", " ").title() for f in supporting_families]
        families_str = ", ".join(family_names) if family_names else "limited sources"

        if conflicts:
            explanation = (
                f"Confidence: {final_score}/100 ({conf_level}) — Supported by {family_count} independent source "
                f"family/families ({families_str}), but reduced by {len(conflicts)} detected conflict(s). "
                f"Evidence quality is assessed as {evidence_quality}."
            )
        elif family_count <= 1:
            explanation = (
                f"Confidence: {final_score}/100 ({conf_level}) — Classified tentatively based on a single source family "
                f"({families_str}). Multi-source corroboration from additional families is recommended for high certainty. "
                f"Evidence quality is assessed as {evidence_quality}."
            )
        elif missing_count > 0 or error_count > 0:
            explanation = (
                f"Confidence: {final_score}/100 ({conf_level}) — Confirmed across {family_count} distinct source families "
                f"({families_str}), although {missing_count + error_count} indicator(s) were unavailable. "
                f"Evidence quality is assessed as {evidence_quality}."
            )
        else:
            explanation = (
                f"Confidence: {final_score}/100 ({conf_level}) — Confirmed with consensus across {family_count} "
                f"independent source families ({families_str}) without contradictions. "
                f"Evidence quality is assessed as {evidence_quality}."
            )

        return final_score, conf_level, evidence_quality, explanation
