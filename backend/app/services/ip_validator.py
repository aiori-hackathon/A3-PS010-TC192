"""
IP Address Validation and Categorization Service
Uses standard Python ipaddress library to rigorously validate IPv4 and IPv6,
detecting private, loopback, CGNAT, multicast, and reserved addresses with 
simple plain-English explanations.
"""
import ipaddress
from typing import Tuple
from app.schemas.analysis import IPValidationResult

# Carrier-Grade NAT (RFC 6598) network
CGNAT_NET = ipaddress.IPv4Network("100.64.0.0/10")

def validate_and_classify_ip(ip_str: str) -> IPValidationResult:
    """
    Validates an IP address and determines its address scope and eligibility 
    for public routing intelligence.
    """
    clean_ip = ip_str.strip()
    
    # Check for empty string
    if not clean_ip:
        return IPValidationResult(
            is_valid=False,
            ip="",
            version=4,
            is_public=False,
            category="invalid",
            explanation="The IP address field is empty. Please enter a valid IPv4 (e.g. 8.8.8.8) or IPv6 address.",
            can_query_public_sources=False
        )

    try:
        ip_obj = ipaddress.ip_address(clean_ip)
    except ValueError as e:
        return IPValidationResult(
            is_valid=False,
            ip=clean_ip,
            version=4,
            is_public=False,
            category="invalid",
            explanation=f"'{clean_ip}' is not a valid IP address. IPv4 addresses must look like '192.0.2.1' (4 numbers separated by dots between 0-255), and IPv6 addresses look like '2001:db8::1'.",
            can_query_public_sources=False
        )

    version = ip_obj.version

    # Check address type
    if ip_obj.is_loopback:
        return IPValidationResult(
            is_valid=True,
            ip=str(ip_obj),
            version=version,
            is_public=False,
            category="loopback",
            explanation=f"This address ({ip_obj}) is a 'Loopback' address. It points directly back to your own computer and never travels across any physical network.",
            can_query_public_sources=False
        )

    if ip_obj.is_private:
        return IPValidationResult(
            is_valid=True,
            ip=str(ip_obj),
            version=version,
            is_public=False,
            category="private",
            explanation=f"This address ({ip_obj}) is a 'Private Internal' address (like those used inside home Wi-Fi or office networks). Private addresses are not visible on the public Internet and cannot be queried from public internet registries.",
            can_query_public_sources=False
        )

    # Check for Carrier Grade NAT (100.64.0.0/10)
    if version == 4 and ip_obj in CGNAT_NET:
        return IPValidationResult(
            is_valid=True,
            ip=str(ip_obj),
            version=4,
            is_public=False,
            category="cgnat",
            explanation=f"This address ({ip_obj}) belongs to Carrier-Grade NAT (Shared Address Space RFC 6598). Internet Service Providers use this internally to share public IPv4 addresses among multiple mobile or residential subscribers.",
            can_query_public_sources=False
        )

    if ip_obj.is_link_local:
        return IPValidationResult(
            is_valid=True,
            ip=str(ip_obj),
            version=version,
            is_public=False,
            category="link_local",
            explanation=f"This address ({ip_obj}) is a 'Link-Local' address (e.g. 169.254.x.x or fe80::). Computers automatically assign this to themselves when no DHCP server is found. It cannot connect to the global Internet.",
            can_query_public_sources=False
        )

    if ip_obj.is_multicast:
        return IPValidationResult(
            is_valid=True,
            ip=str(ip_obj),
            version=version,
            is_public=False,
            category="multicast",
            explanation=f"This address ({ip_obj}) is a 'Multicast' address. Multicast is used to stream video or audio to multiple listening devices at once, not to identify an individual subscriber network.",
            can_query_public_sources=False
        )

    if ip_obj.is_reserved:
        return IPValidationResult(
            is_valid=True,
            ip=str(ip_obj),
            version=version,
            is_public=False,
            category="reserved",
            explanation=f"This address ({ip_obj}) is officially reserved by the Internet Engineering Task Force (IETF) for future use or testing and does not belong to a live subscriber.",
            can_query_public_sources=False
        )

    # Valid globally routable public address
    return IPValidationResult(
        is_valid=True,
        ip=str(ip_obj),
        version=version,
        is_public=True,
        category="public",
        explanation=f"'{ip_obj}' is a valid globally routable public IP address. It can be queried against internet registries (like RIPE, ARIN, APNIC) and routing tables.",
        can_query_public_sources=True
    )
