import { spawn } from 'node:child_process';

export const executeCommand = (
  command: string,
  args: string[],
  options: {
    cwd: string;
    stdout?: (data: string) => void;
    stderr?: (data: string) => void;
  },
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const { cwd } = options;

    const commandProcess = spawn(command, args, {
      cwd,
      stdio: 'pipe',
      shell: true,
    });

    commandProcess.stdout.on('data', (chunk) => {
      if (options.stdout) {
        options.stdout(Buffer.from(chunk).toString('utf-8'));
      }
    });
    commandProcess.stdout.pipe(process.stdout, { end: false });

    commandProcess.stderr.on('data', (chunk) => {
      if (options.stderr) {
        options.stderr(Buffer.from(chunk).toString('utf-8'));
      }
    });
    commandProcess.stderr.pipe(process.stderr, { end: false });

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
