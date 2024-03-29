import { logger } from '@nx/devkit';
import { spawn } from 'node:child_process';
import { isWindows } from './is-windows';

export const executeCommand = (
  command: string,
  args: string[],
  options: {
    cwd: string;
  },
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const { cwd } = options;

    const normalizedArgs = args.map((arg) =>
      isWindows() ? `"${arg}"` : `'${arg}'`,
    );
    logger.log('Executing command:', command, normalizedArgs.join(' '));
    const commandProcess = spawn(command, normalizedArgs, {
      cwd,
      shell: true,
      stdio: 'inherit',
    });

    commandProcess.on('close', (code: number | null) => {
      if (code !== 0) {
        reject(
          new Error(
            `Command process exited with error code '${code?.toString()}'.`,
          ),
        );

        return;
      }

      resolve();
    });

    commandProcess.on('error', (error: Error) => {
      reject(error);
    });
  });
};
