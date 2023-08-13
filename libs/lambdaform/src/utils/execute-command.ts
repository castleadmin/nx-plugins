import { exec, spawn } from 'node:child_process';

export const executeCommand = (
  command: string,
  options: {
    cwd: string;
    shell: string | undefined;
  }
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const { cwd, shell } = options;

    const commandProcess = spawn(command, [], {
      cwd,
      stdio: 'inherit',
      shell: shell ? shell : true,
    });

    commandProcess.on('close', (code: number | null) => {
      if (code !== 0) {
        reject(
          new Error(
            `Command process exited with error code ${code?.toString()}.`
          )
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

export const executeCommandBufferResults = (
  command: string,
  options: {
    cwd: string;
    shell: string | undefined;
  }
): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((resolve, reject) => {
    const { cwd, shell } = options;

    exec(
      command,
      {
        cwd,
        shell: shell ? shell : undefined,
      },
      (error, stdout, stderr) => {
        console.log(stdout);
        console.error(stderr);

        if (error) {
          reject(error);
          return;
        }

        resolve({ stdout, stderr });
      }
    );
  });
};
