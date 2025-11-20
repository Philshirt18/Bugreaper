# BugReaper Prompt Patterns

Reusable prompt templates for Kiro agents working on bug triage, test generation, patch creation, and commit messages.

## Pattern 1: Bug Triage

Convert natural language bug reports into structured specs.

```
Analyze this bug report and extract structured information:

BUG REPORT:
{raw_bug_report}

REPOSITORY CONTEXT:
- Language: {detected_language}
- Framework: {detected_framework}

EXTRACT:
1. Target files (most likely location of bug)
2. Target functions (specific methods/functions affected)
3. Severity (critical/high/medium/low based on impact)
4. Expected behavior (what should happen)
5. Acceptance criteria (3-5 testable conditions)

OUTPUT FORMAT: YAML matching .kiro/specs/bug-spec.yaml schema
```

## Pattern 2: Test Generation (TypeScript)

```
Generate a failing test for this bug:

BUG SPEC: {bug_spec_yaml}
TARGET FILE: {target_file_path}
TARGET FUNCTION: {target_function_name}
TEST FRAMEWORK: vitest

REQUIREMENTS:
1. Test must fail on current code
2. Test must pass after minimal fix
3. Match existing test style exactly
4. Use describe/it blocks

OUTPUT: New test code only (no explanations)
```

## Pattern 3: Test Generation (Python)

```
Generate a failing pytest test for this bug:

BUG SPEC: {bug_spec_yaml}
TARGET FILE: {target_file_path}
TARGET FUNCTION: {target_function_name}

REQUIREMENTS:
1. Test must fail on current code
2. Use pytest conventions
3. Use pytest.raises for exceptions

OUTPUT: New test functions only
```

## Pattern 4: Minimal Patch Generation

```
Create a minimal patch to fix this bug:

BUG SPEC: {bug_spec_yaml}
FAILING TEST: {failing_test_code}
CURRENT CODE: {target_file_content}

CONSTRAINTS:
- Maximum {max_lines_changed} lines changed
- Preserve existing API
- Match existing code style exactly
- Fix only this specific bug

OUTPUT: Exact lines to change with line numbers
```

## Pattern 5: Commit Message Generation

```
Generate a commit message for this bug fix:

BUG: {bug_title}
FILES CHANGED: {changed_files}
LINES CHANGED: {lines_changed}

FORMAT:
fix({scope}): {short_description}

- {change_1}
- {change_2}

Fixes: {bug_id}
Tests: {test_names}
Lines changed: {count}
```

## Pattern 6: PR Description Generation

```
Generate a PR description for this bug fix:

BUG SPEC: {bug_spec_yaml}
CHANGES: {git_diff}

TEMPLATE:
## Bug Fix: {bug_title}

**Bug ID**: {bug_id}
**Severity**: {severity}

### Problem
{2-3_sentences}

### Solution
{2-3_sentences}

### Testing
- ✅ New test added
- ✅ All existing tests pass

### Safety Checklist
- [x] No breaking changes
- [x] Minimal diff
```
