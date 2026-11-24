"""
NetEvidence AI - Cloud Database Viewer
Connects to your Render PostgreSQL database and displays all registered users & login activity.
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add backend to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

# Load .env if present
load_dotenv(backend_dir / ".env")
load_dotenv(backend_dir.parent / ".env")

from sqlalchemy import create_engine, text

DEFAULT_RENDER_URL = os.getenv(
    "RENDER_DATABASE_URL",
    os.getenv("DATABASE_URL", "")
)

def view_cloud_data(db_url: str = None, custom_query: str = None):
    target_url = db_url or DEFAULT_RENDER_URL
    if not target_url or "..." in target_url:
        print("[!] Please provide the External Database URL from your Render dashboard.")
        print("    Example: python backend/scripts/view_cloud_db.py \"postgresql://user:pass@host:5432/dbname\"")
        print("    Or set RENDER_DATABASE_URL in backend/.env")
        return

    # Normalize url
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+psycopg://", 1)
    elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
        db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)

    print(f"[*] Connecting to Render Cloud Database...")
    try:
        engine = create_engine(db_url, pool_pre_ping=True)
        with engine.connect() as conn:
            if custom_query:
                print(f"\n[*] Executing Custom SQL: {custom_query}\n")
                res = conn.execute(text(custom_query))
                if res.returns_rows:
                    cols = list(res.keys())
                    print(" | ".join(cols))
                    print("-" * 75)
                    rows = res.fetchall()
                    for r in rows:
                        print(" | ".join(str(val) for val in r))
                    print(f"\n({len(rows)} row(s) returned)")
                else:
                    conn.commit()
                    print("[✓] Query executed successfully.")
                return

            print("\n" + "=" * 75)
            print("                 REGISTERED USERS IN CLOUD DATABASE")
            print("=" * 75)
            res_users = conn.execute(text(
                "SELECT id, full_name, email, created_at, last_login_at, last_login_ip, login_count FROM users ORDER BY id ASC;"
            ))
            users = res_users.fetchall()
            if not users:
                print("No users found in database.")
            else:
                for u in users:
                    print(f"User #{u[0]}:")
                    print(f"  • Name:         {u[1]}")
                    print(f"  • Email:        {u[2]}")
                    print(f"  • Created At:   {u[3]}")
                    print(f"  • Last Login:   {u[4] or 'Never'}")
                    print(f"  • Login IP:     {u[5] or 'N/A'}")
                    print(f"  • Total Logins: {u[6]}")
                    print("-" * 75)

            print("\n" + "=" * 75)
            print("                 RECENT LOGIN & AUDIT EVENTS")
            print("=" * 75)
            res_audit = conn.execute(text(
                "SELECT id, user_id, action, ip_address, created_at, details_json FROM audit_events ORDER BY id DESC LIMIT 10;"
            ))
            audits = res_audit.fetchall()
            if not audits:
                print("No audit events recorded yet.")
            else:
                for a in audits:
                    print(f"Event #{a[0]} | User #{a[1]} | Action: {a[2]} | IP: {a[3]} | Time: {a[4]}")
                    print(f"Details: {a[5]}")
                    print("-" * 75)

    except Exception as e:
        print(f"\n[!] Connection Error: {e}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Render Cloud PostgreSQL Database Viewer & Query Runner")
    parser.add_argument("--url", default=DEFAULT_RENDER_URL, help="Render External Database URL")
    parser.add_argument("--query", "-q", default=None, help="Custom SQL query to run")
    args, unknown = parser.parse_known_args()

    # If first positional arg is a postgres url
    url = args.url
    if unknown and unknown[0].startswith("postgres"):
        url = unknown[0]

    view_cloud_data(url, custom_query=args.query)
