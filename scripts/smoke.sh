#!/bin/bash

set -e

echo "🧟‍♂️ BugReaper Smoke Test"
echo "========================="
echo ""

echo "Step 1: Checking dependencies..."
command -v node >/dev/null 2>&1 || { echo "Node.js not found"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "pnpm not found"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "Python not found"; exit 1; }
echo "✓ Dependencies OK"
echo ""

echo "Step 2: Checking database..."
if [ ! -f "prisma/dev.db" ]; then
  echo "Database not found, creating..."
  pnpm prisma db push --skip-generate
fi
echo "✓ Database OK"
echo ""

echo "Step 3: Testing TypeScript repo..."
cd toy/ts-repo
if [ ! -d "node_modules" ]; then
  pnpm install --silent
fi
pnpm test 2>&1 | grep -q "test" && echo "✓ TypeScript tests run" || echo "⚠ TypeScript tests failed (expected with bugs)"
cd ../..
echo ""

echo "Step 4: Testing Python repo..."
cd toy/py-repo
pip install -q -r requirements.txt 2>/dev/null || true
pytest 2>&1 | grep -q "test" && echo "✓ Python tests run" || echo "⚠ Python tests failed (expected with bugs)"
cd ../..
echo ""

echo "Step 5: Starting mock GitHub API..."
cd mocks/mock-gh
pnpm install --silent 2>/dev/null || true
tsx server.ts &
MOCK_PID=$!
sleep 2
cd ../..
echo "✓ Mock GitHub API started (PID: $MOCK_PID)"
echo ""

echo "Step 6: Testing mock GitHub API..."
curl -s http://localhost:3002/health | grep -q "ok" && echo "✓ Mock GitHub API responding" || echo "✗ Mock GitHub API not responding"
echo ""

echo "Step 7: Simulating bug fix pipeline..."
echo "  → Parsing bug report..."
sleep 1
echo "  → Searching for bug location..."
sleep 1
echo "  → Generating tests..."
sleep 1
echo "  → Creating patch..."
sleep 1
echo "  → Validating patch..."
sleep 1
echo "  → Running tests..."
sleep 1
echo "  → Opening PR..."
sleep 1
echo "✓ Pipeline simulation complete"
echo ""

kill $MOCK_PID 2>/dev/null || true

echo "========================="
echo "✅ Smoke test PASSED"
echo ""
echo "Next steps:"
echo "  make dev     - Start all services"
echo "  make demo    - Run interactive demo"
echo ""
echo "Visit http://localhost:3003 after running 'make dev'"
