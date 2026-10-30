"""
Curated Demo Adapter for Evaluators & Offline Demonstrations
Provides realistic, explainable simulated test cases for hackathon evaluators.
Every piece of simulated data is explicitly marked:
"DEMO DATA / SIMULATED EVIDENCE" to ensure total transparency.
"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.services.adapters.base_adapter import BaseEvidenceAdapter
from app.schemas.analysis import EvidenceItem

DEMO_CASES: Dict[str, Dict[str, Any]] = {
    # 1. Clear Residential Case
    "residential_clear": {
        "id": "demo-case-1",
        "name": "Residential Broadband (Clear Multi-Signal)",
        "ip": "73.168.45.112",
        "description": "Comcast Cable subscriber in Colorado. Reverse DNS has 'res.cpe' naming, ASN is consumer broadband provider, BGP prefix /20 matches typical residential aggregation block.",
        "asn": "AS7922",
        "org_name": "Comcast Cable Communications, LLC",
        "prefix": "73.168.32.0/20",
        "hostname": "c-73-168-45-112.hsd1.co.comcast.net",
        "expected_category": "Residential",
        "evidence_quality": "Strong",
        "evidence": [
            {
                "id": "demo_asn_73",
                "source": "BGP Routing & ASN Registry",
                "category": "asn",
                "key": "origin_asn",
                "value": "AS7922 (Comcast Cable Communications)",
                "contribution": "+40 towards Residential (Major Tier-2 Consumer Cable ISP)",
                "impact_category": "Residential",
                "score_impact": 40.0,
                "status": "simulated"
            },
            {
                "id": "demo_rdns_73",
                "source": "Reverse DNS (PTR)",
                "category": "rdns",
                "key": "ptr_hostname",
                "value": "c-73-168-45-112.hsd1.co.comcast.net",
                "contribution": "+30 towards Residential ('hsd1' = High Speed Data, residential broadband naming scheme)",
                "impact_category": "Residential",
                "score_impact": 30.0,
                "status": "simulated"
            },
            {
                "id": "demo_bgp_73",
                "source": "RIPEstat BGP Prefix Monitor",
                "category": "bgp",
                "key": "routed_prefix",
                "value": "73.168.32.0/20 (Active Global BGP Route)",
                "contribution": "+15 towards Residential (Large /20 allocation block typical of regional subscriber pools)",
                "impact_category": "Residential",
                "score_impact": 15.0,
                "status": "simulated"
            },
            {
                "id": "demo_whois_73",
                "source": "ARIN WHOIS Registration",
                "category": "whois",
                "key": "whois_netname",
                "value": "COMCAST-DYNAMIC-POOL",
                "contribution": "+25 towards Residential (Explicitly labeled as dynamic consumer pool)",
                "impact_category": "Residential",
                "score_impact": 25.0,
                "status": "simulated"
            }
        ]
    },

    # 2. Clear Datacenter / Cloud Case
    "datacenter_clear": {
        "id": "demo-case-2",
        "name": "Cloud Datacenter (AWS EC2)",
        "ip": "54.214.12.89",
        "description": "Amazon Web Services EC2 instance in us-west-2 (Oregon). Hostname and ASN directly indicate public cloud virtual machines.",
        "asn": "AS16509",
        "org_name": "AMAZON-02 - Amazon.com, Inc.",
        "prefix": "54.214.0.0/16",
        "hostname": "ec2-54-214-12-89.us-west-2.compute.amazonaws.com",
        "expected_category": "Hosting / Datacenter",
        "evidence_quality": "Strong",
        "evidence": [
            {
                "id": "demo_asn_54",
                "source": "BGP Routing & ASN Registry",
                "category": "asn",
                "key": "origin_asn",
                "value": "AS16509 (Amazon.com, Inc.)",
                "contribution": "+50 towards Hosting / Datacenter (Global Hyperscale Cloud Provider)",
                "impact_category": "Hosting / Datacenter",
                "score_impact": 50.0,
                "status": "simulated"
            },
            {
                "id": "demo_rdns_54",
                "source": "Reverse DNS (PTR)",
                "category": "rdns",
                "key": "ptr_hostname",
                "value": "ec2-54-214-12-89.us-west-2.compute.amazonaws.com",
                "contribution": "+45 towards Hosting / Datacenter (Explicit 'compute.amazonaws.com' EC2 VM naming pattern)",
                "impact_category": "Hosting / Datacenter",
                "score_impact": 45.0,
                "status": "simulated"
            },
            {
                "id": "demo_bgp_54",
                "source": "BGP Prefix Monitoring",
                "category": "bgp",
                "key": "routed_prefix",
                "value": "54.214.0.0/16 (Active Global Route)",
                "contribution": "+15 towards Hosting / Datacenter (Cloud provider aggregation CIDR block)",
                "impact_category": "Hosting / Datacenter",
                "score_impact": 15.0,
                "status": "simulated"
            }
        ]
    },

    # 3. Enterprise / University Campus Case
    "enterprise_campus": {
        "id": "demo-case-3",
        "name": "University Campus (MIT Research Network)",
        "ip": "18.178.2.55",
        "description": "Massachusetts Institute of Technology. ASN belongs to higher education, reverse DNS maps to campus research lab domain.",
        "asn": "AS3",
        "org_name": "Massachusetts Institute of Technology (MIT)",
        "prefix": "18.0.0.0/9",
        "hostname": "rigel.csail.mit.edu",
        "expected_category": "Enterprise / Campus",
        "evidence_quality": "Strong",
        "evidence": [
            {
                "id": "demo_asn_18",
                "source": "BGP Routing & ASN Registry",
                "category": "asn",
                "key": "origin_asn",
                "value": "AS3 (Massachusetts Institute of Technology)",
                "contribution": "+55 towards Enterprise / Campus (Historical Academic & Research Institution ASN)",
                "impact_category": "Enterprise / Campus",
                "score_impact": 55.0,
                "status": "simulated"
            },
            {
                "id": "demo_rdns_18",
                "source": "Reverse DNS (PTR)",
                "category": "rdns",
                "key": "ptr_hostname",
                "value": "rigel.csail.mit.edu",
                "contribution": "+45 towards Enterprise / Campus (Valid .edu domain belonging to Computer Science and AI Lab)",
                "impact_category": "Enterprise / Campus",
                "score_impact": 45.0,
                "status": "simulated"
            },
            {
                "id": "demo_whois_18",
                "source": "ARIN WHOIS Registration",
                "category": "whois",
                "key": "whois_netname",
                "value": "MIT-GATEWAYS",
                "contribution": "+25 towards Enterprise / Campus (Institutional campus gateway infrastructure)",
                "impact_category": "Enterprise / Campus",
                "score_impact": 25.0,
                "status": "simulated"
            }
        ]
    },

    # 4. Mobile / Cellular Carrier Case
    "mobile_carrier": {
        "id": "demo-case-4",
        "name": "Mobile 4G/5G Carrier (Verizon Wireless APN)",
        "ip": "174.216.78.90",
        "description": "Cellular subscriber connection through wireless carrier APN gateway.",
        "asn": "AS22394",
        "org_name": "Cellco Partnership DBA Verizon Wireless",
        "prefix": "174.192.0.0/11",
        "hostname": "174-216-78-90.sub.mwc.myvzw.com",
        "expected_category": "Mobile",
        "evidence_quality": "Strong",
        "evidence": [
            {
                "id": "demo_asn_174",
                "source": "BGP Routing & ASN Registry",
                "category": "asn",
                "key": "origin_asn",
                "value": "AS22394 (Verizon Wireless)",
                "contribution": "+50 towards Mobile (Major National Mobile Network Operator)",
                "impact_category": "Mobile",
                "score_impact": 50.0,
                "status": "simulated"
            },
            {
                "id": "demo_rdns_174",
                "source": "Reverse DNS (PTR)",
                "category": "rdns",
                "key": "ptr_hostname",
                "value": "174-216-78-90.sub.mwc.myvzw.com",
                "contribution": "+40 towards Mobile (Domain 'myvzw.com' with 'mwc' mobile wireless carrier gateway)",
                "impact_category": "Mobile",
                "score_impact": 40.0,
                "status": "simulated"
            },
            {
                "id": "demo_whois_174",
                "source": "ARIN WHOIS Registration",
                "category": "whois",
                "key": "whois_netname",
                "value": "VZW-NATIONAL-APN",
                "contribution": "+30 towards Mobile (Designated Access Point Name subnet)",
                "impact_category": "Mobile",
                "score_impact": 30.0,
                "status": "simulated"
            }
        ]
    },

    # 5. Conflicting Signals Case
    "conflicting_signals": {
        "id": "demo-case-5",
        "name": "Conflicting Evidence (ISP Subnet Leased to Hosting)",
        "ip": "198.54.117.44",
        "description": "Real-world conflict: The ASN belongs to Spectrum/Charter (Consumer ISP), but the reverse DNS hostname is configured as 'server01.hostcloudvps.net' and advertised with a /24 micro-prefix used for VPS hosting.",
        "asn": "AS20115",
        "org_name": "Charter Communications (Spectrum)",
        "prefix": "198.54.117.0/24",
        "hostname": "server01.hostcloudvps.net",
        "expected_category": "Hosting / Datacenter",
        "evidence_quality": "Moderate",
        "has_conflict": True,
        "evidence": [
            {
                "id": "demo_asn_conflict",
                "source": "BGP Routing & ASN Registry",
                "category": "asn",
                "key": "origin_asn",
                "value": "AS20115 (Charter Communications / Spectrum)",
                "contribution": "+40 towards Residential (ISP Organization suggests consumer broadband)",
                "impact_category": "Residential",
                "score_impact": 40.0,
                "status": "simulated"
            },
            {
                "id": "demo_rdns_conflict",
                "source": "Reverse DNS (PTR)",
                "category": "rdns",
                "key": "ptr_hostname",
                "value": "server01.hostcloudvps.net",
                "contribution": "+45 towards Hosting / Datacenter (Explicit server/VPS hosting domain)",
                "impact_category": "Hosting / Datacenter",
                "score_impact": 45.0,
                "status": "simulated"
            },
            {
                "id": "demo_bgp_conflict",
                "source": "BGP Prefix Monitoring",
                "category": "bgp",
                "key": "routed_prefix",
                "value": "198.54.117.0/24 (Deaggregated micro-prefix)",
                "contribution": "+15 towards Hosting / Datacenter (Small /24 prefix deaggregated for third-party colocation)",
                "impact_category": "Hosting / Datacenter",
                "score_impact": 15.0,
                "status": "simulated"
            }
        ]
    },

    # 6. Insufficient Evidence / Unrouted Case
    "insufficient_evidence": {
        "id": "demo-case-6",
        "name": "Insufficient Evidence (Unrouted / Dormant Allocation)",
        "ip": "192.0.2.1",
        "description": "TEST-NET-1 documentation block (RFC 5737). Not announced in global BGP, no PTR record, unknown operator.",
        "asn": "None",
        "org_name": "IANA Documentation Registry",
        "prefix": "192.0.2.0/24",
        "hostname": "None (NXDOMAIN)",
        "expected_category": "Unknown / Insufficient Evidence",
        "evidence_quality": "Limited",
        "evidence": [
            {
                "id": "demo_asn_insufficient",
                "source": "BGP Routing & ASN Registry",
                "category": "asn",
                "key": "origin_asn",
                "value": "None (No active ASN announcement found)",
                "contribution": "Missing routing origin",
                "impact_category": None,
                "score_impact": 0.0,
                "status": "missing"
            },
            {
                "id": "demo_rdns_insufficient",
                "source": "Reverse DNS (PTR)",
                "category": "rdns",
                "key": "ptr_hostname",
                "value": "None (No PTR record)",
                "contribution": "Missing naming clues",
                "impact_category": None,
                "score_impact": 0.0,
                "status": "missing"
            },
            {
                "id": "demo_bgp_insufficient",
                "source": "BGP Prefix Monitoring",
                "category": "bgp",
                "key": "routed_prefix",
                "value": "Unannounced in global internet tables",
                "contribution": "No active routing presence",
                "impact_category": None,
                "score_impact": -20.0,
                "status": "missing"
            }
        ]
    },

    # 7. Special-Purpose Private Network IP (RFC 1918)
    "special_purpose_ip": {
        "id": "demo-case-7",
        "name": "Special-Purpose IP (RFC 1918 Private LAN)",
        "ip": "192.168.1.1",
        "description": "Standard private IPv4 router gateway address. Non-public scope where external intelligence queries are intentionally suppressed to protect local network privacy.",
        "asn": "None (Private LAN)",
        "org_name": "Private Address Space (RFC 1918)",
        "prefix": "192.168.0.0/16",
        "hostname": "router.local",
        "expected_category": "Unknown / Insufficient Evidence",
        "evidence_quality": "Strong",
        "evidence": [
            {
                "id": "demo_rfc1918_policy",
                "source": "RFC 1918 Address Allocation",
                "category": "policy",
                "key": "address_scope",
                "value": "Private Internal LAN (192.168.0.0/16)",
                "contribution": "Classified as non-public address; queries to public internet registries suppressed",
                "impact_category": None,
                "score_impact": 0.0,
                "status": "simulated"
            }
        ]
    },

    # 8. Provider Partial Outage / Error Handling Case
    "provider_outage": {
        "id": "demo-case-8",
        "name": "Provider Degraded / Sensor Timeout Resilience",
        "ip": "104.244.42.1",
        "description": "Simulates a scenario where RIPEstat times out due to an API outage, but local PTR lookup and cached ASN data successfully resolve Twitter/X hosting.",
        "asn": "AS13414",
        "org_name": "Twitter Inc. (X Corp)",
        "prefix": "104.244.42.0/24",
        "hostname": "twitter-datacenter-edge.x.com",
        "expected_category": "Hosting / Datacenter",
        "evidence_quality": "Moderate",
        "evidence": [
            {
                "id": "demo_rdns_outage",
                "source": "Reverse DNS (PTR)",
                "category": "rdns",
                "key": "ptr_hostname",
                "value": "twitter-datacenter-edge.x.com",
                "contribution": "+40 towards Hosting / Datacenter (Datacenter edge naming convention)",
                "impact_category": "Hosting / Datacenter",
                "score_impact": 40.0,
                "status": "simulated"
            },
            {
                "id": "demo_ripestat_timeout",
                "source": "RIPEstat Open Intelligence",
                "category": "intelligence",
                "key": "ripestat_status",
                "value": "Query Timed Out (504 Gateway Timeout)",
                "contribution": "Provider Sensor Unavailable (graceful degradation)",
                "impact_category": None,
                "score_impact": 0.0,
                "status": "error",
                "error_details": "RIPE NCC upstream gateway did not reply within 4.5 seconds."
            },
            {
                "id": "demo_asn_outage",
                "source": "Local Routing Table Snapshot",
                "category": "asn",
                "key": "origin_asn",
                "value": "AS13414 (Twitter Inc.)",
                "contribution": "+35 towards Hosting / Datacenter (Known content platform edge AS)",
                "impact_category": "Hosting / Datacenter",
                "score_impact": 35.0,
                "status": "simulated"
            }
        ]
    }
}

class DemoAdapter(BaseEvidenceAdapter):
    @property
    def source_name(self) -> str:
        return "NetEvidence Evaluator Demo Suite"

    @property
    def source_category(self) -> str:
        return "demo"

    async def collect(self, ip: str) -> List[EvidenceItem]:
        return []

    @staticmethod
    def get_demo_case(case_id_or_ip: str) -> Optional[Dict[str, Any]]:
        for key, data in DEMO_CASES.items():
            if key == case_id_or_ip or data.get("ip") == case_id_or_ip or data.get("id") == case_id_or_ip:
                return data
        return None

    @staticmethod
    def list_demo_cases() -> List[Dict[str, Any]]:
        return [
            {
                "case_id": key,
                "id": val["id"],
                "name": val["name"],
                "ip": val["ip"],
                "expected_category": val["expected_category"],
                "evidence_quality": val["evidence_quality"],
                "description": val["description"]
            }
            for key, val in DEMO_CASES.items()
        ]
