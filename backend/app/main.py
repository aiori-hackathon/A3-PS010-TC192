"""
NetEvidence AI - Backend Entrypoint
Evidence-Based IP Network-Type Classification Platform
"""
from fastapi import FastAPI, Request, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
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
allowed_origins_list = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
if settings.ALLOWED_ORIGINS:
    for custom_origin in settings.ALLOWED_ORIGINS.split(","):
        cleaned = custom_origin.strip()
        if cleaned and cleaned not in allowed_origins_list:
            allowed_origins_list.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins_list,
    # Allow Vercel deployment domains (*.vercel.app) and local development
    allow_origin_regex=r"^https?://([a-zA-Z0-9-]+\.)?vercel\.app(:\d+)?$|^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
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

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "database": "SQLite (Connected)",
        "classifier_version": settings.CLASSIFIER_VERSION
    }

@app.get("/api/info")
@app.get("/api")
def api_info():
    return {
        "project": settings.PROJECT_NAME,
        "team": settings.TEAM_NAME,
        "team_code": settings.TEAM_CODE,
        "institution": settings.INSTITUTION,
        "version": settings.VERSION,
        "status": "Online",
        "api_documentation": "/docs"
    }

# Serve frontend React SPA from static assets
static_dir = Path(__file__).resolve().parent / "static"

if static_dir.exists() and (static_dir / "index.html").exists():
    assets_dir = static_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/favicon.svg", include_in_schema=False)
    async def favicon():
        fav = static_dir / "favicon.svg"
        if fav.exists():
            return FileResponse(fav)
        raise HTTPException(status_code=404)

    @app.get("/icons.svg", include_in_schema=False)
    async def icons():
        ic = static_dir / "icons.svg"
        if ic.exists():
            return FileResponse(ic)
        raise HTTPException(status_code=404)

    @app.get("/", include_in_schema=False)
    async def root_or_frontend(request: Request):
        accept = request.headers.get("accept", "")
        # Browsers navigating to root send 'text/html' in Accept header -> serve React SPA
        if "text/html" in accept:
            return FileResponse(static_dir / "index.html")
        # API clients, tests, or monitors -> return JSON project metadata
        return {
            "project": settings.PROJECT_NAME,
            "team": settings.TEAM_NAME,
            "team_code": settings.TEAM_CODE,
            "institution": settings.INSTITUTION,
            "version": settings.VERSION,
            "status": "Online",
            "api_documentation": "/docs"
        }

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa_frontend(full_path: str):
        # Do not intercept API, docs, or schema routes
        if full_path.startswith(("api", "docs", "redoc", "openapi.json")):
            raise HTTPException(status_code=404, detail="API endpoint not found")

        target = static_dir / full_path
        if full_path and target.is_file():
            return FileResponse(target)
        return FileResponse(static_dir / "index.html")
else:
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
