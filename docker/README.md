# 🚀 Running LuneCare Locally (Docker Compose + Makefile)

Two environments are provided. Pick one based on your workflow:

| Environment | Location                  | When to use                                                       |
|-------------|---------------------------|-------------------------------------------------------------------|
| `local/`    | `docker-compose/local/`   | Run microservices from IntelliJ; only infra + databases in Docker |
| `compose/`  | `docker-compose/compose/` | Run everything in Docker; no IDE required                         |

A shared `Makefile.common` holds all targets. Each environment's `Makefile` is a thin
wrapper that sets the compose file list and delegates to it.

---

## 📁 Directory Structure

```
docker/
├── .env.example                          ← copy to compose/.env.dev and fill values
├── .gitignore
├── README.md
└── docker-compose/
    ├── Makefile.common                   ← shared targets (included by both envs)
    │
    ├── local/                            ← IntelliJ dev: infra + databases only
    │   ├── Makefile
    │   ├── infra.yaml                    ← RabbitMQ, Redis
    │   └── databases.yaml               ← PostgreSQL, MongoDB
    │
    ├── compose/                          ← fully containerised: everything in Docker
    │   ├── Makefile
    │   ├── .env.dev                      ← your local env vars (not committed)
    │   ├── infra.yaml                    ← RabbitMQ, Redis
    │   ├── databases.yaml               ← PostgreSQL, MongoDB
    │   ├── services.yaml                ← all microservices + API Gateway
    │   ├── observability.yaml           ← Loki, Alloy, MinIO, Prometheus, Grafana
    │   └── commons.yaml                 ← shared OpenTelemetry config (extends)
    │
    └── observability/                   ← tool-specific configs (shared by compose/)
        ├── alloy/alloy-config.yaml
        ├── grafana/datasource.yaml
        ├── loki/loki-config.yaml
        ├── prometheus/prometheus.yaml
        └── tempo/tempo.yaml
```

---

## 🖥️ Local Setup (IntelliJ + Docker for infra/db)

Use this when you want hot-reload from IntelliJ while keeping infrastructure containerised.

```bash
cd docker/docker-compose/local
```

```bash
make up-infra   # RabbitMQ + Redis only
make up-db      # RabbitMQ + Redis + PostgreSQL + MongoDB
```

Then run each microservice from IntelliJ with the `dev` Spring profile.

---

## 🐳 Compose Setup (Fully Containerised)

Use this when you want everything running in Docker — no IntelliJ required.

### Prerequisites

- Docker Desktop running
- `.env.dev` configured (see below)
- Images built: `ripanbaidya/lunecare-*:1.0.0`
- `init-db.sql` present at project root (creates PostgreSQL schemas)
- RSA keys at `secrets/keys/private_key.pem` and `secrets/keys/public_key.pem`

### First-Time Setup

```bash
cd docker/docker-compose/compose

cp ../../.env.example .env.dev
# Open .env.dev and set ENCRYPT_KEY — must match the key used to encrypt {cipher} values
```

### Run Everything

```bash
make up
```

Boot order managed by healthcheck dependencies:

```
RabbitMQ + Redis → PostgreSQL + MongoDB → Config Server → Eureka → Microservices → API Gateway
```

---

## ⚙️ Core Commands (available in both environments)

| Command        | Description                                    |
|----------------|------------------------------------------------|
| `make up`      | Start all services                             |
| `make down`    | Stop containers (volumes preserved)            |
| `make down-v`  | Stop containers and remove volumes (full wipe) |
| `make restart` | Restart all containers                         |
| `make rebuild` | Pull latest images and recreate containers     |

## 🔍 Selective Startup

| Command            | Description                                                     |
|--------------------|-----------------------------------------------------------------|
| `make up-infra`    | Start only RabbitMQ + Redis                                     |
| `make up-db`       | Start infra + PostgreSQL + MongoDB                              |
| `make up-services` | Start microservices only (`compose/` only; requires infra + db) |

## 📊 Observability & Debugging

| Command             | Description                                           |
|---------------------|-------------------------------------------------------|
| `make ps`           | Container status in table format                      |
| `make health`       | Check `/actuator/health` for all services             |
| `make test-network` | Verify inter-container DNS resolution via API Gateway |
| `make logs`         | Tail all service logs                                 |
| `make logs-<name>`  | Tail logs for a specific service (e.g. `logs-auth`)   |
| `make logs-errors`  | Aggregate ERROR/EXCEPTION lines across all services   |

## 🗄️ Database Utilities

| Command              | Description                    |
|----------------------|--------------------------------|
| `make db-connect`    | Open PostgreSQL shell (`psql`) |
| `make db-schemas`    | List all PostgreSQL schemas    |
| `make mongo-connect` | Open MongoDB shell (`mongosh`) |
| `make mongo-dbs`     | List all MongoDB databases     |

## 🔧 Config Server

| Command               | Description                                          |
|-----------------------|------------------------------------------------------|
| `make config-check`   | Validate config-server is serving configs            |
| `make config-refresh` | Trigger Spring Cloud Bus refresh across all services |

---

## 🌐 API Access

All external traffic goes through the **API Gateway** on port `8080`:

```
http://localhost:8080/api/v1/auth/login
http://localhost:8080/api/v1/appointment/book
```

> Always use `localhost` from your browser or Postman.
> Container names (`auth`, `appointment`, etc.) are only resolvable inside the Docker network.

---

## 🔑 Spring Profile Strategy

All microservices start with `SPRING_PROFILES_ACTIVE=dev,docker`.

| Profile  | Purpose                                                                 |
|----------|-------------------------------------------------------------------------|
| `dev`    | Owns all config — JPA, logging, non-prod behaviour                      |
| `docker` | Patches hostnames only — replaces `localhost` with Docker service names |

Load order (last wins):

```
application.yml
→ application-dev.yml          (localhost refs, dev behaviour)
→ application-docker.yml       (overrides hostnames to docker service names)
→ services/<name>/application.yml
→ services/<name>/application-dev.yml
→ services/<name>/application-docker.yml
```

---

## 🐛 Common Issues

| Symptom                              | Cause                                      | Fix                                                        |
|--------------------------------------|--------------------------------------------|------------------------------------------------------------|
| `network lunecare_network not found` | Running a single compose file in isolation | Always run via `make` — it combines all required files     |
| `{cipher}` values not decrypted      | Wrong or missing `ENCRYPT_KEY`             | Set `ENCRYPT_KEY` in `.env.dev` without surrounding quotes |
| Service fails — missing RSA key      | PEM files not mounted                      | Ensure `secrets/keys/` exists at project root              |
| `pull access denied`                 | Wrong image prefix                         | Check `DOCKERHUB_ACCOUNT` in `.env.dev`                    |
| Services up but not in Eureka        | Wrong `SPRING_PROFILES_ACTIVE`             | Must be `dev,docker` — not `docker` alone                  |

---

### 📌 Tip

```bash
make help
```

Lists every available command with a description.