"""
Bridge entrypoint for Vercel deployment when Root Directory is configured as 'backend'.
Imports the existing FastAPI application from app.main.
"""
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
