"""
NetEvidence AI - Application Configuration
Evidence-Based IP Network-Type Classification Platform
"""
import os

class Settings:
    PROJECT_NAME: str = "NetEvidence AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Project Metadata
    TEAM_NAME: str = "Evolve"
    TEAM_CODE: str = "A3-PS010-TC192"
    PROBLEM_STATEMENT: str = "PS-010 — Evidence-Based IP Network-Type Classification"
    INSTITUTION: str = "Guru Nanak Institutions Technical Campus (Autonomous) (GNITC)"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "netevidence-aiori-super-secret-key-2026-hackathon-token")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    # On Vercel serverless runtime, working directory is read-only; /tmp is the writable scratch space.
    # In local development, ./netevidence.db is preserved.
    # If an external PostgreSQL or cloud database URL is provided in DATABASE_URL, it connects to it.
    _is_vercel: bool = bool(os.getenv("VERCEL"))
    _default_db_url: str = "sqlite:////tmp/netevidence.db" if _is_vercel else "sqlite:///./netevidence.db"
    DATABASE_URL: str = os.getenv("DATABASE_URL", _default_db_url)
    
    # CORS
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "")
    
    # External APIs & Timeouts
    RIPE_STAT_BASE_URL: str = "https://stat.ripe.net/data"
    HTTP_TIMEOUT_SECONDS: float = 4.5
    DEFAULT_DNS_TIMEOUT_SECONDS: float = 3.0
    
    # Classification Rules Version
    CLASSIFIER_VERSION: str = "v1.2-rule-fusion"
    
    # Rate Limiting
    MAX_REQUESTS_PER_MINUTE: int = 60

settings = Settings()
