# housekeeping-service

General infrastructure maintenance service for the Riatiriba ERP.
Runs scheduled operational tasks — database backups, Docker cleanup, and
future maintenance jobs — for the college's Postgres and MySQL database
containers.

> Renamed from `backup-service`. All original backup functionality is
> preserved exactly; the service was restructured into a modular jobs
> layout so future maintenance tasks (log rotation, health checks, disk
> alerts, etc.) can be added without touching existing code.

---

## What it does

1. **Database Backup** (`jobs/backup.js`) — dumps every database listed in
   `dbs.json` using `pg_dump` (Postgres) or `mysqldump` (MySQL), uploads
   each dump to Backblaze B2 via Rclone, and sends a Telegram alert per
   database on success or failure. Retries automatically if a database is
   still starting up.
2. **Docker Cleanup** (`jobs/dockerCleanup.js`) — runs
   `docker system prune -af --volumes` on a configurable schedule to
   remove unused containers, images, networks, volumes, and build cache.
   Never touches running containers.

Both jobs run once immediately on startup, then on their configured cron
schedule going forward — indefinitely, as long as the container is up.

---

## Folder Structure

```
housekeeping-service/
├── jobs/
│   ├── backup.js            # Database dump + Rclone upload + Telegram alerts
│   └── dockerCleanup.js     # Docker system prune job
├── scheduler/
│   └── cron.js              # Central job registry — registers all cron jobs
├── utils/
│   ├── logger.js            # Shared timestamped logger (STDOUT → docker logs)
│   ├── telegram.js          # Telegram alert helper
│   └── cleanup.js           # Removes old local backup folders
├── dbs.json                 # Database connection list (not committed)
├── rclone.conf              # Rclone remote config for Backblaze B2 (not committed)
├── index.js                 # Entry point
├── package.json
├── Dockerfile
├── docker-compose.yml
├── .env                     # Real values (not committed)
├── .env.example             # Template — copy to .env and fill in
├── .gitignore
├── .dockerignore
└── README.md
```

---

## Prerequisites

- Docker Desktop (or Docker Engine on Linux) with Docker Compose v2
- A Backblaze B2 account with a bucket and application key
- A Telegram bot (created via [@BotFather](https://t.me/BotFather)) and
  your chat ID

---

## Setup

### 1. Clone and enter the folder

```bash
cd riatirimba-erp/housekeeping-service
```

### 2. Create your `.env`

```bash
cp .env.example .env
```

Fill in every value in `.env` — see the [Environment Variables](#environment-variables)
section below for what each one means and where to find it.

### 3. Create `dbs.json`

This file is not committed to git (it contains plaintext DB passwords).
Create it at the project root:

```json
[
  {
    "type": "postgres",
    "name": "academics_db",
    "host": "academics-database",
    "user": "postgres",
    "password": "your-password",
    "database": "academics_db"
  },
  {
    "type": "postgres",
    "name": "admission_db",
    "host": "admission-database",
    "user": "postgres",
    "password": "your-password",
    "database": "admission_db"
  },
  {
    "type": "postgres",
    "name": "students_db",
    "host": "students-database",
    "user": "postgres",
    "password": "your-password",
    "database": "students_db"
  },
  {
    "type": "mysql",
    "name": "auth_db",
    "host": "auth-database",
    "user": "lawrence",
    "password": "your-password",
    "database": "auth_db"
  }
]
```

`host` must match the Docker Compose service name of each database
container so internal DNS resolves correctly — `type` is `postgres` or
`mysql` and determines which dump tool runs.

### 4. Create `rclone.conf`

Not committed to git. Configure your Backblaze B2 remote:

```ini
[riatirimba-db]
type = b2
account = your-backblaze-account-id
key = your-backblaze-application-key
hard_delete = true
```

The remote name (`riatirimba-db` above) must match `RCLONE_REMOTE` in
your `.env`.

### 5. Get your Telegram credentials

**Bot token:**
1. Open Telegram → search `@BotFather`
2. Send `/mybots` → select your bot → **API Token**
3. Paste it into `.env` as `TELEGRAM_BOT_TOKEN`

**Chat ID:**
1. Send any message to your bot in Telegram
2. Visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in a
   browser
3. Find `"chat": { "id": ... }` in the JSON response
4. Paste that number into `.env` as `TELEGRAM_CHAT_ID`

Never share your bot token publicly — treat it like a password. If it
leaks, revoke and regenerate it immediately via BotFather.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `CRON_TIMEZONE` | Timezone used by all cron jobs | `Africa/Nairobi` |
| `BACKUP_CRON` | Cron expression for database backup | `10 0 * * *` (00:10 daily) |
| `DOCKER_CLEANUP_CRON` | Cron expression for Docker cleanup | `0 2 */7 * *` (every 7 days) |
| `RCLONE_REMOTE` | Rclone remote name (must match `rclone.conf`) | `riatirimba-db` |
| `B2_BUCKET` | Backblaze B2 bucket name | `Riatirimba-database-backups` |
| `BACKUP_DIR` | Local dump directory inside the container | `/app/backups` |
| `RETENTION_DAYS` | Days to keep local dump folders before deleting | `7` |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token from BotFather | `123456789:ABC...` |
| `TELEGRAM_CHAT_ID` | Telegram chat ID to receive alerts | `123456789` |
| `POSTGRES_USER` | Shared username for all 3 Postgres containers | `postgres` |
| `POSTGRES_PASSWORD` | Shared password for all 3 Postgres containers | — |
| `ACADEMICS_DB` | Database name for the academics container | `academics_db` |
| `ADMISSION_DB` | Database name for the admission container | `admission_db` |
| `STUDENTS_DB` | Database name for the students container | `students_db` |
| `MYSQL_USER` | MySQL non-root username | `lawrence` |
| `MYSQL_PASSWORD` | MySQL non-root password | — |
| `MYSQL_DATABASE` | MySQL database name | `auth_db` |
| `MYSQL_ROOT_PASSWORD` | MySQL root password (used by the healthcheck) | — |

**Note on passwords containing `#`:** `.env` files treat `#` as a comment
character. Any password containing `#` must be wrapped in double quotes,
e.g. `POSTGRES_PASSWORD="Afnog@#1"`.

---

## Docker Socket — Linux vs Windows

The Docker cleanup job needs access to the Docker daemon to run
`docker system prune`. The mount required differs by platform.

**`docker-compose.yml` ships configured for Linux (production):**

```yaml
volumes:
  - backups:/app/backups
  - /var/run/docker.sock:/var/run/docker.sock
  - ./rclone.conf:/root/.config/rclone/rclone.conf:ro
```

**On Windows, this will not work as-is.** Windows Docker Desktop uses a
named pipe instead of a Unix socket, and mounting it into a Linux
container currently triggers a known `docker-cli` crash
(`panic: runtime error: invalid memory address or nil pointer dereference`)
when the Docker cleanup job runs — this is an upstream Docker CLI bug,
not an issue in this service's code.

**As a result, the Docker cleanup job cannot be fully tested on Windows.**
Everything else (backups, scheduler, Telegram alerts, retry logic) works
identically on Windows and Linux. Do not attempt to work around this by
mounting the named pipe — it will build and mount successfully, but the
job will crash at runtime. Verify the Docker cleanup job on a Linux
host or the production server instead.

---

## Running

### Start the service

```bash
docker compose up -d --build
```

On first start this installs `pg_dump`, `mysqldump`, `docker-cli`, and
`rclone` inside the image — expect the first build to take a few
minutes.

### Watch logs

```bash
docker logs housekeeping-service -f
```

### Confirm all containers are healthy

```bash
docker ps
```

All 5 containers should show `Up` — the four database containers should
show `(healthy)` once their healthchecks pass.

### Manually trigger a backup (without waiting for the schedule)

```bash
docker exec -it housekeeping-service node -e "
require('dotenv').config();
const { runBackupJob } = require('./jobs/backup');
runBackupJob();
"
```

### Manually trigger a Docker cleanup (Linux only — see limitation above)

```bash
docker exec -it housekeeping-service node -e "
require('dotenv').config();
const { runDockerCleanupJob } = require('./jobs/dockerCleanup');
runDockerCleanupJob();
"
```

### Stop the service

```bash
docker compose down
```

### Stop and remove all data (fresh start)

```bash
docker compose down -v
```

---

## Expected Output

**Successful backup:**

```
[backup] ===== Starting backup job =====
[backup] 📦 Dumping academics_db... (attempt 1/5)
[backup] ✓ academics_db dumped → /app/backups/2026-07-17_00-10-00/academics_db.tar
[backup] ☁ Uploading academics_db.tar → riatirimba-db:Riatirimba-database-backups/daily/
[backup] ✓ Uploaded academics_db.tar to daily
[telegram] ✓ Alert sent: ✅ Daily Backup successful for academics_db
...
[backup] ===== Backup job complete =====
```

**Docker cleanup:**

```
[docker-cleanup] ===== Starting Docker cleanup =====
[docker-cleanup] Started : 2026-07-17 02:00
[docker-cleanup] Finished: 2026-07-17 02:00
[docker-cleanup] Removed : 4 image(s), 2 network(s), 1 volume(s)
[docker-cleanup] Space   : 1.23GB reclaimed
[docker-cleanup] Status  : Completed successfully
[docker-cleanup] Duration: 8 second(s)
[docker-cleanup] ===== Docker cleanup complete =====
```

**Scheduler registration on startup:**

```
[scheduler] ===== Initialising housekeeping scheduler =====
[scheduler] Timezone: Africa/Nairobi
[scheduler] ✓ Registered: Database Backup — "10 0 * * *" (Africa/Nairobi)
[scheduler] ✓ Registered: Docker Cleanup — "0 2 */7 * *" (Africa/Nairobi)
[scheduler] ===== All jobs registered — scheduler running =====
```

---

## Resilience

The backup job retries automatically if a database container is still
starting up (up to 5 attempts, 5 seconds apart) before giving up and
alerting. This makes the service resilient regardless of how containers
were started — `docker compose up`, the Docker Desktop UI, or an
automatic restart after a host reboot all start containers slightly
differently, and `depends_on` healthchecks alone don't cover every case.

If a job fails after all retries, it is logged and a Telegram alert is
sent — the scheduler itself never stops, and other databases in the same
run are unaffected by one failure.

---

## Manual Restore

```bash
# Fetch a dump from Backblaze B2
rclone copy riatirimba-db:Riatirimba-database-backups/daily/academics_db.tar /tmp/

# Restore into PostgreSQL
pg_restore -U postgres -c -C -d postgres -v /tmp/academics_db.tar
```

For MySQL, extract the `.tar` first, then:

```bash
mysql -u lawrence -p auth_db < auth_db.sql
```

---

## Adding a Future Job

The service is designed so a new scheduled job never requires touching
existing files.

1. Create `jobs/yourJob.js` exporting an async `runYourJob()` function
   that never throws — catch and log its own errors internally.
2. Add a cron variable to `.env` and `.env.example`, e.g.
   `LOG_ROTATION_CRON=0 3 * * *`
3. Register it in `scheduler/cron.js`:
   ```js
   const { runYourJob } = require('../jobs/yourJob');
   registerJob('Log Rotation', 'LOG_ROTATION_CRON', process.env.LOG_ROTATION_CRON, runYourJob);
   ```

That's it — no other file changes needed.

Planned future jobs: log rotation, health monitoring, temporary file
cleanup, storage usage reporting, SSL certificate checks, service health
checks, backup verification, disk usage alerts.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `pg_dump: connection refused` / `database system is starting up` | DB container not ready yet | Built-in retry logic handles this automatically — if it still fails after 5 attempts, check `docker ps` for container health |
| `mysqldump: unknown variable 'ssl-mode=DISABLED'` | Wrong SSL flag for the installed client | Use `--skip-ssl`, not `--ssl-mode=DISABLED` |
| `Plugin caching_sha2_password could not be loaded` | MySQL 8 default auth plugin unsupported by the dump client | Ensure `auth-database` has `command: --default-authentication-plugin=mysql_native_password` in `docker-compose.yml` |
| `TLS/SSL error: self-signed certificate` | mysqldump attempting an encrypted connection | Confirm `--skip-ssl` is present in the mysql dump command in `jobs/backup.js` |
| `invalid file request jobs/backup.js` during build | Docker BuildKit issue on Windows | Run `export DOCKER_BUILDKIT=0` before `docker compose up --build` |
| `failed to connect to the docker API at unix:///var/run/docker.sock` | Docker socket not mounted, or wrong path for platform | See [Docker Socket — Linux vs Windows](#docker-socket--linux-vs-windows) |
| `panic: runtime error: invalid memory address` during Docker cleanup | Known docker-cli bug with Windows named pipes | Expected on Windows — see limitation above; verify on Linux instead |
| Telegram alerts not arriving | Bot token/chat ID wrong, or bot never messaged | Re-check `.env`, confirm you sent the bot a message first so `getUpdates` returns your chat ID |
| No backups happen automatically | Container not running at scheduled time | `restart: unless-stopped` keeps it running across reboots on an always-on host; on a laptop, backups only fire while Docker Desktop is open |

---

## Maintainers

- **Primary Developer:** Lawrence Tsungu
- **Next Dev:** Derek Imbusi
- **Purpose:** Ensures all Riatiriba ERP databases are backed up,
  versioned, restorable, and that host infrastructure stays clean of
  unused Docker resources.