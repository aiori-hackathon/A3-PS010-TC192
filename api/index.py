"""
Vercel Serverless Function Entrypoint for NetEvidence AI FastAPI Backend
Preserves existing modular architecture and FastAPI application instance.
"""
import sys
from pathlib import Path

# Resolve directory paths
current_file = Path(__file__).resolve()
repo_root = current_file.parent.parent
backend_dir = repo_root / "backend"

# Ensure backend modules (app.*) are discoverable on sys.path
for directory in [str(backend_dir), str(repo_root)]:
    if directory not in sys.path:
        sys.path.insert(0, directory)

from app.main import app
