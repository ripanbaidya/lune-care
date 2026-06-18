# Running LuneCare Locally (Docker Compose + Makefile)

This guide provides instructions for setting up and running the entire **LuneCare** microservice stack locally. You can
choose between two execution modes depending on your development workflow.

## Execution Modes 🚀

### 1. Hybrid Mode (Local Services + Docker Infrastructure)

* **How it works:** Core infrastructure components (`PostgreSQL`, `MongoDB`, `RabbitMQ`, `Redis`) run inside Docker
  containers. You manually boot up the individual backend microservices and the frontend application within your
  preferred IDE or terminal.
* **Best for:** Active development, debugging, and writing code.
* 👉 **[Read the Hybrid Local Setup Guide](docker/docker-compose/local/README.md)**

### 2. Full Containerized Mode (Docker Compose Stack)

* **How it works:** The entire stack—including all backend microservices and the frontend application—is spun up
  simultaneously using pre-built images via Docker Compose.
* **Best for:** Quick testing, product demonstrations, or validating cross-service integrations without local
  compilation.
* 👉 **[Read the Full Docker Compose Guide](docker/docker-compose/compose/README.md)**

---

## Makefile Command Reference

A centralized `Makefile` is provided at the root of the project to simplify environment orchestration. These shortcuts
work across both deployment setups.

### 📋 General Lifecycle Management

| Command        | Description                                                        |
|----------------|--------------------------------------------------------------------|
| `make up`      | Start all defined services and infrastructure.                     |
| `make down`    | Stop running containers (**volumes are preserved**; data is safe). |
| `make down-v`  | Stop containers and **remove all volumes** (full data wipe).       |
| `make restart` | Quick restart of all containers.                                   |
| `make rebuild` | Pull the latest images and recreate the container environment.     |

### 🔍 Selective Startup

| Command            | Description                                                                                       |
|--------------------|---------------------------------------------------------------------------------------------------|
| `make up-infra`    | Start only foundational infrastructure components (**RabbitMQ** + **Redis**).                     |
| `make up-db`       | Start backend databases (**PostgreSQL** + **MongoDB**).                                           |
| `make up-services` | Start backend microservices only *(Full Containerized Mode only; requires infra & DBs to be up)*. |

### 📊 Observability & Debugging

| Command             | Description                                                                     |
|---------------------|---------------------------------------------------------------------------------|
| `make ps`           | Display the status of all containers in a clean table format.                   |
| `make health`       | Curl and check the `/actuator/health` endpoint for all running services.        |
| `make test-network` | Verify inter-container DNS resolution and routing via the API Gateway.          |
| `make logs`         | Tail logs for all running services simultaneously.                              |
| `make logs-<name>`  | Tail logs for a specific service (e.g., `make logs-auth`).                      |
| `make logs-errors`  | Aggregate and stream only `ERROR` or `EXCEPTION` lines across all service logs. |

### 🗄️ Database Utilities

| Command              | Description                                                                         |
|----------------------|-------------------------------------------------------------------------------------|
| `make db-connect`    | Establish an interactive terminal session inside the PostgreSQL container (`psql`). |
| `make db-schemas`    | Quickly list all active PostgreSQL schemas.                                         |
| `make mongo-connect` | Establish an interactive terminal session inside the MongoDB container (`mongosh`). |
| `make mongo-dbs`     | Quickly list all active MongoDB databases.                                          |

### 🔧 Config Server Utilities

| Command               | Description                                                                                     |
|-----------------------|-------------------------------------------------------------------------------------------------|
| `make config-check`   | Validate that the `config-server` is actively and correctly serving environment configurations. |
| `make config-refresh` | Trigger a Spring Cloud Bus refresh event to hot-reload configs across all active services.      |

---

## 🐛 Troubleshooting & Common Issues

| Symptom                                          | Probable Cause                                       | Actionable Fix                                                                                      |
|--------------------------------------------------|------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| `network lunecare_network not found`             | Running a single Compose file manually in isolation. | Always orchestrate via `make` commands—they dynamically stitch required configurations together.    |
| `{cipher}` values are not decrypting             | Missing or invalid encryption secrets.               | Set the `ENCRYPT_KEY` variable in your `.env.dev` file. **Do not wrap the key in quotes.**          |
| Service fails on startup due to missing RSA keys | Security PEM keys are not mounted or accessible.     | Ensure that a valid `secrets/keys/` directory populated with RSA keys exists at the project root.   |
| `pull access denied`                             | Incorrect Docker registry image prefix.              | Double-check and correct the `DOCKERHUB_ACCOUNT` property inside your `.env.dev` profile.           |
| Services are up but not registering on Eureka    | Wrong profile settings applied to the container.     | The `SPRING_PROFILES_ACTIVE` environment variable must be set to `dev,docker` (not `docker` alone). |

### 📌 Quick Help Tip

If you ever forget a shortcut or want to see dynamic parameters, simply run:

```bash
make help

```

This will print out a comprehensive, self-documenting list of every target available in the project's automation
workflow.

---

⭐ **Please** Consider leaving a star on the repository to show your support!