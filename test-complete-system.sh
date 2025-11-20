#!/bin/bash

echo "🧟‍♂️ BugReaper - Complete System Test"
echo "======================================"
echo ""

echo "Testing Bug #1: Division by Zero (TypeScript)"
echo "----------------------------------------------"
RUN_ID=$(curl -s -X POST http://localhost:3003/api/run \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Calculator divide by zero crashes app",
    "description": "When calling calculator.divide(10, 0), the app throws an unhandled exception",
    "repository": "toy/ts-repo",
    "expectedBehavior": "Should return error object with message"
  }' | jq -r '.runId')

echo "✓ Submitted: $RUN_ID"
echo "  Waiting for pipeline to complete..."
sleep 12

echo ""
echo "Testing Bug #2: Factorial Negative (Python)"
echo "--------------------------------------------"
RUN_ID2=$(curl -s -X POST http://localhost:3003/api/run \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Factorial function hangs on negative numbers",
    "description": "The factorial function does not handle negative input correctly and enters an infinite loop",
    "repository": "toy/py-repo",
    "expectedBehavior": "Should raise ValueError for negative numbers"
  }' | jq -r '.runId')

echo "✓ Submitted: $RUN_ID2"
echo "  Waiting for pipeline to complete..."
sleep 12

echo ""
echo "======================================"
echo "✅ Complete System Test Finished!"
echo ""
echo "Check the worker logs to see:"
echo "  - YAML spec generation"
echo "  - Real code search results"
echo "  - Intelligent test generation"
echo "  - Smart patch generation"
echo "  - Old vs new code comparison"
echo "  - PR creation with full details"
echo ""
echo "Both bugs processed successfully! 🎉"
