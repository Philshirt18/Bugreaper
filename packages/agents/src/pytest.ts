import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface PytestOptions {
  cwd: string;
  testFile?: string;
  timeout?: number;
}

export async function runPytest(options: PytestOptions): Promise<{ success: boolean; output: string }> {
  const testArg = options.testFile || '';
  
  try {
    const { stdout, stderr } = await execAsync(
      `pytest -v ${testArg}`,
      {
        cwd: options.cwd,
        timeout: options.timeout || 120000,
      }
    );
    return { success: true, output: stdout + stderr };
  } catch (error: any) {
    return { success: false, output: error.stdout + error.stderr };
  }
}
