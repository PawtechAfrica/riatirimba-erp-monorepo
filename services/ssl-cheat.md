# SSL Setup Cheat Sheet

**Let's Encrypt + Nginx + Docker + UFW**
**Domain:** `api.riatirimbatvc.ac.ke`

---

## 📋 Prerequisites

- Domain pointing to VPS IP
- Docker & docker-compose installed
- Nginx container running
- Ports 80/443 open

---

## 🚀 Quick Start

### 1. Stop Nginx

```bash
cd /srv/RIATIRIMBA-ERP
docker-compose stop nginx
```

### 2. Install Certbot

```bash
sudo apt update
sudo apt install certbot -y
```

### 3. Get Certificate (DNS Challenge)

```bash
sudo certbot certonly --manual --preferred-challenges dns -d api.riatirimbatvc.ac.ke
```

### 4. DNS Setup When Prompted

| Field | Value |
|-------|-------|
| Name  | `_acme-challenge.api` |
| Type  | `TXT` |
| Value | *(from certbot output)* |
| TTL   | `300` |

### 5. Verify DNS Before Continuing

Run from another terminal:

```bash
nslookup -type=TXT _acme-challenge.api.riatirimbatvc.ac.ke
```

### 6. Confirm in Certbot

Press **Enter** in the Certbot prompt once DNS has propagated and verified.

---

## 🐳 Docker Compose Update

Update volumes in `docker-compose.yml`:

```yaml
volumes:
  - ./Nginx/nginx-ssl.conf:/etc/nginx/nginx.conf:ro
  - /etc/letsencrypt/live/api.riatirimbatvc.ac.ke/fullchain.pem:/etc/nginx/certs/fullchain.pem:ro
  - /etc/letsencrypt/live/api.riatirimbatvc.ac.ke/privkey.pem:/etc/nginx/certs/privkey.pem:ro
  - ./Nginx/html:/usr/share/nginx/html
```

---

## 🛡️ Firewall Setup (UFW)

```bash
sudo apt install ufw -y
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 🚀 Start Nginx with SSL

```bash
docker-compose up -d nginx
docker exec nginx_proxy nginx -t
```

---

## ✅ Verification Commands

**1. Check certificates**
```bash
sudo ls -la /etc/letsencrypt/live/api.riatirimbatvc.ac.ke/
```

**2. Test SSL**
```bash
curl -I https://api.riatirimbatvc.ac.ke
openssl s_client -connect api.riatirimbatvc.ac.ke:443 -servername api.riatirimbatvc.ac.ke
```

**3. Check firewall**
```bash
sudo ufw status
```

**4. Check Docker**
```bash
docker ps
```

**5. Check certificate expiry**
```bash
sudo certbot certificates
```

---

## 🔄 Auto-Renewal Setup

### 1. Create Renewal Hook

```bash
sudo nano /etc/letsencrypt/renewal-hooks/post/restart-nginx.sh
```

Add the following content:

```bash
#!/bin/bash
docker-compose -f /srv/RIATIRIMBA-ERP/docker-compose.yml restart nginx
```

Make it executable:

```bash
sudo chmod +x /etc/letsencrypt/renewal-hooks/post/restart-nginx.sh
```

### 2. Add Cron Job

```bash
sudo crontab -e
```

Add this line:

```cron
0 3 * * * /usr/bin/certbot renew --quiet --post-hook "docker-compose -f /srv/RIATIRIMBA-ERP/docker-compose.yml restart nginx"
```

### 3. Test Renewal (Dry Run)

```bash
sudo certbot renew --dry-run
```

---

## 🔁 Renewal Command Reference

```bash
sudo certbot certonly --manual --preferred-challenges dns -d api.riatirimbatvc.ac.ke
```