import { ExecutorContext } from '@nx/devkit';
import { executeCommand } from '../../utils/execute-command';
import { useUnixPath, useWindowsPath } from '../../utils/path.mock.spec';
import executor from './executor';
import { InvokeExecutorSchema } from './schema';

jest.mock('node:path', () => {
  const originalModule = jest.requireActual('node:path');

  return {
    __esModule: true,
    ...originalModule,
    join: jest.fn(),
    normalize: jest.fn(),
    relative: jest.fn(),
    resolve: jest.fn(),
  };
});

jest.mock('../../utils/execute-command');

describe('Invoke Executor', () => {
  beforeEach(() => {
    (
      executeCommand as jest.MockedFunction<typeof executeCommand>
    ).mockImplementation(() => Promise.resolve(undefined));
  });

  describe('Unix', () => {
    let options: InvokeExecutorSchema;
    let context: ExecutorContext;

    beforeEach(() => {
      useUnixPath();

      options = {
        samConfiguration: 'apps/test/samconfig.toml',
        terraformDirectory: 'apps/test/terraform',
        _: undefined,
      };

      context = {
        root: '/home/castleadmin/projects/awesome',
        cwd: '/home/castleadmin/projects/awesome',
        isVerbose: false,
      };
    });

    describe('args', () => {
      it('Should execute command with custom arguments.', async () => {
        options.args = '--no-event --log-file "../log.txt"';

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam local invoke --config-file "../samconfig.toml" --no-event --log-file "../log.txt"',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/terraform',
            shell: undefined,
          }
        );
      });

      it("Shouldn't execute command without custom arguments.", async () => {
        delete options.args;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam local invoke --config-file "../samconfig.toml"',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/terraform',
            shell: undefined,
          }
        );
      });
    });

    describe('shell', () => {
      it('Should execute command with a specific shell.', async () => {
        options.shell = '/bin/bash';

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam local invoke --config-file "../samconfig.toml"',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/terraform',
            shell: '/bin/bash',
          }
        );
      });

      it('Should execute command with the default shell.', async () => {
        delete options.shell;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam local invoke --config-file "../samconfig.toml"',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/terraform',
            shell: undefined,
          }
        );
      });
    });

    describe('errors', () => {
      it('Should throw an error if the command fails to execute successfully.', async () => {
        (
          executeCommand as jest.MockedFunction<typeof executeCommand>
        ).mockImplementationOnce(() => Promise.reject(new Error('Test error')));

        await expect(executor(options, context)).rejects.toBeInstanceOf(Error);

        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam local invoke --config-file "../samconfig.toml"',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/terraform',
            shell: undefined,
          }
        );
      });
    });
  });

  describe('Windows', () => {
    let options: InvokeExecutorSchema;
    let context: ExecutorContext;

    beforeEach(() => {
      useWindowsPath();

      options = {
        samConfiguration: 'apps/test/samconfig.toml',
        terraformDirectory: 'apps/test/terraform',
        _: undefined,
      };

      context = {
        root: 'C:\\Users\\castleadmin\\projects\\awesome',
        cwd: 'C:\\Users\\castleadmin\\projects\\awesome',
        isVerbose: false,
      };
    });

    describe('args', () => {
      it('Should execute command with custom arguments.', async () => {
        options.args = '--no-event --log-file "..\\log.txt"';

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam local invoke --config-file "..\\samconfig.toml" --no-event --log-file "..\\log.txt"',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\terraform',
            shell: undefined,
          }
        );
      });

      it("Shouldn't execute command without custom arguments.", async () => {
        delete options.args;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam local invoke --config-file "..\\samconfig.toml"',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\terraform',
            shell: undefined,
          }
        );
      });
    });

    describe('shell', () => {
      it('Should execute command with a specific shell.', async () => {
        options.shell = 'powershell.exe';

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam local invoke --config-file "..\\samconfig.toml"',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\terraform',
            shell: 'powershell.exe',
          }
        );
      });

      it('Should execute command with the default shell.', async () => {
        delete options.shell;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam local invoke --config-file "..\\samconfig.toml"',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\terraform',
            shell: undefined,
          }
        );
      });
    });

    describe('errors', () => {
      it('Should throw an error if the command fails to execute successfully.', async () => {
        (
          executeCommand as jest.MockedFunction<typeof executeCommand>
        ).mockImplementationOnce(() => Promise.reject(new Error('Test error')));

        await expect(executor(options, context)).rejects.toBeInstanceOf(Error);

        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam local invoke --config-file "..\\samconfig.toml"',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\terraform',
            shell: undefined,
          }
        );
      });
    });
  });
});
