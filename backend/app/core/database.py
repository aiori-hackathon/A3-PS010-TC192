"""
Database connection and session configuration for SQLite
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# For SQLite, check_same_thread=False allows multi-threaded requests in FastAPI
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency that provides an active database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
