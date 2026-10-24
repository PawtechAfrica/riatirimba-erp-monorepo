#!/usr/bin/env python3
import subprocess, datetime, sys

# List of DB container names (same as docker container names for Postgres services)
DB_CONTAINERS = ["academics_db"]

# Postgres user
PG_USER = "lawrence"

# Backblaze B2 bucket
BUCKET = "Riatirimba-database-backups"

# Backup directory (inside host/container where this script runs)
BACKUP_DIR = "/tmp"

def run_command(cmd):
    """Run a shell command and exit if it fails"""
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Command failed: {' '.join(cmd)}", file=sys.stderr)
        sys.exit(1)

def main():
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d-%H%M")
    
    for db in DB_CONTAINERS:
        filename = f"{BACKUP_DIR}/{db}_backup_{timestamp}.tar"
        
        print(f" Backing up {db}...")
        run_command([
            "docker", "exec", db,
            "pg_dump", "-U", PG_USER, "-d", db, "-F", "tar", "-f", filename
        ])
        
        print(f" Uploading {filename} to B2...")
        run_command([
            "b2", "upload-file", BUCKET, filename, filename.split("/")[-1]
        ])
        
        print(f" Done with {db}")

if __name__ == "__main__":
    main()
