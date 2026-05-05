# ============================================================
# Docker Compose Local Environment
# Usage: make <target>
# All commands run from: docker/docker-compose/local/
# ============================================================

COMPOSE_BASE  := docker compose
COMPOSE_ALL   := $(COMPOSE_BASE) -f infra.yaml -f databases.yaml
COMPOSE_INFRA := $(COMPOSE_BASE) -f infra.yaml
COMPOSE_DB    := $(COMPOSE_BASE) -f infra.yaml -f databases.yaml

# ============================================================
# DEFAULT
# ============================================================

.DEFAULT_GOAL := help

help: ## Show all available commands
	@echo ""
	@echo "  LuneCare Docker Local — Available Commands"
	@echo "  ─────────────────────────────────────────"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""

# ============================================================
# CORE — Start / Stop / Restart
# ============================================================

up: ## Start all services (infra + databases + services)
	$(COMPOSE_ALL) up -d

down: ## Stop and remove all containers (keeps volumes)
	$(COMPOSE_ALL) down

down-v: ## Stop and remove all containers (remove volume)
	$(COMPOSE_ALL) down -v

restart: ## Restart all containers
	$(COMPOSE_ALL) restart

rebuild: ## Pull latest images and recreate containers
	$(COMPOSE_ALL) pull
	$(COMPOSE_ALL) up -d --force-recreate

# ============================================================
# SELECTIVE — Start specific layers
# ============================================================

up-infra: ## Start infra only (RabbitMQ + Redis)
	$(COMPOSE_INFRA) up -d

up-db: ## Start infra + databases (PostgreSQL + MongoDB)
	$(COMPOSE_DB) up -d

up-services: ## Start microservices only (assumes infra + db already running)
	$(COMPOSE_BASE) -f services.yaml up -d

# ============================================================
# CLEANUP
# ============================================================

clean: ## Stop all containers and remove volumes (full reset)
	$(COMPOSE_ALL) down -v
	@echo "  ✓ All containers and volumes removed"

clean-images: ## Remove all lunecare images
	docker images --format '{{.Repository}}:{{.Tag}}' | grep 'lunecare' | xargs -r docker rmi -f
	@echo "  ✓ All lunecare images removed"

prune: ## Docker system prune (removes unused containers, networks, images)
	docker system prune -f
	@echo "  ✓ Docker system pruned"

# ============================================================
# LOGS
# ============================================================

logs: ## Tail logs for all services
	$(COMPOSE_ALL) logs -f --tail=50

logs-errors: ## Show only ERROR/EXCEPTION lines across all services
	$(COMPOSE_ALL) logs --no-log-prefix 2>&1 | grep -iE "error|exception|failed" | grep -v DEBUG

logs-config: ## Tail config-server logs
	docker logs lunecare-config-server -f --tail=50

logs-eureka: ## Tail eureka-server logs
	docker logs lunecare-eureka-server -f --tail=50

logs-gateway: ## Tail api-gateway logs
	docker logs lunecare-api-gateway -f --tail=50

logs-auth: ## Tail auth service logs
	docker logs lunecare-auth -f --tail=50

logs-patient: ## Tail patient service logs
	docker logs lunecare-patient -f --tail=50

logs-doctor: ## Tail doctor service logs
	docker logs lunecare-doctor -f --tail=50

logs-appointment: ## Tail appointment service logs
	docker logs lunecare-appointment -f --tail=50

logs-payment: ## Tail payment service logs
	docker logs lunecare-payment -f --tail=50

logs-notification: ## Tail notification service logs
	docker logs lunecare-notification -f --tail=50

logs-feedback: ## Tail feedback service logs
	docker logs lunecare-feedback -f --tail=50

# ============================================================
# STATUS
# ============================================================

ps: ## Show running containers with ports and status
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

health: ## Check actuator/health for all services from host
	@echo ""
	@echo "  Checking service health..."
	@echo "  ─────────────────────────────────────────"
	@for entry in "config-server:8888" "eureka-server:8761" "auth:8081" "patient:8082" "doctor:8083" "appointment:8084" "payment:8085" "notification:8086" "feedback:8087" "admin:8088" "api-gateway:8080"; do \
		name=$$(echo $$entry | cut -d: -f1); \
		port=$$(echo $$entry | cut -d: -f2); \
		status=$$(curl -sf http://localhost:$$port/actuator/health 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('status','?'))" 2>/dev/null || echo "UNREACHABLE"); \
		if [ "$$status" = "UP" ]; then \
			printf "  \033[32m✓\033[0m %-20s %s\n" "$$name" "$$status"; \
		else \
			printf "  \033[31m✗\033[0m %-20s %s\n" "$$name" "$$status"; \
		fi \
	done
	@echo ""

# ============================================================
# DATABASE UTILS
# ============================================================

db-schemas: ## List all schemas in PostgreSQL
	docker exec -it lunecare-postgres psql -U postgres -d lunecare -c "\dn"

db-connect: ## Open PostgreSQL interactive shell
	docker exec -it lunecare-postgres psql -U postgres -d lunecare

mongo-connect: ## Open MongoDB interactive shell
	docker exec -it lunecare-mongodb mongosh -u mongouser -p mongopass --authenticationDatabase admin

mongo-dbs: ## List all MongoDB databases
	docker exec -it lunecare-mongodb mongosh -u mongouser -p mongopass \
		--authenticationDatabase admin --eval "show dbs"

# ============================================================
# CONFIG SERVER UTILS
# ============================================================

config-check: ## Verify config-server is serving configs (tests appointment/dev,docker)
	@echo "  Testing config-server..."
	@curl -sf http://localhost:8888/appointment/dev,docker | python3 -m json.tool || echo "  ✗ Config server not reachable"

config-refresh: ## Trigger Spring Cloud Bus refresh across all services
	@echo "  Triggering bus refresh..."
	@curl -sf -X POST http://localhost:8888/actuator/busrefresh
	@echo "  ✓ Refresh triggered"

# ============================================================
# INTER-CONTAINER CONNECTIVITY TEST
# ============================================================

test-network: ## Test inter-container DNS resolution from api-gateway
	@echo ""
	@echo "  Testing container-to-container connectivity from api-gateway..."
	@echo "  ─────────────────────────────────────────"
	@for entry in "auth:8081" "patient:8082" "doctor:8083" "appointment:8084" "payment:8085" "notification:8086" "feedback:8087"; do \
		name=$$(echo $$entry | cut -d: -f1); \
		port=$$(echo $$entry | cut -d: -f2); \
		status=$$(docker exec lunecare-api-gateway curl -sf http://$$name:$$port/actuator/health 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('status','?'))" 2>/dev/null || echo "UNREACHABLE"); \
		if [ "$$status" = "UP" ]; then \
			printf "  \033[32m✓\033[0m %-20s %s\n" "$$name" "$$status"; \
		else \
			printf "  \033[31m✗\033[0m %-20s %s\n" "$$name" "$$status"; \
		fi \
	done
	@echo ""

.PHONY: help up down restart rebuild \
        up-infra up-db up-services \
        clean clean-images prune \
        logs logs-errors logs-config logs-eureka logs-gateway \
        logs-auth logs-patient logs-doctor logs-appointment \
        logs-payment logs-notification logs-feedback \
        ps health \
        db-schemas db-connect mongo-connect mongo-dbs \
        config-check config-refresh \
        test-network
