# BugReaper Quick Start Guide

## Prerequisites Check

```bash
node --version    # Should be 18+
python3 --version # Should be 3.9+
pnpm --version    # Should be 8+
```

If you don't have pnpm:
```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.zshrc
```

## Installation (One-Time Setup)

```bash
# 1. Install dependencies
pnpm install

# 2. Add Prisma (if not already added)
pnpm add -Dw prisma @prisma/client

# 3. Generate Prisma client
pnpm prisma generate

# 4. Create database
pnpm prisma db push

# 5. Seed toy repos
bash scripts/seed.sh
```

## Quick Test (No Services Required)

```bash
bash scripts/quick-test.sh
```

This will run the tests in both toy repos and show you the seeded bugs.

## Full Demo (With UI)

### Option 1: Using Make (Recommended)

```bash
make dev
```

Then visit http://localhost:3003

### Option 2: Manual Start

Open 3 terminal windows:

**Terminal 1 - Web UI:**
```bash
cd apps/web
pnpm install
pnpm dev
```

**Terminal 2 - Node Worker:**
```bash
cd workers/node
pnpm install
pnpm dev
```

**Terminal 3 - Mock GitHub API:**
```bash
cd mocks/mock-gh
pnpm install
pnpm dev
```

Then visit http://localhost:3003

## Using the UI

1. Visit http://localhost:3003
2. Fill in the bug report form:
   - **Title**: "Calculator divide by zero crashes app"
   - **Repository**: Select "toy/ts-repo"
   - **Description**: "When calling calculator.divide(10, 0), the app throws an unhandled exception"
   - **Expected Behavior**: "Should return { error: 'Division by zero' }"
3. Click "Start Pipeline"
4. Watch the timeline as it:
   - Parses the bug
   - Searches for the bug location
   - Generates tests
   - Creates a patch
   - Validates the patch
   - Runs tests
   - Opens a PR
5. View the code diff at the bottom

## Testing Individual Components

### Test TypeScript Repo
```bash
cd toy/ts-repo
pnpm install
pnpm test
```

### Test Python Repo
```bash
cd toy/py-repo
pip install -r requirements.txt
pytest -v
```

### Test Mock GitHub API
```bash
cd mocks/mock-gh
pnpm install
pnpm dev
# In another terminal:
curl http://localhost:3002/health
```

## Smoke Test

Run the full smoke test:
```bash
bash scripts/smoke.sh
```

## Troubleshooting

### "pnpm: command not found"
```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.zshrc
```

### "prisma: command not found"
```bash
pnpm add -Dw prisma @prisma/client
pnpm prisma generate
```

### "Port already in use"
Kill existing processes:
```bash
lsof -ti:3003 | xargs kill -9  # Web UI
lsof -ti:3001 | xargs kill -9  # Worker
lsof -ti:3002 | xargs kill -9  # Mock GitHub
```

### Database issues
```bash
rm -f prisma/dev.db prisma/dev.db-journal
pnpm prisma db push
```

## Project Structure

```
BugReaper/
├── .kiro/              # Kiro configuration (specs, steering, hooks, MCP)
├── apps/web/           # Next.js UI (port 3003)
├── workers/node/       # Orchestrator (port 3001)
├── workers/python/     # Python utilities
├── packages/agents/    # MCP tool wrappers
├── mocks/mock-gh/      # Mock GitHub API (port 3002)
├── toy/ts-repo/        # TypeScript test repo with bugs
├── toy/py-repo/        # Python test repo with bugs
├── prisma/             # Database schema
└── scripts/            # Helper scripts
```

## Kiro Features Demonstrated

1. **Spec-Driven Development**: `.kiro/specs/bug-spec.yaml`
2. **Steering Documents**: `.kiro/steering/style.md` and `prompt-patterns.md`
3. **Agent Hooks**: `.kiro/hooks/pr-pipeline.json`
4. **MCP Tools**: `.kiro/mcp/tools.json`

## Next Steps

- Modify `.kiro/specs/bug-spec.yaml` to add your own bug types
- Customize `.kiro/steering/style.md` for your code style
- Add more steps to `.kiro/hooks/pr-pipeline.json`
- Configure real GitHub in `.env` (set MOCK_MODE=false)

## License

MIT - See LICENSE file
