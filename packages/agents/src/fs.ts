import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join } from 'path';

const FORBIDDEN_PATHS = ['.env', '.git', 'node_modules', '.kiro/mcp'];

function isPathAllowed(path: string): boolean {
  return !FORBIDDEN_PATHS.some(forbidden => path.includes(forbidden));
}

export async function readFileSafe(path: string): Promise<string> {
  if (!isPathAllowed(path)) {
    throw new Error(`Access to ${path} is forbidden`);
  }
  return readFile(path, 'utf-8');
}

export async function writeFileSafe(path: string, content: string): Promise<void> {
  if (!isPathAllowed(path)) {
    throw new Error(`Access to ${path} is forbidden`);
  }
  
  if (content.length > 10 * 1024 * 1024) {
    throw new Error('File size exceeds 10MB limit');
  }
  
  await writeFile(path, content, 'utf-8');
}

export async function listDirectory(path: string): Promise<string[]> {
  if (!isPathAllowed(path)) {
    throw new Error(`Access to ${path} is forbidden`);
  }
  return readdir(path);
}

export async function fileExists(path: string): Promise<boolean> {
  if (!isPathAllowed(path)) {
    return false;
  }
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}
