# NetEvidence AI — Source Code & Implementation Directory

**AIORI Hackathon 3 — Team Evolve (A3-PS010-TC192)**  
**Problem Statement:** PS-010 — Evidence-Based IP Network-Type Classification  
**Institution:** Guru Nanak Institutions Technical Campus (Autonomous) (GNITC)

---

## 🌐 Live Working Model

- **Application URL:** [https://netevidence-ai.onrender.com/login](https://netevidence-ai.onrender.com/login)
- **Interactive API Swagger Docs:** [https://netevidence-ai.onrender.com/docs](https://netevidence-ai.onrender.com/docs)
- **Live Health Endpoint:** [https://netevidence-ai.onrender.com/api/health](https://netevidence-ai.onrender.com/api/health)

### Evaluator Demo Credentials:
- **Email:** `demo@netevidence.ai`
- **Password:** `Password123!`

---

## 📂 Implementation Codebase Layout

The project follows a clean production-grade full-stack architecture located in the repository:

1. **Backend Service (`/backend`)**:
   - `backend/app/main.py`: FastAPI application entry point, CORS, static SPA serving, and API routing.
   - `backend/app/api/`: REST API routers (`auth`, `analysis`, `history`, `audit`, `benchmark`, `dashboard`).
   - `backend/app/services/classifier.py`: Explainable rule-fusion network classifier.
   - `backend/app/services/adapters/`: Multi-source adapters (RIPEstat BGP/ASN, Reverse DNS PTR, and Transparent Demo).
   - `backend/app/models/`: SQLAlchemy ORM models (`user`, `analysis`, `audit`).
   - `backend/app/database/`: SQLite initialization and seed data (`init_db.py`).
   - `backend/app/tests/`: 20 unit and end-to-end tests covering validation, classification, conflict detection, and benchmarking.

2. **Frontend Client (`/frontend`)**:
   - `frontend/src/pages/`: Analysis, History, Comparison, Evidence Graph, Benchmark, Audit Trail, Login/Register.
   - `frontend/src/components/`: Interactive SVG Evidence Graph, Category distribution charts, Result cards, and Navigation.
   - `frontend/src/services/api.ts`: API client with token management and relative routing.

