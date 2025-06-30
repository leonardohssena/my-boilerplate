# Default environment is set to development
ENV ?= development

# Paths to important files
PRISMA_SCHEMA = ./prisma/schema.prisma
PACKAGE_JSON = package.json

# Path variables for better readability
PNPM = pnpm
PRISMA = npx prisma

# Help function to list all available commands
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make dev             - Start the app in development mode"
	@echo "  make start           - Start the app in production mode"
	@echo "  make test            - Run unit and integration tests"
	@echo "  make prisma-update   - Generate and Update Prisma client (ORM)"
	@echo "  make prisma-studio   - Open Prisma Studio to view and manage the database"
	@echo "  make update-libs     - Update project dependencies"
	@echo "  make check-libs      - Check project dependencies"
	@echo "  make format          - Format the code using Prettier"
	@echo "  make lint            - Run ESLint to check code quality"
	@echo "  make clean           - Clean up temporary files and caches"

# Start the application in development mode (watch mode)
.PHONY: dev
dev:
	@echo "Starting the application in development mode..."
	$(PNPM) start:dev

# Start the application in production mode
.PHONY: start
start:
	@echo "Starting the application in production mode..."
	$(PNPM) start

# Run the tests
.PHONY: test
test:
	@echo "Running unit and integration tests..."
	$(PNPM) test

# Run ESLint to check code quality
.PHONY: lint
lint:
	@echo "Running ESLint..."
	$(PNPM) lint

# Format the code using Prettier
.PHONY: format
format:
	@echo "Formatting code with Prettier..."
	$(PNPM) format

# Prisma-related commands

# Update Prisma client after schema changes
.PHONY: prisma-update
prisma-update:
	@echo "Generating Prisma client..."
	$(PRISMA) generate --schema $(PRISMA_SCHEMA)
	@echo "Updating Prisma client..."
	$(PRISMA) db push

# Open Prisma Studio to visually interact with the database
.PHONY: prisma-studio
prisma-studio:
	@echo "Opening Prisma Studio..."
	$(PRISMA) studio --schema $(PRISMA_SCHEMA)

# Update project dependencies (using pnpm)
.PHONY: update-libs
update-libs:
	@echo "Updating project dependencies..."
	ncu -u
	$(PNPM) install

# Check project dependencies
.PHONY: check-libs
check-libs:
	@echo "Checking project dependencies..."
	depcheck


# Clean up temporary files and caches
.PHONY: clean
clean:
	@echo "Cleaning up caches and temporary files..."
	rm -rf node_modules dist .cache .next
	$(PNPM) store prune
	$(PNPM) cache clean --force
