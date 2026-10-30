"""
NetEvidence AI - Backend Entrypoint
Evidence-Based IP Network-Type Classification Platform
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from app.core.config import settings
from app.database.init_db import init_db
from app.api import auth, analysis, history, audit, benchmark, dashboard

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure SQLite tables exist and default seed data is ready
    init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Explainable Evidence-Based IP Network-Type Classification API. "
        "Auditable multi-source network intelligence platform."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lightweight in-memory rate limiter per IP address
REQUEST_TIMESTAMPS = {}

@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    # Skip rate limiting for docs, open health, and swagger assets
    if request.url.path in ["/docs", "/redoc", "/openapi.json", "/api/health", "/"]:
        return await call_next(request)

    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    
    # Clean old entries
    if client_ip in REQUEST_TIMESTAMPS:
        timestamps = [t for t in REQUEST_TIMESTAMPS[client_ip] if now - t < 60]
        if len(timestamps) >= settings.MAX_REQUESTS_PER_MINUTE:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many requests. Please slow down and try again in a few moments."}
            )
        timestamps.append(now)
        REQUEST_TIMESTAMPS[client_ip] = timestamps
    else:
        REQUEST_TIMESTAMPS[client_ip] = [now]

    response = await call_next(request)
    return response

# Register API Routers
api_v1_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1_prefix)
app.include_router(analysis.router, prefix=api_v1_prefix)
app.include_router(history.router, prefix=api_v1_prefix)
app.include_router(audit.router, prefix=api_v1_prefix)
app.include_router(benchmark.router, prefix=api_v1_prefix)
app.include_router(dashboard.router, prefix=api_v1_prefix)

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "team": settings.TEAM_NAME,
        "team_code": settings.TEAM_CODE,
        "institution": settings.INSTITUTION,
        "version": settings.VERSION,
        "status": "Online",
        "api_documentation": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "database": "SQLite (Connected)",
        "classifier_version": settings.CLASSIFIER_VERSION
    }
