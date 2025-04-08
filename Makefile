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
start: ## Start the backend server
	cargo watch --ignore "frontend" -x check -s 'cargo run start'

.PHONY: start-frontend
start-frontend: ## Start the frontend
	cd frontend && pnpm run dev

.PHONY: test
test: ## Run tests
	cargo llvm-cov --all-features

.PHONY: lint
lint: ## Run linter
	cargo fmt --all -- --check
	cargo clippy --all-features -- -D warnings -W clippy::pedantic -W clippy::nursery -W rust-2018-idioms
	cd frontend && pnpm run lint

.PHONY: format
format: ## Format code
	cargo fmt --all
	cd frontend && pnpm run lint:fix

.PHONY: migrate
migrate: ## Run database migrations
	cargo run --bin migration
