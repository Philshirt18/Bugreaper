#!/bin/bash

echo "🧟‍♂️ BugReaper Quick Test"
echo "======================="
echo ""

echo "Testing TypeScript toy repo..."
cd toy/ts-repo
export PNPM_HOME="/Users/work/Library/pnpm"
export PATH="$PNPM_HOME:$PATH"
pnpm install --silent 2>/dev/null || true
echo ""
echo "Running tests (these should show the bugs):"
pnpm test || echo "Tests failed - bugs are present as expected!"
cd ../..
echo ""

echo "Testing Python toy repo..."
cd toy/py-repo
pip install -q -r requirements.txt 2>/dev/null || true
echo ""
echo "Running tests (these should show the bugs):"
pytest -v || echo "Tests failed - bugs are present as expected!"
cd ../..
echo ""

echo "======================="
echo "✅ Quick test complete!"
echo ""
echo "The bugs are:"
echo "  TypeScript: divide(10, 0) crashes instead of returning error"
echo "  Python: factorial(-5) hangs instead of raising ValueError"
echo ""
echo "To see the full pipeline in action:"
echo "  1. Run: make dev"
echo "  2. Visit: http://localhost:3003"
echo "  3. Submit a bug report through the UI"
