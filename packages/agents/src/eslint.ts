import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface EslintOptions {
  file: string;
  fix?: boolean;
}

export async function lint(options: EslintOptions): Promise<{ success: boolean; output: string }> {
  const fixFlag = options.fix ? '--fix' : '';
  
  try {
    const { stdout, stderr } = await execAsync(
      `eslint ${fixFlag} ${options.file}`,
      { timeout: 60000 }
    );
    return { success: true, output: stdout || stderr };
  } catch (error: any) {
    return { success: false, output: error.stdout || error.stderr };
  }
}
