"""
Authentication Endpoints: Register, Login, Current User
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.models.audit import AuditEvent
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Registers a new user account with secure password hashing."""
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in instead."
        )

    hashed_pw = hash_password(user_in.password)
    user = User(
        email=user_in.email.lower(),
        full_name=user_in.full_name,
        hashed_password=hashed_pw,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Log audit event
    audit = AuditEvent(
        user_id=user.id,
        action="USER_REGISTRATION",
        status="SUCCESS",
        details_json=f'{{"email": "{user.email}", "full_name": "{user.full_name}"}}'
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
def login(login_in: UserLogin, db: Session = Depends(get_db)):
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

    # Record login audit event
    audit = AuditEvent(
        user_id=user.id,
        action="USER_LOGIN",
        status="SUCCESS",
        details_json=f'{{"email": "{user.email}"}}'
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
