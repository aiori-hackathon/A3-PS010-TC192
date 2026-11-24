"""
NetEvidence AI - Automated MySQL Setup & Verification Script
Creates the database if missing, initializes all SQLAlchemy tables, and updates .env.
"""
import sys
import os
import argparse
from pathlib import Path

# Add backend to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import pymysql
from sqlalchemy import create_engine, text

def setup_mysql(host="127.0.0.1", port=3306, user="root", password="", dbname="netevidence"):
    print(f"[*] Connecting to MySQL server at {host}:{port} as user '{user}'...")
    try:
        conn = pymysql.connect(
            host=host,
            port=int(port),
            user=user,
            password=password,
            charset="utf8mb4",
            autocommit=True
        )
    except pymysql.err.OperationalError as e:
        print(f"[!] Connection failed: {e}")
        return False

    with conn.cursor() as cursor:
        print(f"[*] Ensuring database '{dbname}' exists...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{dbname}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        print(f"[+] Database '{dbname}' is ready.")
    conn.close()

    # Form SQLAlchemy connection URL
    escaped_pwd = password.replace("@", "%40").replace(":", "%3A") if password else ""
    db_url = f"mysql+pymysql://{user}:{escaped_pwd}@{host}:{port}/{dbname}"

    print("[*] Creating all application tables (users, audit_events, analyses, etc.)...")
    os.environ["DATABASE_URL"] = db_url

    from app.core.database import Base
    from app.database.init_db import init_db
    
    engine = create_engine(db_url, pool_pre_ping=True)
    Base.metadata.create_all(bind=engine)
    print("[+] All tables successfully created in MySQL!")

    # Seed demo user and check tables
    with engine.connect() as check_conn:
        res = check_conn.execute(text("SHOW TABLES;"))
        tables = [row[0] for row in res]
        print(f"[+] Active MySQL Tables in '{dbname}': {', '.join(tables)}")

    # Update or create backend/.env
    env_file = backend_dir / ".env"
    env_lines = []
    if env_file.exists():
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                if not line.startswith("DATABASE_URL="):
                    env_lines.append(line.rstrip())

    env_lines.append(f"DATABASE_URL={db_url}")
    with open(env_file, "w", encoding="utf-8") as f:
        f.write("\n".join(env_lines) + "\n")
    print(f"[+] Saved DATABASE_URL to {env_file}")

    print("\n[SUCCESS] MySQL integration complete! Every user who registers or logs in will now be stored in your MySQL database.")
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Configure MySQL for NetEvidence AI")
    parser.add_argument("--host", default="127.0.0.1", help="MySQL Host (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=3306, help="MySQL Port (default: 3306)")
    parser.add_argument("--user", default="root", help="MySQL Username (default: root)")
    parser.add_argument("--password", default="", help="MySQL Password")
    parser.add_argument("--dbname", default="netevidence", help="Database name (default: netevidence)")

    args = parser.parse_args()
    success = setup_mysql(
        host=args.host,
        port=args.port,
        user=args.user,
        password=args.password,
        dbname=args.dbname
    )
    sys.exit(0 if success else 1)
