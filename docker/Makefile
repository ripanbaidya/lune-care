# LuneCare — Docker Compose Makefile
# Run all targets from INSIDE the docker/ directory:
#   cd docker && make dev-up
#
# Or from lune-care root using -C:
#   make -C docker dev-up
#
# Workflow modes:
#   make dev-infra  → DBs + brokers only. Run Spring services via IntelliJ.
#                     Profile: SPRING_PROFILES_ACTIVE=dev  (uses localhost URLs)
#
#   make dev-up     → Full stack containerized.
#                     Profile: SPRING_PROFILES_ACTIVE=dev,docker
#                     The docker profile patches localhost → Docker service names.

SHELL := /bin/bash

# All paths relative to docker/ directory (where this Makefile lives)
COMPOSE_DIR  := docker-compose
BASE_DIR     := $(COMPOSE_DIR)/base
DEV_DIR      := $(COMPOSE_DIR)/dev
PROD_DIR     := $(COMPOSE_DIR)/prod
ENV_DEV      := .env.dev
ENV_PROD     := .env.prod

# Base file sets
BASE_FILES := \
	-f $(BASE_DIR)/infra.yml \
	-f $(BASE_DIR)/databases.yml \
	-f $(BASE_DIR)/services.yml

BASE_INFRA_ONLY := \
	-f $(BASE_DIR)/infra.yml \
	-f $(BASE_DIR)/databases.yml

DEV_OVERRIDES := \
	-f $(DEV_DIR)/infra.override.yml \
	-f $(DEV_DIR)/databases.override.yml \
	-f $(DEV_DIR)/services.override.yml

PROD_OVERRIDES := \
	-f $(PROD_DIR)/infra.override.yml \
	-f $(PROD_DIR)/databases.override.yml \
	-f $(PROD_DIR)/services.override.yml

OBSERVABILITY := \
	-f $(BASE_DIR)/observability.yml

# Compose commands
DEV_COMPOSE  := docker compose $(BASE_FILES) $(DEV_OVERRIDES) --env-file $(ENV_DEV)
PROD_COMPOSE := docker compose $(BASE_FILES) $(PROD_OVERRIDES) --env-file $(ENV_PROD)
DEV_INFRA    := docker compose $(BASE_INFRA_ONLY) -f $(DEV_DIR)/infra.override.yml -f $(DEV_DIR)/databases.override.yml --env-file $(ENV_DEV)

# DEFAULT
.DEFAULT_GOAL := help

.PHONY: help
help: ## Show this help message
	@echo ""
	@echo "  LuneCare Docker Compose — Available targets"
	@echo "  Run from docker/ directory: cd docker && make <target>"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'
	@echo ""

# DEV TARGETS

.PHONY: dev-up
dev-up: check-env-dev ## Start full dev stack — all services containerized (profile: dev,docker)
	$(DEV_COMPOSE) up -d
	@echo ""
	@echo "  ✅ Dev stack started. Access points:"
	@echo "     API Gateway   → http://localhost:8080"
	@echo "     Eureka UI     → http://localhost:8761"
	@echo "     Config Server → http://localhost:8888"
	@echo "     RabbitMQ UI   → http://localhost:15672"
	@echo ""
	@echo "  ℹ️  Profile: SPRING_PROFILES_ACTIVE=dev,docker"
	@echo ""

.PHONY: dev-infra
dev-infra: check-env-dev ## Start infra + DBs only — run Spring services via IDE (profile: dev)
	$(DEV_INFRA) up -d
	@echo ""
	@echo "  ✅ Infra ready. Connect your services locally (SPRING_PROFILES_ACTIVE=dev):"
	@echo "     RabbitMQ  → localhost:5672  (UI: localhost:15672)"
	@echo "     Redis     → localhost:6379"
	@echo "     auth-db   → localhost:5433"
	@echo "     patient   → localhost:5434"
	@echo "     doctor    → localhost:5435"
	@echo "     appt      → localhost:5436"
	@echo "     payment   → localhost:5437"
	@echo "     notif-db  → localhost:27018"
	@echo "     feedback  → localhost:27019"
	@echo ""

.PHONY: dev-down
dev-down: ## Stop and remove all dev containers (keeps volumes)
	$(DEV_COMPOSE) down

.PHONY: dev-destroy
dev-destroy: ## Stop dev containers AND delete all volumes (full reset)
	$(DEV_COMPOSE) down -v
	@echo "  ⚠️  All dev volumes deleted. Databases are empty."

.PHONY: dev-restart
dev-restart: ## Restart all dev containers
	$(DEV_COMPOSE) restart

.PHONY: dev-logs
dev-logs: ## Tail logs from all dev services
	$(DEV_COMPOSE) logs -f

.PHONY: dev-ps
dev-ps: ## Show running status of all dev containers
	$(DEV_COMPOSE) ps

.PHONY: dev-status
dev-status: ## Show health status of all lunecare containers
	@echo ""
	@echo "  LuneCare Dev — Container Health"
	@echo ""
	@docker ps --filter "name=lunecare" \
		--format "  {{.Names}}\t{{.Status}}" | column -t
	@echo ""

.PHONY: dev-pull
dev-pull: ## Pull latest images for dev stack
	$(DEV_COMPOSE) pull

# PROD TARGETS

.PHONY: prod-up
prod-up: check-env-prod ## Start full prod stack
	$(PROD_COMPOSE) up -d
	@echo ""
	@echo "  ✅ Prod stack started."
	@echo "     API Gateway → http://localhost:8080"
	@echo ""

.PHONY: prod-down
prod-down: ## Stop prod containers (keeps volumes)
	$(PROD_COMPOSE) down

.PHONY: prod-destroy
prod-destroy: ## ⚠️  DANGER: Stop prod containers AND delete all volumes
	@echo "  ⚠️  WARNING: This will delete ALL production data volumes."
	@read -p "  Type 'yes-delete-prod' to confirm: " confirm; \
	if [ "$$confirm" = "yes-delete-prod" ]; then \
		$(PROD_COMPOSE) down -v; \
		echo "  Volumes deleted."; \
	else \
		echo "  Aborted."; \
	fi

.PHONY: prod-logs
prod-logs: ## Tail logs from all prod services
	$(PROD_COMPOSE) logs -f

.PHONY: prod-ps
prod-ps: ## Show status of all prod containers
	$(PROD_COMPOSE) ps

.PHONY: prod-pull
prod-pull: ## Pull latest images for prod stack
	$(PROD_COMPOSE) pull

# OBSERVABILITY

.PHONY: dev-obs-up
dev-obs-up: check-env-dev ## Start dev stack + Prometheus + Grafana
	docker compose $(BASE_FILES) $(DEV_OVERRIDES) $(OBSERVABILITY) --env-file $(ENV_DEV) up -d
	@echo ""
	@echo "  ✅ Observability stack started."
	@echo "     Prometheus → http://localhost:9090"
	@echo "     Grafana    → http://localhost:3000  (admin/admin)"
	@echo ""

.PHONY: prod-obs-up
prod-obs-up: check-env-prod ## Start prod stack + Prometheus + Grafana
	docker compose $(BASE_FILES) $(PROD_OVERRIDES) $(OBSERVABILITY) --env-file $(ENV_PROD) up -d

# SELECTIVE SERVICE TARGETS

.PHONY: dev-restart-service
dev-restart-service: ## Restart a specific service: make dev-restart-service s=auth-service
	$(DEV_COMPOSE) restart $(s)

.PHONY: dev-logs-service
dev-logs-service: ## Tail logs from a specific service: make dev-logs-service s=auth-service
	$(DEV_COMPOSE) logs -f $(s)

.PHONY: prod-restart-service
prod-restart-service: ## Restart a specific prod service: make prod-restart-service s=auth-service
	$(PROD_COMPOSE) restart $(s)

# BUILD
# Run these from lune-care root (parent pom.xml location), not from docker/

.PHONY: build
build: ## Build all service images locally via Maven Jib (run from lune-care root)
	@echo "  Building all service images with Jib (local Docker daemon)..."
	@cd .. && mvn clean package jib:dockerBuild -DskipTests
	@echo "  ✅ All images built locally."

.PHONY: build-push
build-push: ## Build and push all images to DockerHub (run from lune-care root)
	@echo "  Building and pushing all service images..."
	@cd .. && mvn clean package jib:build -DskipTests
	@echo "  ✅ All images pushed to DockerHub."

.PHONY: build-service
build-service: ## Build single service locally: make build-service s=auth
	@cd ../services/$(s) && mvn clean package jib:dockerBuild -DskipTests
	@echo "  ✅ $(s) image built locally."

# GUARD CHECKS

.PHONY: check-env-dev
check-env-dev:
	@if [ ! -f $(ENV_DEV) ]; then \
		echo "  ❌ $(ENV_DEV) not found in docker/ directory."; \
		echo "     Copy docker/.env.example → docker/.env.dev and fill in values."; \
		exit 1; \
	fi
	@if ! grep -q "^ENCRYPT_KEY=" $(ENV_DEV) 2>/dev/null; then \
		echo "  ❌ ENCRYPT_KEY not found in $(ENV_DEV)."; \
		exit 1; \
	fi
	@if grep -q "^ENCRYPT_KEY=$$" $(ENV_DEV) 2>/dev/null; then \
		echo "  ❌ ENCRYPT_KEY is empty in $(ENV_DEV)."; \
		exit 1; \
	fi

.PHONY: check-env-prod
check-env-prod:
	@if [ ! -f $(ENV_PROD) ]; then \
		echo "  ❌ $(ENV_PROD) not found in docker/ directory."; \
		echo "     Copy docker/.env.example → docker/.env.prod and fill in values."; \
		exit 1; \
	fi
	@if grep -q "YOUR_PERSONAL_ACCESS_TOKEN_HERE" $(ENV_PROD) 2>/dev/null; then \
		echo "  ❌ GIT_PASSWORD (GitHub PAT) not set in $(ENV_PROD)."; \
		exit 1; \
	fi
	@if grep -q "your_prod_encrypt_key_here" $(ENV_PROD) 2>/dev/null; then \
		echo "  ❌ ENCRYPT_KEY not set in $(ENV_PROD)."; \
		exit 1; \
	fi