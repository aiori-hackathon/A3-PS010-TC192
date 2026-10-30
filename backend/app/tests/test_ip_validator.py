"""
Unit tests for IP Address Validator
"""
from app.services.ip_validator import validate_and_classify_ip

def test_valid_public_ipv4():
    res = validate_and_classify_ip("8.8.8.8")
    assert res.is_valid is True
    assert res.version == 4
    assert res.is_public is True
    assert res.category == "public"
    assert res.can_query_public_sources is True

def test_valid_public_ipv6():
    res = validate_and_classify_ip("2001:4860:4860::8888")
    assert res.is_valid is True
    assert res.version == 6
    assert res.is_public is True
    assert res.category == "public"

def test_private_ipv4():
    for ip in ["192.168.1.1", "10.0.0.1", "172.16.0.5"]:
        res = validate_and_classify_ip(ip)
        assert res.is_valid is True
        assert res.is_public is False
        assert res.category == "private"
        assert res.can_query_public_sources is False
        assert "Private" in res.explanation

def test_loopback_addresses():
    res4 = validate_and_classify_ip("127.0.0.1")
    assert res4.is_valid is True
    assert res4.is_public is False
    assert res4.category == "loopback"

    res6 = validate_and_classify_ip("::1")
    assert res6.is_valid is True
    assert res6.is_public is False
    assert res6.category == "loopback"

def test_cgnat_address():
    res = validate_and_classify_ip("100.64.0.5")
    assert res.is_valid is True
    assert res.is_public is False
    assert res.category == "cgnat"
    assert "Carrier-Grade NAT" in res.explanation

def test_malformed_ips():
    for bad in ["not-an-ip", "999.999.999.999", "1.2.3.4.5", ""]:
        res = validate_and_classify_ip(bad)
        assert res.is_valid is False
        assert res.can_query_public_sources is False
