"""
Unit tests for Authentication and Password Hashing
"""
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token

def test_password_hashing():
    raw_pw = "SecureP@ssw0rd2026!"
    hashed = hash_password(raw_pw)
    assert hashed != raw_pw
    assert verify_password(raw_pw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token_flow():
    user_id = 42
    token = create_access_token(user_id)
    payload = decode_access_token(token)
    assert payload is not None
    assert payload.get("sub") == str(user_id)

def test_invalid_token():
    bad_token = "invalid.token.payload"
    assert decode_access_token(bad_token) is None
