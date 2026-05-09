# ============================================================
# compose/Makefile — Fully containerised environment
#
# Use this when running everything in Docker — no IDE required.
# Starts: infra → databases → config-server → eureka → services → gateway
#
# Prerequisites:
#   - Docker Desktop running
#   - .env.dev present (cp ../../.env.example .env.dev and fill values)
#   - Images built: ripanbaidya/lunecare-*:1.0.0
#   - init-db.sql at project root
#   - RSA keys at secrets/keys/private_key.pem and public_key.pem
#
# Usage:
#   cd docker/docker-compose/compose
#   make up           → start everything
#   make up-services  → start only microservices (infra + db must already be up)
#   make health       → check all service health endpoints
# ============================================================

ENV_FILE      := .env.dev
COMPOSE_BASE  := docker compose --env-file $(ENV_FILE)
COMPOSE_ALL   := $(COMPOSE_BASE) -f infra.yaml -f databases.yaml -f services.yaml -f observability.yaml
COMPOSE_INFRA := $(COMPOSE_BASE) -f infra.yaml
COMPOSE_DB    := $(COMPOSE_BASE) -f infra.yaml -f databases.yaml

include ../Makefile.common

# compose-only target: start only microservices (assumes infra + db running)
up-services: ## Start microservices only (requires infra + db already running)
	$(COMPOSE_BASE) -f services.yaml up -d