"""
NetEvidence AI - Cloud Database Viewer
Connects to your Render PostgreSQL database and displays all registered users & login activity.
"""
import sys
from pathlib import Path

# Add backend to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text

def view_cloud_data(db_url: str):
    if not db_url or "..." in db_url:
        print("[!] Please provide the full External Database URL from your Render dashboard.")
        print("    Example: python backend/scripts/view_cloud_db.py \"postgresql://user:pass@host:5432/dbname\"")
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
    if len(sys.argv) > 1:
        target_url = sys.argv[1].strip()
    else:
        target_url = input("Paste your Render External Database URL: ").strip()

    view_cloud_data(target_url)
