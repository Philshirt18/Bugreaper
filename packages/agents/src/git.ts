import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface GitOptions {
  cwd: string;
  timeout?: number;
}

export async function gitCheckout(branch: string, options: GitOptions): Promise<void> {
  const { stdout, stderr } = await execAsync(`git checkout -b ${branch}`, {
    cwd: options.cwd,
    timeout: options.timeout || 10000,
  });
  if (stderr && !stderr.includes('Switched to')) {
    throw new Error(stderr);
  }
}

export async function gitCommit(message: string, options: GitOptions): Promise<void> {
  await execAsync(`git commit -am "${message}"`, {
    cwd: options.cwd,
    timeout: options.timeout || 10000,
  });
}

export async function gitDiff(options: GitOptions): Promise<string> {
  const { stdout } = await execAsync('git diff', {
    cwd: options.cwd,
    timeout: options.timeout || 10000,
  });
  return stdout;
}

export async function gitStatus(options: GitOptions): Promise<string> {
  const { stdout } = await execAsync('git status --short', {
    cwd: options.cwd,
    timeout: options.timeout || 10000,
  });
  return stdout;
}
