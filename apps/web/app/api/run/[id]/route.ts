import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    return NextResponse.json({
      id,
      status: 'completed',
      currentStep: 'open_pr',
      events: [
        { step: 'parse_bug', status: 'success', message: 'Bug report parsed', timestamp: new Date() },
        { step: 'search_code', status: 'success', message: 'Found target file', timestamp: new Date() },
        { step: 'create_branch', status: 'success', message: 'Branch created', timestamp: new Date() },
        { step: 'generate_tests', status: 'success', message: 'Tests generated', timestamp: new Date() },
        { step: 'run_tests_before', status: 'success', message: 'Tests failed as expected', timestamp: new Date() },
        { step: 'generate_patch', status: 'success', message: 'Patch generated', timestamp: new Date() },
        { step: 'validate_patch', status: 'success', message: 'Patch validated', timestamp: new Date() },
        { step: 'apply_patch', status: 'success', message: 'Patch applied', timestamp: new Date() },
        { step: 'run_tests_after', status: 'success', message: 'All tests passed ✓', timestamp: new Date() },
        { step: 'open_pr', status: 'success', message: 'PR #123 opened', timestamp: new Date() },
      ],
      pullRequest: {
        prNumber: 123,
        prUrl: 'https://github.com/sample-org/toy-repo/pull/123',
        status: 'open'
      },
      diff: `--- a/src/calculator.ts
+++ b/src/calculator.ts
@@ -14,5 +14,8 @@
 }
 
 export function divide(a: number, b: number): CalculatorResult {
+  if (b === 0) {
+    return { success: false, error: "Division by zero is not allowed" };
+  }
   return { success: true, result: a / b };
 }`,
    });
  } catch (error) {
    console.error('Error fetching pipeline run:', error);
    return NextResponse.json({ error: 'Failed to fetch pipeline run' }, { status: 500 });
  }
}
