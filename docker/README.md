# 🚀 Running Application Locally (Docker Compose + Makefile)

This project uses multiple Docker Compose files to separate infrastructure, databases, and microservices into distinct
layers.

A **Makefile** is provided to wrap common workflows into concise, memorable commands.

## 📁 Directory Structure

```
app/
 |── docker/
 |      |── docker-compose/
 |            ├── dev/                     ← Fully containerized dev environment (Docker)
 |            │   ├── infra.yaml           ← RabbitMQ, Redis
 |            │   ├── databases.yaml       ← PostgreSQL, MongoDB
 |            │   |── services.yaml        ← All microservices + API Gateway
 |            │   ├── Makefile
 |            │   ├── .env.dev             ← Your local env vars (not committed to git)
 |            │
 |            └── local/                   ← Infra + DB only (services run from IntelliJ)
 |               ├── infra.yaml
 |              |── databases.yaml
 |               ├── Makefile
 |
 |── services/
 |── infrastructure/
 | ...
```

## 🖥️ Local Setup (IntelliJ + Docker for infra/db only)

Use this when you want to run microservices directly from IntelliJ IDEA with hot reload,
while keeping infrastructure and databases containerized.

```bash
cd docker/docker-compose/local
```

Start only the infrastructure and databases:

```bash
make up-infra   # Start RabbitMQ + Redis
make up-db      # Start RabbitMQ + Redis + PostgreSQL + MongoDB
```

Then run individual services from IntelliJ using the `dev` Spring profile.

## 🐳 Dev Setup (Fully Containerized)

Use this when you want everything running in Docker — no IntelliJ required.

### Prerequisites

- Docker Desktop running
- `.env.dev` configured (see setup below)
- Images built: `ripanbaidya/lunecare-*:1.0.0`
- `init-db.sql` present at project root (creates PostgreSQL schemas)
- RSA keys present at `secrets/keys/private_key.pem` and `secrets/keys/public_key.pem`

### First-Time Setup

```bash
cd docker/docker-compose/dev

# Copy the example env file and fill in your values
cp .env.example .env.dev
```

Open `.env.dev` and set:

- `ENCRYPT_KEY` — must match the key used to encrypt `{cipher}` values in the config repo
- All other values have sensible defaults for local dev

### Run Everything

```bash
make up
```

This starts all layers in the correct order:

```
RabbitMQ + Redis → PostgreSQL + MongoDB → Config Server → Eureka → Microservices → API Gateway
```

### ⚙️ Core Lifecycle Commands

| Command        | Description                                         |
|----------------|-----------------------------------------------------|
| `make up`      | Start all services (infra + db + microservices)     |
| `make down`    | Stop all containers (volumes are preserved)         |
| `make clean`   | Stop containers and remove all volumes (full reset) |
| `make restart` | Restart all running containers                      |
| `make rebuild` | Pull latest images and recreate containers          |

### 🔍 Selective Startup

Use these when you want finer control over what starts:

| Command            | Description                                                    |
|--------------------|----------------------------------------------------------------|
| `make up-infra`    | Start only infrastructure (RabbitMQ, Redis)                    |
| `make up-db`       | Start infra + databases (PostgreSQL, MongoDB)                  |
| `make up-services` | Start only microservices (requires infra + db already running) |

### 📊 Observability & Debugging

| Command             | Description                                                     |
|---------------------|-----------------------------------------------------------------|
| `make ps`           | Show container status in table format                           |
| `make health`       | Check `/actuator/health` for all services from host             |
| `make test-network` | Verify inter-container DNS resolution via API Gateway           |
| `make logs`         | Tail logs for all services                                      |
| `make logs-auth`    | Tail logs for a specific service (replace `auth` with any name) |
| `make logs-errors`  | Aggregate ERROR/EXCEPTION logs across all services              |

### 🗄️ Database Utilities

| Command              | Description                                |
|----------------------|--------------------------------------------|
| `make db-connect`    | Open PostgreSQL interactive shell (`psql`) |
| `make db-schemas`    | List all PostgreSQL schemas                |
| `make mongo-connect` | Open MongoDB shell (`mongosh`)             |
| `make mongo-dbs`     | List all MongoDB databases                 |

### 🔧 Configuration Management

| Command               | Description                                                                  |
|-----------------------|------------------------------------------------------------------------------|
| `make config-check`   | Validate config-server is serving configs correctly                          |
| `make config-refresh` | Trigger Spring Cloud Bus refresh — propagates config changes to all services |

### 🌐 API Access

All external traffic goes through the **API Gateway** on port `8080`.

```
http://localhost:8080/api/v1/auth/login
http://localhost:8080/api/v1/appointment/book
```

> ⚠️ Always use `localhost` from your browser/Postman — never Docker container names.
> Container names (e.g. `auth`, `appointment`) are only resolvable inside the Docker network.

### 🔑 Spring Profile Strategy

All microservices start with `SPRING_PROFILES_ACTIVE=dev,docker`.

| Profile  | Purpose                                                                 |
|----------|-------------------------------------------------------------------------|
| `dev`    | Owns all config — JPA settings, logging, non-prod behaviour             |
| `docker` | Patches only hostnames — replaces `localhost` with Docker service names |

Load order (last wins):

```
application.yml
→ application-dev.yml       (localhost refs, dev behaviour)
→ application-docker.yml    (overrides hostnames to docker service names)
→ services/<name>/application.yml
→ services/<name>/application-dev.yml
→ services/<name>/application-docker.yml
```

### 📌 Tip

Run the following to see all available Makefile commands:

```bash
make help
```

---

### 🐛 Common Issues

| Symptom                                 | Cause                          | Fix                                            |
|-----------------------------------------|--------------------------------|------------------------------------------------|
| `network lunecare_network not found`    | Running only one compose file  | Always run all files together: `make up`       |
| `{cipher}` values not decrypted         | Wrong or quoted `ENCRYPT_KEY`  | Remove quotes from `ENCRYPT_KEY` in `.env.dev` |
| Service fails to start, missing RSA key | PEM files not mounted          | Ensure `secrets/keys/` exists at project root  |
| `pull access denied`                    | Wrong image name prefix        | Check `DOCKERHUB_ACCOUNT` in `.env.dev`        |
| Services up but not in Eureka           | Wrong `SPRING_PROFILES_ACTIVE` | Must be `dev,docker` — not just `docker`       |