#!/bin/bash

set -e

echo "Resetting BugReaper state..."

echo "Cleaning database..."
rm -f prisma/dev.db prisma/dev.db-journal

echo "Resetting git repos..."
cd toy/ts-repo
rm -rf .git
cd ../..

cd toy/py-repo
rm -rf .git
cd ../..

echo "Clearing mock GitHub data..."
echo '{"pulls":[],"checks":[]}' > mocks/mock-gh/db.json

echo "Recreating database..."
pnpm prisma db push --skip-generate

echo "Reset complete!"
