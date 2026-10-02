# 🤖 AI Agent Deployment Guide — LearnHouze v2.0
> **Target Audience:** AI Coding Assistants (Antigravity, Claude, GPT-4, Cursor, Devin) and DevOps Engineers.
> **Purpose:** 100% automated, zero-confusion setup of the entire LearnHouze v2.0 platform on any server or machine.

---

## 1. Quick Context for the AI Agent
You are looking at **LearnHouze v2.0**, a complete modern Learning Management System (LMS) and Smart School Platform.

### Architecture Components:
- **Frontend:** Next.js 16 (React 19 / Turbopack / TailwindCSS) under `apps/web/`
- **Backend API:** FastAPI (Python 3.11+, SQLModel, AsyncPG) under `apps/api/`
- **Collaboration Server:** Hocuspocus v4 (Yjs WebSocket whiteboard/editor engine) under `apps/collab/`
- **Database:** PostgreSQL 16 with `pgvector` extension
- **Cache/Queue:** Redis 7
- **Database Dump:** `database/learnhouse_dump.sql` (14MB pre-configured with Atatürk Fen ve Anadolu Lisesi, 10-A, assignments, boards, games)

---

## 2. One-Click Deployment (Choose Option A or B)

### 🐳 Option A: Docker Deployment (Recommended for Cloud / VPS)
If Docker and Docker Compose are available on the machine:

```bash
cd LearnHouze_v2.0
cp .env.example .env
docker compose up -d --build
```

**What this does automatically:**
1. Starts PostgreSQL 16 with `pgvector` and automatically restores `database/learnhouse_dump.sql` on first launch.
2. Starts Redis 7.
3. Builds and runs the full stack (Web on port 3000/80, API on port 1348, Collab on port 4000).

---

### 💻 Option B: Bare-Metal / Native Server Deployment (Ubuntu / Debian / macOS)
If deploying directly to a Linux VPS or Mac without Docker:

```bash
cd LearnHouze_v2.0
bash install.sh
```

Or step-by-step:

#### Step 1: Install System Services (PostgreSQL & Redis)
On Ubuntu/Debian:
```bash
sudo apt update && sudo apt install -y postgresql postgresql-contrib redis-server curl git python3 python3-pip python3-venv
sudo systemctl enable --now postgresql redis-server
```

#### Step 2: Restore the Database
```bash
bash database/restore.sh
```
*(Restores all tables, users, games, classes, boards directly into local PostgreSQL)*

#### Step 3: Install Package Managers (Bun & uv)
```bash
# Install Bun (if not present)
command -v bun || curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"

# Install uv (if not present)
command -v uv || curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.cargo/bin:$PATH"
```

#### Step 4: Install Dependencies
```bash
# 1. API
cd apps/api && uv sync && cd ../..

# 2. Collab
cd apps/collab && bun install && cd ../..

# 3. Web
cd apps/web && bun install && cd ../..
```

#### Step 5: Start the Stack
```bash
./start.sh
```
To stop the stack at any time:
```bash
./stop.sh
```

---

## 3. Production Systemd Services (For Permanent 24/7 Linux Hosting)

If running bare-metal on a Linux server, create the following 3 systemd services:

### 1. Backend API (`/etc/systemd/system/learnhouse-api.service`):
```ini
[Unit]
Description=LearnHouse API Server
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/LearnHouze_v2.0/apps/api
ExecStart=/bin/bash run_demo_api.sh
Restart=always
RestartSec=5
Environment=PATH=/root/.cargo/bin:/root/.local/bin:/usr/local/bin:/usr/bin

[Install]
WantedBy=multi-user.target
```

### 2. Collab Server (`/etc/systemd/system/learnhouse-collab.service`):
```ini
[Unit]
Description=LearnHouse Collaboration Server
After=network.target redis-server.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/LearnHouze_v2.0/apps/collab
ExecStart=/bin/bash run_demo_collab.sh
Restart=always
RestartSec=5
Environment=PATH=/root/.bun/bin:/usr/local/bin:/usr/bin

[Install]
WantedBy=multi-user.target
```

### 3. Web Frontend (`/etc/systemd/system/learnhouse-web.service`):
```ini
[Unit]
Description=LearnHouse Web Frontend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/LearnHouze_v2.0/apps/web
ExecStart=/root/.bun/bin/bun run dev -p 3010
Restart=always
RestartSec=5
Environment=PATH=/root/.bun/bin:/usr/local/bin:/usr/bin

[Install]
WantedBy=multi-user.target
```

Enable and start all:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now learnhouse-api learnhouse-collab learnhouse-web
```

---

## 4. Verification & Health Check

After launching, verify that the services respond:

```bash
# 1. API Health Check
curl -I http://localhost:1348/docs

# 2. Instance Info
curl http://localhost:1348/api/v1/instance/info

# 3. Collab Server
curl http://localhost:4000

# 4. Web Frontend
curl -I http://localhost:3010/login
```

All commands must return `HTTP 200 OK` or `{"status": "ok"}`.

---

## 5. Demo Accounts & Pre-configured Data

All accounts are linked to **Atatürk Fen ve Anadolu Lisesi** and class **10-A Fen ve Matematik Şubesi**:

| Role | Email | Password | Access / Scope |
| :--- | :--- | :--- | :--- |
| **Principal / Müdür** | `idare@oxonom.com` | `Ugur2803*` | Atatürk Fen ve Anadolu Lisesi Yönetimi |
| **Teacher / Öğretmen** | `ogretmen@oxonom.com` | `Ugur2803*` | 10-A Şubesi Sınıf Öğretmeni |
| **Student / Öğrenci** | `ogrenci@oxonom.com` | `Ugur2803*` | 10-A Şubesi Kayıtlı Öğrenci |
| **Superadmin** | `admin@oxonom.com` | `Ugur2803*` | Platform Geneli Yönetim |

---

## 6. Pre-Installed Educational Modules & Games
The database dump includes:
1. **ORBIT:** 1.3 MB 3D WebGL Solar System simulation (flagship 3D game)
2. **2048 Sayı & Mantık Bulmacası**
3. **Hafıza Kartları & Çiftini Bul**
4. **Uzay Roketi Matematik Görevi**
5. **Kelime Avcısı & Harf Çözücü** (Büyük harf ve 5 puan ipucu korumalı)
6. MEB 1. Sınıf İlk Okuma Yazma Modülü
7. MEB 2. Sınıf İngilizce Temel Kelimeler Modülü
8. 13 adet interaktif akıllı tahta panosu ve MEB kazanımlı ödevler
