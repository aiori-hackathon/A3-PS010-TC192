# NetEvidence AI — Evidence-Based IP Network-Type Classification

[![Live Working Model](https://img.shields.io/badge/Live%20Working%20Model-netevidence--ai.onrender.com-success?style=for-the-badge&logo=render)](https://netevidence-ai.onrender.com/login)
[![Python](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-3776AB.svg?logo=python)](https://fastapi.tiangolo.com)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20TailwindCSS-61DAFB.svg?logo=react)](https://vitejs.dev)
[![Database](https://img.shields.io/badge/Database-SQLite%20(Audit%20Ledger)-003B57.svg?logo=sqlite)](https://sqlite.org)

> 🚀 **Live Working Model URL:** [https://netevidence-ai.onrender.com/login](https://netevidence-ai.onrender.com/login)  
> 🔑 **Pre-Seeded Evaluator Account:** `demo@netevidence.ai` &nbsp;|&nbsp; **Password:** `Password123!`  
> 📖 **Interactive Swagger API Docs:** [https://netevidence-ai.onrender.com/docs](https://netevidence-ai.onrender.com/docs)

> **NetEvidence AI** is an explainable cybersecurity intelligence application that determines the likely network type of an IP address (`Residential`, `Mobile`, `Enterprise / Campus`, `Hosting / Datacenter`, or `Unknown / Insufficient Evidence`) by fusing evidence from Autonomous System Registrations (ASN), BGP routing tables, Reverse DNS (PTR), and open WHOIS intelligence.

---

## 1. Project Identity & Hackathon Metadata

- **Project Name:** NetEvidence AI
- **Team Name:** Evolve
- **Team Code:** A3-PS010-TC192
- **Problem Statement:** PS-010 — Evidence-Based IP Network-Type Classification
- **Institution:** Guru Nanak Institutions Technical Campus (Autonomous) (GNITC)
- **Live Deployment URL:** [https://netevidence-ai.onrender.com/login](https://netevidence-ai.onrender.com/login)
- **Live API Documentation:** [https://netevidence-ai.onrender.com/docs](https://netevidence-ai.onrender.com/docs)
- **Live Health Check:** [https://netevidence-ai.onrender.com/api/health](https://netevidence-ai.onrender.com/api/health)
- **Architecture:** Explainable Multi-Source Rule-Fusion Engine with Auditable Activity Ledger

---

## 2. Core Architecture & Design Philosophy

NetEvidence AI is designed to be **fully understandable to a 10th-standard student**:
- **Plain-English Explanations:** Every classification provides a *"Why did we get this result?"* breakdown written in everyday language without unexplained jargon.
- **Transparent Rule Fusion over Black-Box Guessing:** Instead of pretending an untrained neural net is omniscient, NetEvidence AI uses auditable, weighted evidence rules combining operator registry data, domain naming structures, and BGP routing announcements.
- **Source Family Independence (No Correlated Double-Counting):**
  - Observations are grouped into independent source families (`ROUTING_BGP`, `REGISTRY_WHOIS`, `DNS_NAMING`, `IP_INTEL`, `LOCAL_POLICY`).
  - Correlated fields (e.g. BGP prefix and BGP origin ASN) from the same source family do not count as multiple independent confirmations.
  - High confidence requires corroboration across at least 2 distinct source families.
- **Reliable Decision Thresholds & Safe Fallbacks:**
  - Prevents low-confidence outcomes (< 50/100) from presenting as definitive verdicts.
  - Returns `Unknown / Insufficient Evidence` whenever supporting evidence is weak or uncorroborated.
- **Separate Confidence & Evidence Quality:**
  - **Confidence Score (0–100):** Reflects certainty of the specific network type verdict, penalized by contradictions.
  - **Evidence Quality (Strong, Moderate, Limited):** Assesses the breadth, freshness, and independence of available data sources independently of classification confidence.
- **Explicit Disagreement & Conflict Detection:** If an ISP leases IP space to a VPS hosting provider, the system highlights the contradiction, flags its severity, and documents how the conflict lowered the confidence score.
- **RFC Scope Protection:** Private (RFC 1918), loopback, link-local, and Carrier-Grade NAT (CGNAT) addresses are safely categorized locally without leaking queries to public intelligence services.

---

## 3. Technology Stack

### Backend
- **Python 3.10+ / 3.13+** with **FastAPI**
- **Pydantic v2** for rigorous schema validation
- **SQLAlchemy 2.0** with **SQLite** for zero-configuration, local audit and snapshot storage
- **BCrypt** password hashing and **PyJWT** bearer token authentication
- **HTTPX** for asynchronous queries to RIPEstat's open REST API
- **DNSPython** for recursive PTR queries

### Frontend
- **React 19** with **Vite** & **TypeScript**
- **Tailwind CSS v3** with responsive dark/light mode toggle
- **React-Markdown** for structured, rich markdown presentation
- **Lucide React** cybersecurity iconography
- **Recharts** for empirical category distributions
- **Custom Interactive SVG Evidence Graph** with high-visibility node cards (240px wide, 16px font), relationship badges, zoom (up to 200%), and fullscreen toggle

---

## 4. Key Implemented Features

1. **Authentication & User Management:**
   - User registration with password-strength guidance and duplicate email rejection.
   - Secure login with bcrypt hash verification and JWT bearer tokens.
   - Tenant isolation: each user's analysis history and bookmarks belong strictly to their account.
   - Pre-seeded **Evaluator Account** (`demo@netevidence.ai` / `Password123!`).

2. **Dedicated IP Analysis Engine:**
   - Real-time IPv4/IPv6 syntax validation.
   - Detection of Loopback, Private (RFC 1918), CGNAT (RFC 6598), Multicast, and Reserved addresses.
   - Real 5-stage processing pipeline:
     1. Validating the IP address
     2. Collecting available evidence
     3. Checking evidence quality
     4. Comparing signals
     5. Generating the report

3. **Multi-Source Evidence Collector:**
   - **RIPEstat Open Intelligence Adapter:** Live prefix overview, announced status, origin ASN, WHOIS netname, and description.
   - **Reverse DNS (PTR) Adapter:** Hostname discovery and heuristic naming pattern parser (`res`, `dynamic`, `cpe`, `mobile`, `lte`, `compute`, `aws`, `edu`, etc.).
   - **Demo Suite Adapter:** High-fidelity simulated cases clearly labeled `DEMO DATA / SIMULATED EVIDENCE` for offline and evaluators' review.

4. **Explainable Results & Interactive Evidence Graph:**
   - Main Result Card with Confidence Score (0–100) and Evidence Quality assessment.
   - *"Why did we get this result?"* step-by-step breakdown rendered cleanly with React-Markdown (no raw syntax markers).
   - **High-Visibility Interactive Evidence Graph** linking: Target IP $\rightarrow$ Prefix $\rightarrow$ ASN $\rightarrow$ Organization $\rightarrow$ Hostname $\rightarrow$ Intelligence Sources.
   - Conflict Detection Card displaying contradicting values, sources, timestamps, and resolution strategies.
   - Comprehensive Auditable Evidence Ledger table with direct observations vs. engine inferences, score impacts, and provenance.
   - Export report as **JSON**, **Print/PDF** with dedicated print styling, or **Copy Concise Summary**.

5. **Historical Analysis & Side-by-Side Comparison:**
   - Paginated analysis history with search, category filtering, quality filtering, and bookmarking.
   - Snapshot comparison tool that diffs two historical analyses for changes in category, confidence, ASN, prefix, or hostname.

6. **Ground-Truth Benchmarking Engine & Custom CSV Upload:**
   - Curated reference test corpus of 20 verified samples across Residential, Cloud Hosting, Campus, Mobile, and Unrouted IP blocks.
   - Real evaluation of **Accuracy**, per-category **Precision**, **Recall**, **F1-Score**, **Abstention Rate**, and **Confusion Matrix**.
   - **CSV Dataset Upload:** Accepts and validates user-uploaded CSV benchmarks (`ip_address, ground_truth, notes`).
   - Downloadable evaluation CSV template.

7. **Auditable Activity Ledger:**
   - Audit trail tracking every analysis event, login, bookmark, and benchmark execution with timestamps and parameters.

8. **Help & Plain-English Glossary:**
   - 10th-standard student definitions, real-world metaphors, and examples for IP, ASN, BGP, Reverse DNS, CIDR, and Confidence.

---

## 5. Quick Start Instructions

### Prerequisites
- Python 3.10+ (tested with Python 3.13)
- Node.js 18+ and npm

### Automated 1-Click Launch (Windows)
```cmd
run_all.bat
```

### Manual Setup

#### Backend Setup
```powershell
# 1. In terminal 1:
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt

# 2. Run Backend Server:
$env:PYTHONPATH="backend"
.\venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir backend
```
*API docs available at:* [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

#### Frontend Setup
```powershell
# In terminal 2:
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
*Web application available at:* [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## 6. Automated Test Suite

Run the full pytest suite (20 automated tests covering validation, auth, classifier guardrails, source family independence, and custom CSV benchmarks):

```powershell
$env:PYTHONPATH="backend"
.\venv\Scripts\pytest backend\app\tests -v
```

All 20 tests pass:
```text
backend/app/tests/test_api_e2e.py .....       [PASSED]
backend/app/tests/test_auth.py ...            [PASSED]
backend/app/tests/test_classifier.py .....    [PASSED]
backend/app/tests/test_conflicts.py .         [PASSED]
backend/app/tests/test_ip_validator.py ...... [PASSED]
20 passed in 5.27s
```

---

## 7. Demo Checklist for Evaluators

1. **Sign In:**
   - **Live Cloud Application (Recommended):** [https://netevidence-ai.onrender.com/login](https://netevidence-ai.onrender.com/login)
   - **Local Development (Optional):** [http://localhost:5173/login](http://localhost:5173/login)
   - **Pre-Seeded Credentials:**
     - **Email:** `demo@netevidence.ai`
     - **Password:** `Password123!`
2. **Dashboard Overview:**
   - Review the verified statistics: Total Analyses, Live vs. Demo breakdown, High Quality Ratio (displays `N/A` for fresh accounts), and Detected Conflicts.
3. **Analyze an IP:**
   - Public IP: Enter `8.8.8.8` or `1.1.1.1` in Live Sensor Mode.
   - Private IP: Enter `192.168.1.1` to observe local RFC protection.
   - Predefined Scenarios: Test Residential (`73.168.45.112`), Datacenter (`54.214.12.89`), Mobile (`174.216.78.90`), Conflicting (`198.54.117.44`), or Insufficient (`192.0.2.1`).
4. **Audit Report & Evidence Topology Graph:**
   - Inspect the large high-visibility topology graph (zoom up to 200%, fullscreen toggle).
   - Review formatted "Why did we get this result?" section without raw markdown markers.
   - Inspect the Auditable Evidence Ledger and click observations to view details.
5. **Benchmarking:**
   - Go to `/benchmark`.
   - Download the CSV template or upload any custom `.csv` dataset to calculate empirical accuracy, Macro-F1, confusion matrix, and abstention rate.

---

*NetEvidence AI — Team Evolve (A3-PS010-TC192) — Guru Nanak Institutions Technical Campus (Autonomous)*
