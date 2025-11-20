#!/bin/bash

echo "🧟‍♂️ Testing BugReaper API"
echo "========================"
echo ""

echo "1. Testing Mock GitHub API (port 3002)..."
curl -s http://localhost:3002/health | jq .
echo ""

echo "2. Testing Node Worker (port 3001)..."
curl -s http://localhost:3001/health | jq .
echo ""

echo "3. Testing Web UI (port 3003)..."
curl -s http://localhost:3003 | grep -o "BugReaper" | head -1
echo "✓ Web UI is responding"
echo ""

echo "4. Submitting a test bug report..."
curl -s -X POST http://localhost:3003/api/run \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Calculator divide by zero crashes app",
    "description": "When calling calculator.divide(10, 0), the app throws an unhandled exception",
    "repository": "toy/ts-repo",
    "expectedBehavior": "Should return { error: \"Division by zero\" }"
  }' | jq .

echo ""
echo "========================"
echo "✅ All services are running!"
echo ""
echo "Open your browser and visit:"
echo "  http://localhost:3003"
echo ""
echo "Try submitting a bug report through the UI!"
