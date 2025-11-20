import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface RipgrepOptions {
  query: string;
  path: string;
  contextLines?: number;
  maxResults?: number;
}

export async function search(options: RipgrepOptions): Promise<string[]> {
  const contextFlag = options.contextLines ? `-C ${options.contextLines}` : '';
  const maxFlag = options.maxResults ? `-m ${options.maxResults}` : '';
  
  try {
    const { stdout } = await execAsync(
      `rg "${options.query}" ${contextFlag} ${maxFlag} ${options.path}`,
      { timeout: 30000 }
    );
    return stdout.split('\n').filter(line => line.trim());
  } catch (error: any) {
    if (error.code === 1) {
      return [];
    }
    throw error;
  }
}
