# ChangeGuard Deployment Guide

This guide covers deployment strategies for ChangeGuard across on-premises enterprise servers, internal clouds, and containerized staging clusters.

---

## 1. Production Architecture Principles

In a production banking or financial technology deployment:
1. **Network Demarcation**:
   - The React frontend is served via an edge Nginx reverse proxy.
   - The Spring Boot backend resides within an internal enterprise VPC.
   - The FastAPI ML service is an internal private microservice reachable **only** by the Spring Boot gateway.
   - The PostgreSQL instance is protected behind strict firewall ACLs and TLS encryption.
2. **Stateless Scalability**:
   - The Spring Boot application and FastAPI ML microservice are completely stateless.
   - Horizontal pod scaling (HPA) can be applied in Kubernetes based on CPU and request latency.
3. **Database Isolation**:
   - What-If simulations run entirely in ephemeral heap memory and will never write to or lock PostgreSQL records.

---

## 2. Docker Compose Deployment (Standalone VM / Server)

For a single dedicated Linux host (e.g., Ubuntu 22.04 LTS, Red Hat Enterprise Linux 8/9):

### Step 1: Install Docker Engine & Compose
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
```

### Step 2: Prepare Production Environment
Clone the repository and prepare `.env`:
```bash
git clone https://github.com/example/changeguard.git
cd changeguard
cp .env.example .env
```
Ensure strong passwords are set in `.env` for `SPRING_DATASOURCE_PASSWORD` and `POSTGRES_PASSWORD`.

### Step 3: Launch Containers in Detached Mode
```bash
docker compose up --build -d
```

### Step 4: Verify Container Health
```bash
docker compose ps
```
All four services (`changeguard-postgres`, `changeguard-ml-service`, `changeguard-backend`, `changeguard-frontend`) should display `Up (healthy)`.

---

## 3. Reverse Proxy & SSL / TLS Termination

In enterprise production, place an SSL-terminating reverse proxy (HAProxy, Cloudflare, or AWS ALB) in front of the frontend container:

```nginx
server {
    listen 443 ssl http2;
    server_name changeguard.internal.bank.com;

    ssl_certificate /etc/ssl/certs/changeguard.crt;
    ssl_certificate_key /etc/ssl/private/changeguard.key;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

---

## 4. Monitoring & Telemetry

- **Spring Boot Health**: Configure your uptime monitor (e.g. Datadog, Prometheus, Zabbix) to poll `GET /api/health` every 15 seconds.
- **FastAPI Health**: Monitor `GET /health` on the ML microservice for `modelLoaded: true`.
- **Database Backup**: Schedule daily automated pg_dump backups:
  ```bash
  docker exec -t changeguard-postgres pg_dump -U postgres changeguard | gzip > /backups/changeguard_$(date +%Y%m%d).sql.gz
  ```
