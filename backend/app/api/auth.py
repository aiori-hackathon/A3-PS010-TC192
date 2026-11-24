"""
Authentication Endpoints: Register, Login, Current User
"""
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.models.audit import AuditEvent
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

def _extract_client_info(request: Request):
    """Helper to extract remote client IP and User-Agent."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()
    elif request.client and request.client.host:
        client_ip = request.client.host
    else:
        client_ip = "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown")[:255]
    return client_ip, user_agent

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserCreate, request: Request, db: Session = Depends(get_db)):
    """Registers a new user account with secure password hashing."""
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in instead."
        )

    client_ip, user_agent = _extract_client_info(request)
    now = datetime.now(timezone.utc)
    hashed_pw = hash_password(user_in.password)
    user = User(
        email=user_in.email.lower(),
        full_name=user_in.full_name,
        hashed_password=hashed_pw,
        is_active=True,
        created_at=now,
        last_login_at=now,
        last_login_ip=client_ip,
        login_count=1
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Log audit event
    audit = AuditEvent(
        user_id=user.id,
        action="USER_REGISTRATION",
        ip_address=client_ip,
        status="SUCCESS",
        details_json=json.dumps({
            "email": user.email,
            "full_name": user.full_name,
            "ip": client_ip,
            "user_agent": user_agent
        })
    )
    db.add(audit)
    db.commit()

    token = create_access_token(user.id)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Authenticates credentials and returns a signed JWT access token."""
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password. Please verify your credentials."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This user account has been disabled."
        )

    client_ip, user_agent = _extract_client_info(request)
    now = datetime.now(timezone.utc)
    user.last_login_at = now
    user.last_login_ip = client_ip
    user.login_count = (user.login_count or 0) + 1
    db.commit()
    db.refresh(user)

    # Record login audit event with client details
    audit = AuditEvent(
        user_id=user.id,
        action="USER_LOGIN",
        ip_address=client_ip,
        status="SUCCESS",
        details_json=json.dumps({
            "email": user.email,
            "ip": client_ip,
            "user_agent": user_agent,
            "login_count": user.login_count
        })
    )
    db.add(audit)
    db.commit()

    token = create_access_token(user.id)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns profile information for the authenticated user."""
    return UserResponse.model_validate(current_user)
