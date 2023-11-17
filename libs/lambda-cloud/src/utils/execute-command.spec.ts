import { faker } from '@faker-js/faker';
import { ChildProcess, ExecException, exec, spawn } from 'node:child_process';
import { executeCommand, executeCommandBufferResults } from './execute-command';

jest.mock('node:child_process', () => {
  const originalModule = jest.requireActual('node:child_process');

  return {
    __esModule: true,
    ...originalModule,
    exec: jest.fn(),
    spawn: jest.fn(),
  };
});

describe('executeCommand', () => {
  let callbackClose: (code: number | null) => void;
  let callbackError: (error: Error) => void;
  let command: string;
  let cwd: string;

  beforeEach(() => {
    const on = (event: string, listener: () => void) => {
      if (event === 'close') {
        callbackClose = listener;
      } else if (event === 'error') {
        callbackError = listener;
      }
    };
    (spawn as jest.MockedFunction<typeof spawn>).mockImplementation(
      () =>
        ({
          on,
        } as unknown as ChildProcess),
    );
    command = faker.word.words();
    cwd = faker.system.directoryPath();
  });

  test('Should execute the command successfully.', async () => {
    const promise = executeCommand(command, {
      cwd,
      shell: undefined,
    });

    callbackClose(0);

    await promise;

    expect(spawn).toHaveBeenCalledTimes(1);
    expect(spawn).toHaveBeenCalledWith(command, [], {
      cwd,
      stdio: 'inherit',
      shell: true,
    });
  });

  test('Should use the defined shell.', async () => {
    const promise = executeCommand(command, {
      cwd,
      shell: '/bin/bash',
    });

    callbackClose(0);

    await promise;

    expect(spawn).toHaveBeenCalledTimes(1);
    expect(spawn).toHaveBeenCalledWith(command, [], {
      cwd,
      stdio: 'inherit',
      shell: '/bin/bash',
    });
  });

  test("Should reject if the process exit code isn't 0.", async () => {
    const promise = executeCommand(command, {
      cwd,
      shell: undefined,
    });

    callbackClose(faker.number.int({ min: 1 }));

    await expect(promise).rejects.toBeInstanceOf(Error);

    expect(spawn).toHaveBeenCalledTimes(1);
    expect(spawn).toHaveBeenCalledWith(command, [], {
      cwd,
      stdio: 'inherit',
      shell: true,
    });
  });

  test('Should reject if an error is thrown.', async () => {
    const promise = executeCommand(command, {
      cwd,
      shell: undefined,
    });

    callbackError(new Error('Test error'));

    await expect(promise).rejects.toBeInstanceOf(Error);

    expect(spawn).toHaveBeenCalledTimes(1);
    expect(spawn).toHaveBeenCalledWith(command, [], {
      cwd,
      stdio: 'inherit',
      shell: true,
    });
  });
});

describe('executeCommandBufferResults', () => {
  let execMocked: jest.MockedFunction<typeof exec>;
  let command: string;
  let cwd: string;
  let commandStdout: string;
  let commandStderr: string;

  beforeEach(() => {
    execMocked = exec as jest.MockedFunction<typeof exec>;
    command = faker.word.words();
    cwd = faker.system.directoryPath();
    commandStdout = faker.lorem.lines(5);
    commandStderr = faker.lorem.lines(3);
  });

  test('Should return the stdout and stderr of the command.', async () => {
    execMocked.mockImplementationOnce((_command, _options, cb) => {
      cb && setTimeout(() => cb(null, commandStdout, commandStderr), 0);

      return undefined as unknown as ChildProcess;
    });

    const { stdout, stderr } = await executeCommandBufferResults(command, {
      cwd,
      shell: undefined,
    });

    expect(execMocked).toHaveBeenCalledTimes(1);
    expect(execMocked).toHaveBeenCalledWith(
      command,
      { cwd, shell: undefined },
      expect.anything(),
    );
    expect(stdout).toBe(commandStdout);
    expect(stderr).toBe(commandStderr);
  });

  test('Should use the defined shell.', async () => {
    execMocked.mockImplementationOnce((_command, _options, cb) => {
      cb && setTimeout(() => cb(null, commandStdout, commandStderr), 0);

      return undefined as unknown as ChildProcess;
    });

    const { stdout, stderr } = await executeCommandBufferResults(command, {
      cwd,
      shell: '/bin/bash',
    });

    expect(execMocked).toHaveBeenCalledTimes(1);
    expect(execMocked).toHaveBeenCalledWith(
      command,
      { cwd, shell: '/bin/bash' },
      expect.anything(),
    );
    expect(stdout).toBe(commandStdout);
    expect(stderr).toBe(commandStderr);
  });

  test('Should reject if an error occurs.', async () => {
    execMocked.mockImplementationOnce((_command, _options, cb) => {
      cb &&
        setTimeout(
          () =>
            cb(
              new Error('Test error') as ExecException,
              commandStdout,
              commandStderr,
            ),
          0,
        );

      return undefined as unknown as ChildProcess;
    });

    await expect(
      executeCommandBufferResults(command, {
        cwd,
        shell: undefined,
      }),
    ).rejects.toBeInstanceOf(Error);

    expect(execMocked).toHaveBeenCalledTimes(1);
    expect(execMocked).toHaveBeenCalledWith(
      command,
      { cwd, shell: undefined },
      expect.anything(),
    );
  });
});
