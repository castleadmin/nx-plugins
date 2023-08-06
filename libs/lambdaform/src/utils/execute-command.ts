import { exec, ExecOptions } from 'node:child_process';
import { stdout as processStdout, stderr as processStderr } from 'node:process';

export const executeCommand = (
  command: string,
  options: ExecOptions
): Promise<{
  stdout: string;
  stderr: string;
}> => {
  return new Promise((resolve, reject) => {
    const commandProcess = exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({ stdout, stderr });
    });

    commandProcess.stdout?.pipe(processStdout, { end: false });
    commandProcess.stderr?.pipe(processStderr, { end: false });
  });
};
