import { readFileSync } from 'fs';
import { join } from 'path';

export function readTargetFile(repository: string, filePath: string): string | null {
  try {
    const fullPath = join(process.cwd(), '..', '..', repository, filePath);
    const content = readFileSync(fullPath, 'utf-8');
    console.log(`    ✓ Read file: ${filePath} (${content.length} bytes)`);
    return content;
  } catch (error) {
    console.log(`    ✗ Could not read file ${filePath}:`, error);
    return null;
  }
}

export function extractFunctionCode(fileContent: string, functionName: string, language: string): string | null {
  if (!fileContent) return null;
  
  const lines = fileContent.split('\n');
  let startLine = -1;
  let endLine = -1;
  let braceCount = 0;
  
  if (language === 'typescript') {
    // Find function declaration
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(`function ${functionName}`) || lines[i].includes(`${functionName}(`)) {
        startLine = i;
        break;
      }
    }
    
    if (startLine === -1) return null;
    
    // Find function end by counting braces
    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;
      
      if (braceCount === 0 && i > startLine) {
        endLine = i;
        break;
      }
    }
  } else if (language === 'python') {
    // Find function definition
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith(`def ${functionName}(`)) {
        startLine = i;
        break;
      }
    }
    
    if (startLine === -1) return null;
    
    // Find function end by indentation
    const baseIndent = lines[startLine].search(/\S/);
    for (let i = startLine + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '') continue;
      
      const currentIndent = line.search(/\S/);
      if (currentIndent <= baseIndent) {
        endLine = i - 1;
        break;
      }
    }
    
    if (endLine === -1) endLine = lines.length - 1;
  }
  
  if (startLine === -1 || endLine === -1) return null;
  
  return lines.slice(startLine, endLine + 1).join('\n');
}

export function analyzeFunction(code: string, language: string): {
  hasErrorHandling: boolean;
  hasInputValidation: boolean;
  complexity: 'low' | 'medium' | 'high';
  linesOfCode: number;
} {
  const lines = code.split('\n').filter(l => l.trim());
  
  const hasErrorHandling = 
    code.includes('try') || 
    code.includes('catch') || 
    code.includes('throw') ||
    code.includes('raise') ||
    code.includes('except');
  
  const hasInputValidation = 
    code.includes('if') && (
      code.includes('===') ||
      code.includes('==') ||
      code.includes('<') ||
      code.includes('>')
    );
  
  const complexity = lines.length < 10 ? 'low' : lines.length < 30 ? 'medium' : 'high';
  
  return {
    hasErrorHandling,
    hasInputValidation,
    complexity,
    linesOfCode: lines.length
  };
}
