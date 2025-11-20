# BugReaper Code Style & Editing Guidelines

This steering document defines code style rules and editing constraints for BugReaper agents. All autonomous code modifications must follow these guidelines.

## Core Principles

1. **Minimal Diffs Only**: Change only what's necessary to fix the bug. No refactoring, no style improvements, no "while we're here" changes.

2. **Preserve Existing Style**: Match the existing code style exactly. Don't impose your preferences.

3. **Safety First**: Never introduce security vulnerabilities, breaking changes, or performance regressions.

4. **Test-Driven**: Always write failing tests before writing fixes.

## Language-Specific Style

### TypeScript
- Use existing indentation (2 or 4 spaces, match the file)
- Prefer explicit return types on public functions
- Use `const` over `let` when possible
- Match existing import style (named vs default)
- Preserve existing error handling patterns (throw vs return)

### Python
- Follow PEP 8 for new code
- Match existing indentation (spaces, not tabs)
- Preserve existing type hints style
- Use existing exception types
- Match existing docstring format (Google, NumPy, or none)

## Diff Constraints

### Maximum Changes
- **Critical bugs**: Max 10 lines changed
- **High severity**: Max 25 lines changed
- **Medium severity**: Max 50 lines changed
- **Low severity**: Max 100 lines changed

### Forbidden Changes
- No whitespace-only changes
- No comment additions (except required docstrings)
- No variable renaming
- No import reordering
- No formatting changes outside the fix
- No dependency version bumps
- No configuration file changes (unless that's the bug)

### Required Changes
- Add input validation if missing and relevant to bug
- Add error handling if bug involves crashes
- Update related tests to match new behavior
- Add new test for the specific bug case

## Error Handling Patterns

### TypeScript
Prefer returning error objects over throwing:

```typescript
// Good
function divide(a: number, b: number): { success: boolean; result?: number; error?: string } {
  if (b === 0) {
    return { success: false, error: "Division by zero" };
  }
  return { success: true, result: a / b };
}

// Avoid (unless existing code throws)
function divide(a: number, b: number): number {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}
```

### Python
Use appropriate exception types:

```python
# Good
def factorial(n: int) -> int:
    if n < 0:
        raise ValueError("Factorial not defined for negative numbers")
    if n == 0:
        return 1
    return n * factorial(n - 1)

# Avoid generic exceptions
def factorial(n: int) -> int:
    if n < 0:
        raise Exception("Bad input")  # Too generic
```

## Test Style

### Test Naming
- TypeScript: `describe('functionName', () => { it('should handle edge case', ...) })`
- Python: `def test_function_name_edge_case():`

### Test Structure
1. Arrange: Set up test data
2. Act: Call the function
3. Assert: Verify behavior

### Test Coverage
- Always test the specific bug case
- Test one edge case before the bug value
- Test one edge case after the bug value
- Test the happy path still works

## Commit Message Format

```
fix(scope): short description of bug fix

- Add validation for edge case X
- Return error instead of throwing
- Preserve existing behavior for valid inputs

Fixes: bug-ts-001
Tests: Added test_edge_case_x
Lines changed: 8
```

## PR Description Template

```markdown
## Bug Fix: [Bug Title]

**Bug ID**: bug-xxx-001
**Severity**: High
**Files Changed**: 1

### Problem
[2-3 sentence description of the bug]

### Solution
[2-3 sentence description of the fix]

### Testing
- ✅ New test added: `test_specific_bug_case`
- ✅ All existing tests pass
- ✅ Manual verification: [describe]

### Safety Checklist
- [x] No breaking changes
- [x] API preserved
- [x] Performance unchanged
- [x] Security reviewed
- [x] Minimal diff (8 lines)
```

## Validation Rules

Before committing any fix, verify:

1. **Tests fail before fix**: Run tests on original code, confirm failure
2. **Tests pass after fix**: Run tests on patched code, confirm success
3. **No regressions**: All existing tests still pass
4. **Minimal diff**: Count changed lines, ensure under limit
5. **Style match**: Diff should look like original author wrote it
6. **No side effects**: Function signature unchanged (unless explicitly allowed)

## Fallback Strategies

If a fix attempt fails:

1. **First retry**: Reduce scope, fix only the immediate crash
2. **Second retry**: Add defensive check without changing logic
3. **Third retry**: Flag for human review with detailed analysis
4. **Never**: Commit a fix that doesn't pass tests
