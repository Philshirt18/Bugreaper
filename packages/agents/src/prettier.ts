import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface PrettierOptions {
  file: string;
  write?: boolean;
}

export async function format(options: PrettierOptions): Promise<string> {
  const writeFlag = options.write ? '--write' : '';
  
  const { stdout } = await execAsync(
    `prettier ${writeFlag} ${options.file}`,
    { timeout: 30000 }
  );
  return stdout;
}
