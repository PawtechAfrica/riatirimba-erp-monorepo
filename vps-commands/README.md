# Standalone VPS Commands

Each `vps-*` file is independent. It does **not** require `common.sh` or `install.sh`.
Copy only the commands you need to a VPS.

## Commands

- `vps-status` — read-only snapshot: host info, uptime, disk, memory, all containers, container counts and Compose project status.
- `vps-health` — Docker, load, memory, disk and Compose status.
- `vps-diagnose [service]` — container state, health, restarts, resource usage and recent logs.
- `vps-shell <service>` — open `sh` inside a running service container.
- `vps-deploy <service> <tag>` — back up Compose, update one service image tag, pull and recreate that service.
- `vps-cleanup` — prune stopped containers, dangling images, build cache and unused networks; preserves volumes and tagged images.

`vps-status` also supports `--help` and `--version`. It never restarts, deploys or removes anything, so it is safe to run at any time.

## Install only what you need

For example, to install just status, health and shell commands:

```bash
sudo install -m 0755 vps-status /usr/local/bin/vps-status
sudo install -m 0755 vps-health /usr/local/bin/vps-health
sudo install -m 0755 vps-shell /usr/local/bin/vps-shell
```

Then run them from anywhere:

```bash
vps-status
vps-health
vps-shell fees-service
```

Or run a file directly without installing it:

```bash
chmod +x vps-status
./vps-status
```

Or skip the shebang and `chmod` entirely:

```bash
bash vps-status
```

## Requirements

- Bash and the Docker CLI are required for every command.
- The Docker Compose plugin is required by `vps-health`, `vps-diagnose`, `vps-shell`, `vps-deploy` and `vps-cleanup`. For `vps-status` it is optional; Compose status is simply skipped if the plugin is missing.
- `vps-shell` also uses Python 3 to normalize pasted service names.
- `vps-deploy` expects a straightforward `image:` entry in the selected service block; review the script and test it on staging before production use.

If a command reports that Docker is unavailable or you lack permission, either run it with `sudo` (e.g. `sudo vps-status`) or add your account to the docker group and sign out and back in:

```bash
sudo usermod -aG docker "$USER"
```

## Compose file discovery

The commands look for a Compose file (`compose.yml`, `compose.yaml`, `docker-compose.yml` or `docker-compose.yaml`) in `/srv/riatirimba-erp` and `/srv/RIATIRIMBA-ERP`. `vps-status` additionally checks `/srv/riatirimba-ERP`, `/srv/RIATIRIMBA-erp` and the current directory.

For another project path, set `VPS_COMPOSE_FILE` for that command:

```bash
VPS_COMPOSE_FILE=/srv/my-app/compose.yml vps-status
VPS_COMPOSE_FILE=/srv/my-app/compose.yml vps-health
VPS_COMPOSE_FILE=/srv/my-app/compose.yml vps-diagnose api
```

`vps-diagnose` prints logs, which may contain secrets or personal data. Review output before sharing it.

## Upload the toolkit to a VPS

A simple layout is:

- `/opt/vps-toolkit/` — keep the original script files here.
- `/usr/local/bin/` — installed commands live here so you can run them from any directory.
- `/srv/riatirimba-erp/` — your actual ERP project; do not upload the toolkit into this project folder.

### 1. Upload from your computer

First, extract `standalone-vps-toolkit.zip` on your computer. From a terminal on your **local computer**, run the following, replacing `VPS_USER` and `VPS_HOST` with your SSH username and VPS IP address or hostname:

```bash
scp -r standalone-vps-toolkit VPS_USER@VPS_HOST:/tmp/
```

If your SSH server uses a non-default port, add `-P PORT`, for example `scp -P 2222 -r standalone-vps-toolkit VPS_USER@VPS_HOST:/tmp/`.

You can also use an SFTP client such as WinSCP or FileZilla: connect using the same SSH credentials and upload the extracted `standalone-vps-toolkit` folder to `/tmp/` on the VPS.

### 2. Move the scripts into their permanent folder

SSH into the VPS, then run:

```bash
sudo mkdir -p /opt/vps-toolkit
sudo cp /tmp/standalone-vps-toolkit/vps-* /opt/vps-toolkit/
sudo chown -R "$USER":"$(id -gn)" /opt/vps-toolkit
chmod 755 /opt/vps-toolkit/vps-*
```

Check that the files arrived:

```bash
ls -l /opt/vps-toolkit/
```

### 3. Install only the commands you want

Install each chosen script into `/usr/local/bin/`. For example, to install status, health checks and diagnostics only:

```bash
sudo install -m 0755 /opt/vps-toolkit/vps-status /usr/local/bin/vps-status
sudo install -m 0755 /opt/vps-toolkit/vps-health /usr/local/bin/vps-health
sudo install -m 0755 /opt/vps-toolkit/vps-diagnose /usr/local/bin/vps-diagnose
```

To add another command later, install it in the same way. For example:

```bash
sudo install -m 0755 /opt/vps-toolkit/vps-shell /usr/local/bin/vps-shell
```

You do **not** need `common.sh` or `install.sh`; each script is standalone.

### 4. Run the commands

You can now run installed commands from any directory:

```bash
vps-status
vps-health
vps-diagnose
vps-diagnose fees-service
vps-shell fees-service
```

Use the actual Compose service name for your application. To see available Compose services, change to your project directory and run:

```bash
cd /srv/riatirimba-erp
docker compose config --services
```

### 5. Optional: remove the temporary upload

After confirming the scripts are installed, remove the temporary copy if you no longer need it:

```bash
rm -rf /tmp/standalone-vps-toolkit
```

Keep `/opt/vps-toolkit/` as your source copy so you can reinstall or update individual commands later.

## Troubleshooting: `bad interpreter` or command won't run

Some downloaders and uploaders mangle filenames and strip characters — for example a script arriving as `#!usrbinenv bash.txt`. `chmod +x` will not fix that. Check two things:

1. **The first line must be exactly** `#!/usr/bin/env bash` — no BOM, no leading blank line, nothing before it.
2. **The installed command must not end in `.txt`.**

To repair a file already on the VPS (e.g. `/root/script.txt`):

```bash
# Fix the shebang
sudo sed -i '1s|.*|#!/usr/bin/env bash|' /root/script.txt

# If it was edited on Windows, strip CRLF line endings
sudo sed -i 's/\r$//' /root/script.txt

# Install under a proper name, executable
sudo install -m 0755 /root/script.txt /usr/local/bin/vps-status

# Verify
head -1 /usr/local/bin/vps-status   # must print: #!/usr/bin/env bash
vps-status --version
```

> **Safety note:** Run `vps-deploy` carefully because it changes the Compose image tag and recreates a service. Review its behavior and back up your Compose file before using it on production. `vps-cleanup` preserves Docker volumes, but still review what it prunes before running it on a production VPS. `vps-status` is read-only. Remember that a running container does not guarantee its application is healthy — check logs with `vps-diagnose` when in doubt.