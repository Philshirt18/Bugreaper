import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import { join } from 'path';
import { detectLanguage } from './languages/detect';
import { applyFix } from './languages/fixers';

export interface FixPipelineOptions {
  rootPath: string;
  issueId: string;
  file: string;
  description: string;
  expected: string;
  dryRun?: boolean;
}

export interface FixPipelineResult {
  success: boolean;
  appliedDiff?: string;
  error?: string;
  checksRun: string[];
  checksPassed: boolean;
  rollbackAvailable: boolean;
  backupPath?: string;
}

export async function runFixPipeline(options: FixPipelineOptions): Promise<FixPipelineResult> {
  const checksRun: string[] = [];
  let backupPath: string | undefined;

  try {
    // Step 1: Read original file
    const filePath = join(options.rootPath, options.file);
    const originalContent = readFileSync(filePath, 'utf-8');
    checksRun.push('read-file');

    // Step 2: Detect language
    const language = detectLanguage(filePath);
    checksRun.push('detect-language');

    if (language === 'unknown') {
      return {
        success: false,
        error: 'Unsupported file type',
        checksRun,
        checksPassed: false,
        rollbackAvailable: false
      };
    }

    // Step 3: Create backup
    backupPath = `${filePath}.backup`;
    copyFileSync(filePath, backupPath);
    checksRun.push('create-backup');

    // Step 4: Apply fix
    console.log(`    Attempting to fix: ${options.description}`);
    const fixResult = await applyFix(originalContent, language, options.description, options.expected, options.filePath);
    
    if (!fixResult) {
      console.log(`    No fixer matched for language: ${language}, description: ${options.description}`);
      return {
        success: false,
        error: `No applicable fix found for ${language} issue: ${options.description}`,
        checksRun,
        checksPassed: false,
        rollbackAvailable: true,
        backupPath
      };
    }
    
    console.log(`    Fix applied: ${fixResult.explanation}`);

    checksRun.push('apply-fix');

    // Step 5: Generate diff
    const diff = generateDiff(originalContent, fixResult.fixed);
    checksRun.push('generate-diff');

    // Step 6: Write fixed content (if not dry run)
    if (!options.dryRun) {
      writeFileSync(filePath, fixResult.fixed, 'utf-8');
      checksRun.push('write-file');
    }

    // Step 7: Verify fix
    const verifyResult = await verifyFix(filePath, language);
    checksRun.push('verify-fix');

    return {
      success: true,
      appliedDiff: diff,
      checksRun,
      checksPassed: verifyResult.passed,
      rollbackAvailable: true,
      backupPath
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      checksRun,
      checksPassed: false,
      rollbackAvailable: !!backupPath,
      backupPath
    };
  }
}

export async function rollbackFix(filePath: string, backupPath: string): Promise<boolean> {
  try {
    copyFileSync(backupPath, filePath);
    return true;
  } catch (error) {
    console.error('Rollback failed:', error);
    return false;
  }
}

function generateDiff(original: string, fixed: string): string {
  const originalLines = original.split('\n');
  const fixedLines = fixed.split('\n');

  let diff = '--- original\n+++ fixed\n';
  diff += `@@ -1,${originalLines.length} +1,${fixedLines.length} @@\n`;

  const maxLines = Math.max(originalLines.length, fixedLines.length);
  
  for (let i = 0; i < maxLines; i++) {
    const origLine = originalLines[i];
    const fixedLine = fixedLines[i];

    if (origLine !== fixedLine) {
      if (origLine !== undefined) {
        diff += `-${origLine}\n`;
      }
      if (fixedLine !== undefined) {
        diff += `+${fixedLine}\n`;
      }
    } else if (origLine !== undefined) {
      diff += ` ${origLine}\n`;
    }
  }

  return diff;
}

async function verifyFix(filePath: string, language: string): Promise<{ passed: boolean; errors: string[] }> {
  const errors: string[] = [];

  try {
    // Basic syntax check - try to read the file
    const content = readFileSync(filePath, 'utf-8');

    // Language-specific validation
    if (language === 'json') {
      try {
        JSON.parse(content);
      } catch (e: any) {
        errors.push(`JSON syntax error: ${e.message}`);
      }
    }

    if (language === 'html') {
      // Basic HTML validation
      if (!content.includes('<!DOCTYPE') && !content.includes('<html')) {
        errors.push('Missing DOCTYPE or html tag');
      }
    }

    // Check for common issues
    if (content.includes('undefined') && content.includes('is not defined')) {
      errors.push('Potential undefined reference');
    }

  } catch (error: any) {
    errors.push(`File read error: ${error.message}`);
  }

  return {
    passed: errors.length === 0,
    errors
  };
}

export async function autoFixAll(
  rootPath: string,
  issues: any[],
  options: { safeOnly?: boolean; maxFixes?: number } = {}
): Promise<{
  fixed: number;
  failed: number;
  skipped: number;
  results: FixPipelineResult[];
}> {
  const results: FixPipelineResult[] = [];
  let fixed = 0;
  let failed = 0;
  let skipped = 0;

  const issuesToFix = options.safeOnly 
    ? issues.filter(i => i.severity === 'low' || i.severity === 'info')
    : issues;

  const maxFixes = options.maxFixes || issuesToFix.length;

  for (let i = 0; i < Math.min(issuesToFix.length, maxFixes); i++) {
    const issue = issuesToFix[i];

    try {
      const result = await runFixPipeline({
        rootPath,
        issueId: issue.id,
        file: issue.file,
        description: issue.message,
        expected: '',
        dryRun: false
      });

      results.push(result);

      if (result.success && result.checksPassed) {
        fixed++;
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
      skipped++;
    }
  }

  return { fixed, failed, skipped, results };
}
