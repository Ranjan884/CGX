# ChangeGuard Setup & Installation Guide

This document outlines the step-by-step procedure for initializing and running the ChangeGuard platform both locally and via Docker Compose.

---

## 1. Prerequisites

Ensure the following tools are installed on your workstation:

| Component | Minimum Version | Verification Command |
|---|---|---|
| **Node.js** | `v18+` (v20 Recommended) | `node -v` |
| **npm** | `v9+` | `npm -v` |
| **Java Development Kit (JDK)** | `17 LTS` | `java -version` |
| **Apache Maven** | `3.8+` | `mvn -v` |
| **Python** | `3.10+` | `python3 --version` |
| **PostgreSQL** | `14+` (15 Recommended) | `psql -V` |
| **Docker & Docker Compose** | `20+` / `v2+` (Optional) | `docker compose version` |

---

## 2. Environment Configuration

Copy the template `.env.example` file to create your local `.env`:

```bash
cp .env.example .env
```

Review and adjust variables for your setup:
- `SPRING_DATASOURCE_URL`: JDBC URL pointing to your PostgreSQL instance.
- `SPRING_DATASOURCE_USERNAME`: PostgreSQL username (default: `postgres`).
- `SPRING_DATASOURCE_PASSWORD`: PostgreSQL password (default: `postgres`).
- `ML_SERVICE_URL`: URL of the running FastAPI ML microservice (default: `http://localhost:8000`).
- `VITE_API_BASE_URL`: Spring Boot backend REST endpoint accessed by browser (default: `http://localhost:8080`).

---

## 3. Database Initialization (PostgreSQL)

Create the database and execute the initialization SQL scripts:

```bash
# 1. Connect to PostgreSQL and create database
psql -U postgres -c "CREATE DATABASE changeguard;"

# 2. Apply table schemas
psql -U postgres -d changeguard -f database/01_schema.sql

# 3. Seed initial banking microservices and historical incidents
psql -U postgres -d changeguard -f database/02_seed.sql
```

Verification query:
```bash
psql -U postgres -d changeguard -c "SELECT count(*) FROM services; SELECT count(*) FROM dependencies;"
```
*Expected: 11 services and 13 dependencies registered.*

---

## 4. Local Development Execution (Manual)

Run the three microservices in separate terminal windows:

### Terminal 1: Python FastAPI ML Microservice
```bash
cd ml-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Verify at: `http://localhost:8000/health` → `{"status":"UP","modelLoaded":true}`*

### Terminal 2: Spring Boot REST Backend
```bash
cd backend
mvn clean spring-boot:run
```
*Verify at: `http://localhost:8080/api/health` → `{"status":"UP"}`*

### Terminal 3: React Frontend Dashboard
```bash
npm install
npm run dev
```
*Access UI at: `http://localhost:3000` (or displayed port)*

---

## 5. Dockerized Execution (Single Command)

To build and spin up the complete isolated stack with container networking, volume mounts, and automated database seeding:

```bash
docker compose up --build
```

### Exposed Service Endpoints:
- **Frontend Dashboard**: `http://localhost:3000`
- **Spring Boot API**: `http://localhost:8080/api/health`
- **FastAPI ML Service**: `http://localhost:8000/health`
- **PostgreSQL Database**: `localhost:5432` (`changeguard` / `postgres`)

To shut down containers and preserve database volumes:
```bash
docker compose down
```

To reset the database completely:
```bash
docker compose down -v
docker compose up --build
```
