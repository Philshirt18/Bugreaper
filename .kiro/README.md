# BugReaper Kiro Configuration

This directory contains Kiro-native configuration for autonomous bug fixing.

## Directory Structure

- `specs/` - Bug specification schemas and examples
- `steering/` - Code style rules and prompt patterns for agents
- `hooks/` - Agent hook workflows for automated pipelines
- `mcp/` - Model Context Protocol tool definitions

## Specs

`specs/bug-spec.yaml` defines the structure for bug reports. Agents parse natural language bugs into this format to enable structured test generation and patching.

## Steering

Steering documents guide agent behavior:
- `steering/style.md` - Code style rules, diff constraints, safety guidelines
- `steering/prompt-patterns.md` - Reusable prompts for bug triage, test generation, patch creation

## Hooks

`hooks/pr-pipeline.json` defines the deterministic workflow:
1. Create branch
2. Generate tests
3. Run tests (expect failure)
4. Generate patch
5. Apply patch
6. Re-run tests (expect success)
7. Open PR

Hooks can be triggered manually or on events (file save, git push, etc.)

## MCP Tools

`mcp/tools.json` declares safe tool wrappers with rate limits and sandboxing:
- git operations (clone, branch, commit, push)
- GitHub API (PR creation, status checks)
- Code search (ripgrep)
- Linting/formatting (eslint, prettier)
- Test runners (pytest, vitest, jest)
- File system operations (sandboxed)
- Shell commands (allowlist only)

## Usage

Kiro automatically loads these configurations. To use in your own projects:

1. Copy `.kiro/` to your repo root
2. Customize specs for your bug types
3. Adjust steering rules for your code style
4. Modify hooks for your workflow
5. Configure MCP tools for your stack

## Important

This directory is NOT gitignored. It's part of the project and should be version controlled.
