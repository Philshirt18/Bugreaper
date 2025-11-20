# BugReaper MCP Tools

Model Context Protocol tool definitions for safe, rate-limited autonomous operations.

## Available Tools

### git
Git operations with safety constraints. Allows branch creation, commits, and pushes but prevents destructive operations like force push.

### github
GitHub API wrapper for PR management. Runs in mock mode by default for local testing.

### ripgrep
Fast code search for locating bugs in the codebase. Limited to toy repos by default.

### eslint
JavaScript/TypeScript linting with auto-fix enabled.

### prettier
Code formatting tool.

### pytest
Python test runner with sandboxing and timeout protection.

### npm
Node package manager for running tests and scripts. Only allows safe scripts.

### fs
Sandboxed file system operations. Prevents access to sensitive files like .env.

### shell
Sandboxed shell execution. Only allows safe read-only commands.

## Safety Features

All tools include:
- Rate limiting (per minute and per hour)
- Timeout protection
- Sandboxing where applicable
- Command allowlists/denylists
- Path restrictions

## Configuration

Edit `tools.json` to:
- Adjust rate limits
- Add/remove allowed operations
- Configure mock vs real endpoints
- Set timeout values

## Usage in Hooks

Reference tools in `.kiro/hooks/pr-pipeline.json`:

```json
{
  "tool": "git",
  "args": {
    "command": "checkout",
    "args": ["-b", "fix/bug-001"]
  }
}
```

## Mock Mode

GitHub operations default to mock mode, hitting `http://localhost:3002` instead of the real GitHub API. This enables deterministic local testing.

To use real GitHub:
1. Set `MOCK_MODE=false` in `.env`
2. Configure GitHub App credentials
3. Update `tools.json` to use real endpoint
