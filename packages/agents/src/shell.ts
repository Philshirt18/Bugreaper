import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const ALLOWED_COMMANDS = ['ls', 'cat', 'echo', 'pwd', 'which', 'head', 'tail'];

export interface ShellOptions {
  command: string;
  args?: string[];
  cwd?: string;
  timeout?: number;
}

export async function execSafe(options: ShellOptions): Promise<string> {
  const baseCommand = options.command.split(' ')[0];
  
  if (!ALLOWED_COMMANDS.includes(baseCommand)) {
    throw new Error(`Command ${baseCommand} is not allowed`);
  }
  
  const fullCommand = options.args 
    ? `${options.command} ${options.args.join(' ')}`
    : options.command;
  
  const { stdout } = await execAsync(fullCommand, {
    cwd: options.cwd,
    timeout: options.timeout || 30000,
  });
  
  return stdout;
}
