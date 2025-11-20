import { readdirSync, statSync, readFileSync } from 'fs';
import { join, relative } from 'path';
import { detectLanguage } from './languages/detect';
import { getFixers } from './languages/fixers';

export interface ScanOptions {
  rootPath: string;
  exclude?: string[];
  maxFiles?: number;
}

export interface Issue {
  id: string;
  file: string;
  language: string;
  line: number;
  endLine?: number;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  rule: string;
  message: string;
  suggestedFix?: string;
  status: 'pending';
  createdAt: Date;
}

const DEFAULT_EXCLUDE = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '__pycache__',
  '.pytest_cache',
  'venv',
  '.venv'
];

export async function scanProject(options: ScanOptions): Promise<{
  issues: Issue[];
  scannedFiles: number;
  duration: number;
  allFiles?: Array<{ path: string; language: string }>;
}> {
  const startTime = Date.now();
  const issues: Issue[] = [];
  const allFiles: Array<{ path: string; language: string }> = [];
  const exclude = [...DEFAULT_EXCLUDE, ...(options.exclude || [])];
  let scannedFiles = 0;

  function shouldExclude(path: string): boolean {
    return exclude.some(pattern => path.includes(pattern));
  }

  function scanDirectory(dirPath: string) {
    if (shouldExclude(dirPath)) return;
    if (options.maxFiles && scannedFiles >= options.maxFiles) return;

    try {
      const entries = readdirSync(dirPath);

      for (const entry of entries) {
        const fullPath = join(dirPath, entry);
        
        if (shouldExclude(fullPath)) continue;

        try {
          const stats = statSync(fullPath);

          if (stats.isDirectory()) {
            scanDirectory(fullPath);
          } else if (stats.isFile()) {
            const language = detectLanguage(fullPath);
            if (language !== 'unknown') {
              const relativePath = relative(options.rootPath, fullPath);
              allFiles.push({ path: relativePath, language });
              
              const fileIssues = scanFile(fullPath, options.rootPath);
              issues.push(...fileIssues);
              scannedFiles++;
            }

            if (options.maxFiles && scannedFiles >= options.maxFiles) break;
          }
        } catch (err) {
          console.error(`Error scanning ${fullPath}:`, err);
        }
      }
    } catch (err) {
      console.error(`Error reading directory ${dirPath}:`, err);
    }
  }

  scanDirectory(options.rootPath);

  return {
    issues,
    scannedFiles,
    allFiles,
    duration: Date.now() - startTime
  };
}

function scanFile(filePath: string, rootPath: string): Issue[] {
  const issues: Issue[] = [];
  const language = detectLanguage(filePath);

  if (language === 'unknown') return issues;

  try {
    const content = readFileSync(filePath, 'utf-8');
    const relativePath = relative(rootPath, filePath);

    // Run language-specific checks (pass full path for file reading)
    const langIssues = runLanguageChecks(content, language, filePath);
    issues.push(...langIssues);

    // Run common checks (pass full path for file reading)
    const commonIssues = runCommonChecks(content, filePath);
    issues.push(...commonIssues);

  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
  }

  return issues;
}

function runLanguageChecks(content: string, language: string, filePath: string): Issue[] {
  const issues: Issue[] = [];
  const lines = content.split('\n');

  // Check for button disabled patterns
  if (language === 'html' || language === 'javascript') {
    lines.forEach((line, index) => {
      // Check for disabled attribute in HTML
      if (line.includes('<button') && line.includes('disabled')) {
        issues.push({
          id: `${filePath}:${index + 1}:button-disabled-html`,
          file: filePath,
          language,
          line: index + 1,
          severity: 'high',
          rule: 'button-disabled',
          message: 'Button has disabled attribute',
          suggestedFix: 'Remove the disabled attribute from the button',
          status: 'pending',
          createdAt: new Date()
        });
      }

      // Check for .disabled in JavaScript (any value, check the comment for BUG)
      if (line.includes('.disabled') && line.includes('=')) {
        // Check if there's a BUG comment indicating this is wrong
        if (line.includes('// BUG') || line.includes('//BUG')) {
          issues.push({
            id: `${filePath}:${index + 1}:button-disabled-js`,
            file: filePath,
            language,
            line: index + 1,
            severity: 'high',
            rule: 'button-disabled',
            message: 'Button disabled code marked as BUG',
            suggestedFix: 'Fix or remove the disabled code based on the bug comment',
            status: 'pending',
            createdAt: new Date()
          });
        }
        // Also flag .disabled = true (always wrong for buttons that should work)
        else if (line.includes('= true')) {
          issues.push({
            id: `${filePath}:${index + 1}:button-disabled-js`,
            file: filePath,
            language,
            line: index + 1,
            severity: 'high',
            rule: 'button-disabled',
            message: 'Button is being disabled in JavaScript',
            suggestedFix: 'Change .disabled = true to .disabled = false or remove the line',
            status: 'pending',
            createdAt: new Date()
          });
        }
      }

      // Check for setAttribute disabled
      if (line.includes('setAttribute') && line.includes('disabled')) {
        issues.push({
          id: `${filePath}:${index + 1}:button-disabled-setattr`,
          file: filePath,
          language,
          line: index + 1,
          severity: 'high',
          rule: 'button-disabled',
          message: 'Button is being disabled via setAttribute',
          suggestedFix: 'Remove the setAttribute call',
          status: 'pending',
          createdAt: new Date()
        });
      }

      // Check for preventDefault on button clicks (but NOT on form submit - that's correct!)
      if (line.includes('preventDefault')) {
        // Check if this is in a button click handler (bad) or form submit (good)
        const prevLines = lines.slice(Math.max(0, index - 3), index).join(' ');
        const isButtonClick = prevLines.includes('addEventListener("click"') && 
                             (prevLines.includes('Btn') || prevLines.includes('button'));
        const isFormSubmit = prevLines.includes('addEventListener("submit"') || 
                            prevLines.includes('form.');
        
        // Only flag if it's a button click, not a form submit
        if (isButtonClick && !isFormSubmit) {
          issues.push({
            id: `${filePath}:${index + 1}:prevent-default`,
            file: filePath,
            language,
            line: index + 1,
            severity: 'medium',
            rule: 'prevent-default',
            message: 'preventDefault may be blocking button functionality',
            suggestedFix: 'Remove preventDefault if not needed',
            status: 'pending',
            createdAt: new Date()
          });
        }
      }
    });
  }

  return issues;
}

function runCommonChecks(content: string, filePath: string): Issue[] {
  const issues: Issue[] = [];
  const lines = content.split('\n');

  // Check for TODO/FIXME comments
  lines.forEach((line, index) => {
    if (line.includes('TODO') || line.includes('FIXME')) {
      issues.push({
        id: `${filePath}:${index + 1}:todo`,
        file: filePath,
        language: 'unknown',
        line: index + 1,
        severity: 'info',
        rule: 'todo-comment',
        message: 'TODO comment found',
        status: 'pending',
        createdAt: new Date()
      });
    }
  });

  // Check for console.log (in JS/TS files)
  if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
    lines.forEach((line, index) => {
      if (line.includes('console.log') && !line.includes('//')) {
        issues.push({
          id: `${filePath}:${index + 1}:console-log`,
          file: filePath,
          language: 'javascript',
          line: index + 1,
          severity: 'low',
          rule: 'no-console',
          message: 'console.log statement found',
          status: 'pending',
          createdAt: new Date()
        });
      }
    });
  }

  return issues;
}
