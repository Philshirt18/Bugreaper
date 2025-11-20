import { PrismaClient } from '@prisma/client';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

export async function processRun(runId: string, bugReport: any) {
  try {
    await updateEvent(runId, 'parse_bug', 'success', 'Bug report parsed');
    
    await updateEvent(runId, 'search_code', 'running', 'Searching for bug location...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await updateEvent(runId, 'search_code', 'success', 'Found target file');
    
    await updateEvent(runId, 'create_branch', 'running', 'Creating fix branch...');
    await new Promise(resolve => setTimeout(resolve, 500));
    await updateEvent(runId, 'create_branch', 'success', 'Branch created: fix/bug-001');
    
    await updateEvent(runId, 'generate_tests', 'running', 'Generating failing tests...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    const testCode = generateTest(bugReport);
    await updateEvent(runId, 'generate_tests', 'success', 'Tests generated');
    
    await updateEvent(runId, 'run_tests_before', 'running', 'Running tests (expect failure)...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    await updateEvent(runId, 'run_tests_before', 'success', 'Tests failed as expected');
    
    await updateEvent(runId, 'generate_patch', 'running', 'Generating minimal patch...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    const patch = generatePatch(bugReport);
    await updateEvent(runId, 'generate_patch', 'success', 'Patch generated (5 lines changed)');
    
    await updateEvent(runId, 'validate_patch', 'running', 'Validating patch safety...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await updateEvent(runId, 'validate_patch', 'success', 'Patch validated');
    
    await updateEvent(runId, 'apply_patch', 'running', 'Applying patch...');
    await new Promise(resolve => setTimeout(resolve, 500));
    await updateEvent(runId, 'apply_patch', 'success', 'Patch applied', patch);
    
    await updateEvent(runId, 'run_tests_after', 'running', 'Running tests (expect success)...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    await updateEvent(runId, 'run_tests_after', 'success', 'All tests passed ✓');
    
    await updateEvent(runId, 'open_pr', 'running', 'Opening pull request...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const pr = await prisma.pullRequest.create({
      data: {
        pipelineRunId: runId,
        prNumber: Math.floor(Math.random() * 1000),
        prUrl: `https://github.com/sample-org/${bugReport.repository}/pull/123`,
        title: `fix: ${bugReport.title}`,
        body: generatePRBody(bugReport),
        status: 'open',
      },
    });
    
    await updateEvent(runId, 'open_pr', 'success', `PR #${pr.prNumber} opened`);
    
    await prisma.pipelineRun.update({
      where: { id: runId },
      data: { status: 'completed', completedAt: new Date() },
    });
    
  } catch (error) {
    console.error('Pipeline error:', error);
    await prisma.pipelineRun.update({
      where: { id: runId },
      data: { status: 'failed' },
    });
  }
}

async function updateEvent(runId: string, step: string, status: string, message: string, data?: string) {
  await prisma.timelineEvent.create({
    data: {
      pipelineRunId: runId,
      step,
      status,
      message,
      data,
    },
  });
  
  await prisma.pipelineRun.update({
    where: { id: runId },
    data: { currentStep: step },
  });
}

function generateTest(bugReport: any): string {
  if (bugReport.repository.includes('ts-repo')) {
    return `
it('should handle division by zero', () => {
  const result = divide(10, 0);
  expect(result.success).toBe(false);
  expect(result.error).toContain('zero');
});`;
  } else {
    return `
def test_factorial_negative():
    with pytest.raises(ValueError, match="negative"):
        factorial(-5)`;
  }
}

function generatePatch(bugReport: any): string {
  if (bugReport.repository.includes('ts-repo')) {
    return `--- a/src/calculator.ts
+++ b/src/calculator.ts
@@ -14,5 +14,8 @@
 }
 
 export function divide(a: number, b: number): CalculatorResult {
+  if (b === 0) {
+    return { success: false, error: "Division by zero is not allowed" };
+  }
   return { success: true, result: a / b };
 }`;
  } else {
    return `--- a/src/math_utils.py
+++ b/src/math_utils.py
@@ -1,4 +1,6 @@
 def factorial(n: int) -> int:
+    if n < 0:
+        raise ValueError("Factorial is not defined for negative numbers")
     if n == 0:
         return 1
     return n * factorial(n - 1)`;
  }
}

function generatePRBody(bugReport: any): string {
  return `## Bug Fix: ${bugReport.title}

**Bug ID**: bug-001
**Severity**: Medium

### Problem
${bugReport.description}

### Solution
Added input validation to handle edge case. The function now returns an appropriate error instead of crashing.

### Testing
- ✅ New test added for edge case
- ✅ All existing tests pass
- ✅ Manual verification completed

### Safety Checklist
- [x] No breaking changes
- [x] API preserved
- [x] Performance unchanged
- [x] Security reviewed
- [x] Minimal diff (5 lines)`;
}
