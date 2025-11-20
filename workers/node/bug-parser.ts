import * as yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { join } from 'path';

interface BugReport {
  title: string;
  description: string;
  repository: string;
  expectedBehavior: string;
  language: string;
}

interface BugSpec {
  id: string;
  title: string;
  repository: string;
  language: string;
  severity: string;
  description: string;
  expected_behavior: string;
  target_files: string[];
  target_functions: string[];
  acceptance_criteria: string[];
  test_requirements: {
    framework: string;
    coverage_threshold: number;
    must_fail_before_fix: boolean;
  };
  safety_constraints: {
    max_lines_changed: number;
    no_breaking_changes: boolean;
    preserve_api: boolean;
  };
}

export function parseBugReportToSpec(bugReport: BugReport): BugSpec {
  // Extract key information from the bug report
  const desc = bugReport.description.toLowerCase();
  
  // Detect bug type and target
  let targetFiles: string[] = [];
  let targetFunctions: string[] = [];
  let severity = 'medium';
  let maxLines = 50;
  
  // JavaScript/HTML bugs
  if ((desc.includes('calculator') || desc.includes('equals') || desc.includes('button') || bugReport.title.toLowerCase().includes('calculator')) && 
      (desc.includes('crash') || desc.includes('error') || desc.includes('throw') || desc.includes('result') || desc.includes('press'))) {
    targetFiles = ['index.html'];
    targetFunctions = ['evaluateExpression'];
    severity = 'high';
    maxLines = 15;
  }
  // Button not working bugs
  else if ((desc.includes('button') || bugReport.title.toLowerCase().includes('button')) && 
           (desc.includes('not working') || desc.includes('doesnt react') || desc.includes("doesn't work") || desc.includes('not responding') || desc.includes('disabled'))) {
    targetFiles = ['index.html', 'app.js'];
    targetFunctions = ['button', 'submit'];
    severity = 'high';
    maxLines = 5;
  }
  // TypeScript bugs
  else if (desc.includes('divide') && desc.includes('zero')) {
    targetFiles = ['src/calculator.ts'];
    targetFunctions = ['divide'];
    severity = 'high';
    maxLines = 10;
  } else if (desc.includes('format') && desc.includes('negative')) {
    targetFiles = ['src/formatter.ts'];
    targetFunctions = ['formatNumber'];
    severity = 'medium';
    maxLines = 8;
  }
  // Python bugs
  else if (desc.includes('factorial') && (desc.includes('negative') || desc.includes('hang'))) {
    targetFiles = ['src/math_utils.py'];
    targetFunctions = ['factorial'];
    severity = 'medium';
    maxLines = 8;
  } else if (desc.includes('reverse') && desc.includes('unicode')) {
    targetFiles = ['src/string_utils.py'];
    targetFunctions = ['reverse_string'];
    severity = 'low';
    maxLines = 15;
  }
  // Default fallback
  else {
    targetFiles = [bugReport.language === 'typescript' ? 'src/calculator.ts' : 'src/math_utils.py'];
    targetFunctions = [bugReport.language === 'typescript' ? 'divide' : 'factorial'];
  }
  
  // Generate acceptance criteria from expected behavior
  const acceptanceCriteria = [
    `Fix addresses the specific issue: ${bugReport.title}`,
    `Expected behavior is achieved: ${bugReport.expectedBehavior}`,
    'All existing tests continue to pass',
    'New test covers the bug case',
    'No breaking changes to API'
  ];
  
  // Determine test framework
  const framework = bugReport.language === 'typescript' ? 'vitest' : 'pytest';
  
  const spec: BugSpec = {
    id: `bug-${Date.now()}`,
    title: bugReport.title,
    repository: bugReport.repository,
    language: bugReport.language,
    severity,
    description: bugReport.description,
    expected_behavior: bugReport.expectedBehavior,
    target_files: targetFiles,
    target_functions: targetFunctions,
    acceptance_criteria: acceptanceCriteria,
    test_requirements: {
      framework,
      coverage_threshold: 80,
      must_fail_before_fix: true
    },
    safety_constraints: {
      max_lines_changed: maxLines,
      no_breaking_changes: true,
      preserve_api: true
    }
  };
  
  return spec;
}

export function specToYAML(spec: BugSpec): string {
  return yaml.dump(spec, {
    indent: 2,
    lineWidth: 100,
    noRefs: true
  });
}

export function loadSpecSchema(): any {
  try {
    const schemaPath = join(process.cwd(), '..', '..', '.kiro', 'specs', 'bug-spec.yaml');
    const content = readFileSync(schemaPath, 'utf-8');
    return yaml.load(content);
  } catch (error) {
    console.log('Could not load spec schema:', error);
    return null;
  }
}
