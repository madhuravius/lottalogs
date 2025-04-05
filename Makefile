# Default target
.DEFAULT_GOAL := help

# Variables
PNPM := pnpm
DOCKER_COMPOSE := docker-compose

# Targets
.PHONY: help
help: ## Show this help message
	@echo "LottaLogs Make Targets"
	@echo "Usage: make [target]"
	@echo "Common cases to start quickly will be: \"make deps\" and \"make start\""
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-30s %s\n", $$1, $$2}'

.PHONY: install
install: ## Install dependencies
	cargo install --path .
	cd frontend && pnpm install --frozen-lockfile

.PHONY: deps
deps: ## Start dependencies for the server or workers
	$(DOCKER_COMPOSE) up -d --no-build
	make install

.PHONY: start
start: ## Start the server and workers
	cargo run start

.PHONY: server
server: ## Start the server
	cargo run --bin main

.PHONY: test
test: ## Run tests
	cargo test

.PHONY: lint
lint: ## Run linter
	cargo clippy -- -D warnings
	cd frontend && pnpm run lint

.PHONY: format
format: ## Format code
	cargo fmt
	cd frontend && pnpm run lint:fix

.PHONY: migrate
migrate: ## Run database migrations
	cargo run --bin migration
