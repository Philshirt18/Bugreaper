#!/bin/bash

set -e

echo "🧟‍♂️ BugReaper Demo"
echo "=================="
echo ""

echo "Starting services..."
make dev &
SERVICES_PID=$!

sleep 5

echo ""
echo "Submitting bug report..."
curl -X POST http://localhost:3003/api/run \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Calculator divide by zero crashes app",
    "description": "When calling calculator.divide(10, 0), the app throws an unhandled exception",
    "repository": "toy/ts-repo",
    "expectedBehavior": "Should return { error: \"Division by zero\" }"
  }' | jq .

echo ""
echo "Demo complete! Visit http://localhost:3003 to see the UI"
echo "Press Ctrl+C to stop services"

wait $SERVICES_PID
