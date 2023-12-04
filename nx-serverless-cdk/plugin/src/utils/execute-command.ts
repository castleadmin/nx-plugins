import { spawn } from 'node:child_process';

export const executeCommand = (
  command: string,
  args: string[],
  options: {
    cwd: string;
  },
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const { cwd } = options;

    const commandProcess = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: false,
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
