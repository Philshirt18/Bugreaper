.PHONY: help setup dev test seed smoke reset clean

help:
	@echo "NecroMerge - Bug fixing automation"
	@echo ""
	@echo "Available commands:"
	@echo "  make setup    - Install dependencies and initialize database"
	@echo "  make dev      - Start all services in development mode"
	@echo "  make test     - Run all tests"
	@echo "  make seed     - Seed toy repos with bugs"
	@echo "  make smoke    - Run end-to-end smoke test"
	@echo "  make reset    - Clean state and reseed"
	@echo "  make clean    - Remove all generated files"

setup:
	@echo "Installing dependencies..."
	pnpm install
	@echo "Generating Prisma client..."
	pnpm prisma generate
	@echo "Pushing database schema..."
	pnpm prisma db push
	@echo "Seeding toy repos..."
	bash scripts/seed.sh
	@echo "Setup complete!"

dev:
	@echo "Starting all services..."
	pnpm --filter web dev & \
	pnpm --filter node-worker dev & \
	pnpm --filter mock-gh dev & \
	wait

test:
	@echo "Running all tests..."
	pnpm --filter toy-ts test
	pnpm --filter toy-py test
	pnpm --filter web test
	pnpm --filter node-worker test

seed:
	@echo "Seeding toy repos..."
	bash scripts/seed.sh

smoke:
	@echo "Running smoke test..."
	bash scripts/smoke.sh

reset:
	@echo "Resetting state..."
	bash scripts/reset.sh
	bash scripts/seed.sh

clean:
	@echo "Cleaning generated files..."
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf workers/*/node_modules
	rm -rf packages/*/node_modules
	rm -rf mocks/*/node_modules
	rm -rf toy/*/node_modules
	rm -f prisma/dev.db
	rm -f prisma/dev.db-journal
	@echo "Clean complete!"
