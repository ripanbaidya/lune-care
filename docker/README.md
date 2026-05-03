# LuneCare

Modular, environment-separated Docker Compose architecture for the LuneCare microservices platform.

## Structure

```
docker/
├── .env.example                        # Committed — documents all required variables
├── .env.dev                            # Gitignored — fill for local dev
├── .env.prod                           # Gitignored — fill for production
├── .gitignore
├── Makefile                            # Single interface for all operations
│
└── docker-compose/
    ├── base/
    │   ├── infra.yml                   # Redis, RabbitMQ
    │   ├── databases.yml               # 6x PostgreSQL, 2x MongoDB
    │   ├── services.yml                # All Spring Boot microservices
    │   └── observability.yml           # Prometheus + Grafana (activate when ready)
    │
    ├── dev/
    │   ├── infra.override.yml          # Expose infra ports to localhost
    │   ├── databases.override.yml      # Expose all DB ports to localhost
    │   └── services.override.yml       # Expose all service ports, no resource limits
    │
    └── prod/
        ├── infra.override.yml          # No exposed ports, resource limits, restart policy
        ├── databases.override.yml      # No exposed ports, resource limits
        └── services.override.yml       # Only gateway exposed, JVM tuning, restart policy
```

## Quick Start

### 1. Setup environment file

```bash
cp docker/.env.example docker/.env.dev
# Edit docker/.env.dev — at minimum set ENCRYPT_KEY
```

### 2. Build images (from lune-care root)

```bash
make build
# or build a single service:
make build-service s=auth
```

### 3. Start dev stack

```bash
# Full stack (all services containerized)
make dev-up

# Infra + DBs only (run Spring services via IntelliJ)
make dev-infra
```

### 4. Common operations

```bash
make dev-ps                         # container status
make dev-logs                       # tail all logs
make dev-logs-service s=auth-service  # tail one service
make dev-restart-service s=payment-service
make dev-down                       # stop (keep volumes)
make dev-destroy                    # stop + wipe volumes
```

## Boot Order

```
Redis + RabbitMQ + DBs
    └─→ config-server
            └─→ eureka-server
                    └─→ all microservices (parallel)
                            └─→ api-gateway
```

## Service Ports (Dev)

| Service           | Port  |
|-------------------|-------|
| api-gateway       | 8080  |
| auth-service      | 8081  |
| patient-service   | 8082  |
| doctor-service    | 8083  |
| appointment       | 8084  |
| payment-service   | 8085  |
| notification      | 8086  |
| feedback-service  | 8087  |
| admin-service     | 8088  |
| eureka-server     | 8761  |
| config-server     | 8888  |
| RabbitMQ AMQP     | 5672  |
| RabbitMQ UI       | 15672 |
| Redis             | 6379  |
| auth-db           | 5433  |
| patient-db        | 5434  |
| doctor-db         | 5435  |
| appointment-db    | 5436  |
| payment-db        | 5437  |
| notification-db   | 27018 |
| feedback-db       | 27019 |

## Production

```bash
cp docker/.env.example docker/.env.prod
# Fill in all REAL production values (PAT, ENCRYPT_KEY, managed Redis/RabbitMQ etc.)

make prod-up
make prod-logs
make prod-ps
```

In prod, only `api-gateway:8080` is externally exposed. Sit Nginx/Caddy in front of it.

## Observability (when ready)

```bash
# Wire up Prometheus scrape config first, then:
make dev-obs-up    # dev with Prometheus + Grafana
make prod-obs-up   # prod with Prometheus + Grafana
```

## K8s Migration Path

This setup is designed to migrate cleanly to Kubernetes:

| Docker Compose concept       | K8s equivalent                        |
|-----------------------------|---------------------------------------|
| service (stateless app)     | `Deployment` + `Service`              |
| service (DB)                | `StatefulSet` + `PersistentVolumeClaim` |
| `.env.prod` variables       | `Secret` + `ConfigMap`                |
| `deploy.resources`          | `resources.requests/limits` in pod spec |
| `healthcheck`               | `livenessProbe` + `readinessProbe`    |
| `depends_on`                | Init containers / readiness gates     |
| `lunecare_network`          | K8s DNS (service-name based)          |
| `restart: unless-stopped`   | `restartPolicy: Always`               |
