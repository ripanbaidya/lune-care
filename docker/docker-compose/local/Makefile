# ============================================================
# local/Makefile — IDE development environment
#
# Use this when running microservices from IntelliJ IDEA.
# Only infra (RabbitMQ, Redis) and databases (PostgreSQL, MongoDB)
# are containerised here. Services run via Spring Boot in the IDE.
#
# Usage:
#   cd docker/docker-compose/local
#   make up-db     → start everything needed for IDE run
#   make down      → stop all containers
# ============================================================

COMPOSE_BASE  := docker compose
COMPOSE_ALL   := $(COMPOSE_BASE) -f infra.yaml -f databases.yaml
COMPOSE_INFRA := $(COMPOSE_BASE) -f infra.yaml
COMPOSE_DB    := $(COMPOSE_BASE) -f infra.yaml -f databases.yaml

include ../Makefile.common

# local-only override: no services.yaml, so up-services is not applicable
up-services:
	@echo "  ✗ 'up-services' is not available in the local environment."
	@echo "     Run microservices directly from IntelliJ using the 'dev' Spring profile."