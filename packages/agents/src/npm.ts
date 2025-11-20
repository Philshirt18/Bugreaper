import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface NpmOptions {
  cwd: string;
  script: string;
  timeout?: number;
}

const ALLOWED_SCRIPTS = ['test', 'test:unit', 'lint', 'format'];

export async function runScript(options: NpmOptions): Promise<{ success: boolean; output: string }> {
  if (!ALLOWED_SCRIPTS.includes(options.script)) {
    throw new Error(`Script ${options.script} is not allowed`);
  }
  
  try {
    const { stdout, stderr } = await execAsync(
      `npm run ${options.script}`,
      {
        cwd: options.cwd,
        timeout: options.timeout || 180000,
      }
    );
    return { success: true, output: stdout + stderr };
  } catch (error: any) {
    return { success: false, output: error.stdout + error.stderr };
  }
}
