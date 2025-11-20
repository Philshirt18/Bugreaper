import { readdirSync, lstatSync, readFileSync, existsSync, symlinkSync, unlinkSync } from 'fs';
import { join, basename, resolve } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface Repository {
  name: string;
  path: string;
  language: string;
  isSymlink: boolean;
  realPath?: string;
}

export function discoverRepositories(): Repository[] {
  const repos: Repository[] = [];
  const toyDir = join(process.cwd(), '..', '..', 'toy');
  
  try {
    const entries = readdirSync(toyDir);
    
    for (const entry of entries) {
      const fullPath = join(toyDir, entry);
      const stats = lstatSync(fullPath);
      
      // Check if it's a directory or symlink
      if (stats.isDirectory() || stats.isSymbolicLink()) {
        const language = detectLanguage(fullPath, entry);
        const isSymlink = stats.isSymbolicLink();
        
        repos.push({
          name: formatName(entry),
          path: `toy/${entry}`,
          language,
          isSymlink,
          realPath: isSymlink ? readdirSync(fullPath).length > 0 ? fullPath : undefined : undefined
        });
      }
    }
  } catch (error) {
    console.error('Error discovering repositories:', error);
  }
  
  return repos;
}

function detectLanguage(path: string, name: string): string {
  try {
    const files = readdirSync(path);
    
    // Check for package.json (TypeScript/JavaScript)
    if (files.includes('package.json')) {
      const packageJson = JSON.parse(readFileSync(join(path, 'package.json'), 'utf-8'));
      if (packageJson.dependencies?.typescript || packageJson.devDependencies?.typescript) {
        return 'typescript';
      }
      return 'javascript';
    }
    
    // Check for requirements.txt or setup.py (Python)
    if (files.includes('requirements.txt') || files.includes('setup.py') || files.includes('pyproject.toml')) {
      return 'python';
    }
    
    // Check for go.mod (Go)
    if (files.includes('go.mod')) {
      return 'go';
    }
    
    // Check for Cargo.toml (Rust)
    if (files.includes('Cargo.toml')) {
      return 'rust';
    }
    
    // Check file extensions
    const hasTS = files.some(f => f.endsWith('.ts') || f.endsWith('.tsx'));
    const hasJS = files.some(f => f.endsWith('.js') || f.endsWith('.jsx'));
    const hasPy = files.some(f => f.endsWith('.py'));
    
    if (hasTS) return 'typescript';
    if (hasJS) return 'javascript';
    if (hasPy) return 'python';
    
    // Default based on name
    if (name.includes('ts-') || name.includes('-ts')) return 'typescript';
    if (name.includes('py-') || name.includes('-py')) return 'python';
    if (name.includes('js-') || name.includes('-js')) return 'javascript';
    
    return 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

function formatName(dirName: string): string {
  // Convert directory name to readable format
  return dirName
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getRepositoryList(): Array<{ value: string; label: string; language: string; isSymlink: boolean }> {
  const repos = discoverRepositories();
  
  return repos.map(repo => {
    // Extract the actual folder name from the path
    const actualFolderName = repo.path.split('/').pop() || repo.name;
    
    return {
      value: repo.path,
      label: `${actualFolderName} (${repo.language})${repo.isSymlink ? ' 🔗' : ''}`,
      language: repo.language,
      isSymlink: repo.isSymlink
    };
  });
}

export function addProjectByPath(projectPath: string): { success: boolean; error?: string; repository?: any } {
  try {
    // Validate path exists
    if (!existsSync(projectPath)) {
      return { success: false, error: 'Path does not exist' };
    }
    
    // Check if it's a directory
    const stats = lstatSync(projectPath);
    if (!stats.isDirectory()) {
      return { success: false, error: 'Path is not a directory' };
    }
    
    // Get the project name from the path
    const projectName = basename(projectPath);
    const toyDir = join(process.cwd(), '..', '..', 'toy');
    const symlinkPath = join(toyDir, projectName);
    
    // Check if symlink already exists
    if (existsSync(symlinkPath)) {
      const existing = lstatSync(symlinkPath);
      if (existing.isSymbolicLink()) {
        return { success: false, error: 'Project already added' };
      }
      return { success: false, error: 'A project with this name already exists' };
    }
    
    // Create symlink
    const absolutePath = resolve(projectPath);
    symlinkSync(absolutePath, symlinkPath, 'dir');
    
    // Detect language
    const language = detectLanguage(absolutePath, projectName);
    
    // Return the new repository info (use actual folder name, not formatted)
    const repository = {
      value: `toy/${projectName}`,
      label: `${projectName} (${language}) 🔗`,
      language,
      isSymlink: true
    };
    
    return { success: true, repository };
  } catch (error: any) {
    console.error('Error adding project:', error);
    return { success: false, error: error.message };
  }
}

export function removeProjectByPath(projectPath: string): { success: boolean; error?: string } {
  try {
    console.log(`[Remove] Received path: "${projectPath}"`);
    
    // Extract the folder name from the path
    const folderName = projectPath.replace('toy/', '');
    console.log(`[Remove] Folder name: "${folderName}"`);
    
    const toyDir = join(process.cwd(), '..', '..', 'toy');
    const symlinkPath = join(toyDir, folderName);
    console.log(`[Remove] Full path: "${symlinkPath}"`);
    
    // Check if it exists
    if (!existsSync(symlinkPath)) {
      console.log(`[Remove] Path does not exist!`);
      // List what's actually in the toy directory
      const entries = readdirSync(toyDir);
      console.log(`[Remove] Available entries:`, entries);
      return { success: false, error: `Project not found. Looking for: "${folderName}"` };
    }
    
    // Check if it's a symlink (we only remove symlinks, not actual folders)
    const stats = lstatSync(symlinkPath);
    if (!stats.isSymbolicLink()) {
      console.log(`[Remove] Not a symlink`);
      return { success: false, error: 'Cannot remove non-symlinked projects (built-in toy repos)' };
    }
    
    console.log(`[Remove] Removing symlink...`);
    // Remove the symlink
    unlinkSync(symlinkPath);
    console.log(`[Remove] Successfully removed!`);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error removing project:', error);
    return { success: false, error: error.message };
  }
}

export async function searchForRepositories(searchPath: string): Promise<Array<{ path: string; name: string; language: string }>> {
  try {
    // Expand ~ to home directory
    const expandedPath = searchPath.replace(/^~/, process.env.HOME || '');
    
    // Use find command to search for .git directories (max depth 5 to avoid going too deep)
    const { stdout } = await execAsync(
      `find "${expandedPath}" -maxdepth 5 -type d -name ".git" 2>/dev/null | head -n 50`,
      { timeout: 30000 }
    );
    
    const gitDirs = stdout.trim().split('\n').filter(Boolean);
    const repositories: Array<{ path: string; name: string; language: string }> = [];
    
    for (const gitDir of gitDirs) {
      // Get the parent directory (the actual repo)
      const repoPath = gitDir.replace('/.git', '');
      const repoName = basename(repoPath);
      const language = detectLanguage(repoPath, repoName);
      
      repositories.push({
        path: repoPath,
        name: repoName,
        language,
      });
    }
    
    return repositories;
  } catch (error: any) {
    console.error('Error searching for repositories:', error);
    return [];
  }
}
