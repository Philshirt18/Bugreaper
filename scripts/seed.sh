#!/bin/bash

set -e

echo "Seeding toy repositories with bugs..."

echo "Initializing git repos..."
cd toy/ts-repo
git init 2>/dev/null || true
git add . 2>/dev/null || true
git commit -m "Initial commit with bugs" 2>/dev/null || true
cd ../..

cd toy/py-repo
git init 2>/dev/null || true
git add . 2>/dev/null || true
git commit -m "Initial commit with bugs" 2>/dev/null || true
cd ../..

echo "Installing TypeScript repo dependencies..."
cd toy/ts-repo
pnpm install --silent
cd ../..

echo "Installing Python repo dependencies..."
cd toy/py-repo
pip install -q -r requirements.txt
cd ../..

echo "Seed complete!"
echo ""
echo "Toy repos ready with seeded bugs:"
echo "  - toy/ts-repo: Division by zero, negative number formatting"
echo "  - toy/py-repo: Factorial negative numbers, unicode string reversal"
