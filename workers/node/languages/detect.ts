import { readFileSync } from 'fs';
import { extname, basename } from 'path';

export type Language = 'typescript' | 'javascript' | 'python' | 'html' | 'css' | 'json' | 'yaml' | 'markdown' | 'sql' | 'unknown';

const EXTENSION_MAP: Record<string, Language> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.py': 'python',
  '.pyw': 'python',
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'css',
  '.sass': 'css',
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.md': 'markdown',
  '.markdown': 'markdown',
  '.sql': 'sql',
};

export function detectLanguage(filePath: string): Language {
  // Check extension first
  const ext = extname(filePath).toLowerCase();
  if (EXTENSION_MAP[ext]) {
    return EXTENSION_MAP[ext];
  }

  // Check filename patterns
  const name = basename(filePath).toLowerCase();
  if (name === 'dockerfile') return 'unknown';
  if (name.endsWith('.config.js')) return 'javascript';
  if (name.endsWith('.config.ts')) return 'typescript';

  // Try to read shebang for scripts without extension
  try {
    const content = readFileSync(filePath, 'utf-8');
    const firstLine = content.split('\n')[0];
    
    if (firstLine.startsWith('#!')) {
      if (firstLine.includes('python')) return 'python';
      if (firstLine.includes('node')) return 'javascript';
      if (firstLine.includes('bash') || firstLine.includes('sh')) return 'unknown';
    }

    // Heuristic: check content patterns
    if (content.includes('<!DOCTYPE html') || content.includes('<html')) return 'html';
    if (content.includes('def ') && content.includes('import ')) return 'python';
    if (content.includes('function ') || content.includes('const ') || content.includes('let ')) return 'javascript';
  } catch (error) {
    // File read failed, return unknown
  }

  return 'unknown';
}

export function isSupported(language: Language): boolean {
  return language !== 'unknown';
}

export function getFileExtensions(language: Language): string[] {
  return Object.entries(EXTENSION_MAP)
    .filter(([_, lang]) => lang === language)
    .map(([ext]) => ext);
}
