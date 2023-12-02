import { faker } from '@faker-js/faker';
import { ChildProcess, spawn } from 'node:child_process';
import { executeCommand } from './execute-command';

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
  let args: string[];
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
    command = faker.word.sample();
    args = [faker.word.sample(), faker.word.sample()];
    cwd = faker.system.directoryPath();
  });

  test('Given a command that returns exit code 0, the execution should be marked as successful.', async () => {
    const promise = executeCommand(command, args, {
      cwd,
    });

    callbackClose(0);

    await promise;

    expect(spawn).toHaveBeenCalledTimes(1);
    expect(spawn).toHaveBeenCalledWith(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
    });
  });

  test('Given a command that returns an exit code > 0, the execution should throw an error.', async () => {
    const promise = executeCommand(command, args, {
      cwd,
    });

    callbackClose(faker.number.int({ min: 1 }));

    await expect(promise).rejects.toBeInstanceOf(Error);

    expect(spawn).toHaveBeenCalledTimes(1);
    expect(spawn).toHaveBeenCalledWith(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
    });
  });

  test('Given a command that fails during the execution, the execution should throw an error.', async () => {
    const promise = executeCommand(command, args, {
      cwd,
    });

    callbackError(new Error('Test error'));

    await expect(promise).rejects.toBeInstanceOf(Error);

    expect(spawn).toHaveBeenCalledTimes(1);
    expect(spawn).toHaveBeenCalledWith(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
    });
  });
});
