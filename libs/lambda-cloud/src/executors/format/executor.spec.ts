import { ExecutorContext } from '@nx/devkit';
import { executeCommand } from '../../utils/execute-command';
import { useUnixPath, useWindowsPath } from '../../utils/path.mock.spec';
import executor from './executor';
import { FormatExecutorSchema } from './schema';

jest.mock('node:path', () => {
  const originalModule = jest.requireActual('node:path');

  const module = {
    __esModule: true,
    ...originalModule,
    basename: jest.fn(),
    dirname: jest.fn(),
    join: jest.fn(),
    normalize: jest.fn(),
    relative: jest.fn(),
    resolve: jest.fn(),
  };
  Object.defineProperty(module, 'sep', { get: jest.fn() });

  return module;
});

jest.mock('../../utils/execute-command');

describe('Format Executor', () => {
  beforeEach(() => {
    (
      executeCommand as jest.MockedFunction<typeof executeCommand>
    ).mockImplementation(() => Promise.resolve(undefined));
  });

  describe('Unix', () => {
    let options: FormatExecutorSchema;
    let context: ExecutorContext;

    beforeEach(() => {
      useUnixPath();

      options = {
        terraformDirectory: 'apps/test/terraform',
      };

      context = {
        root: '/home/castleadmin/projects/awesome',
        cwd: '/home/castleadmin/projects/awesome',
        isVerbose: false,
      };
    });

    describe('args', () => {
      it('Should execute command with custom arguments.', async () => {
        options.args = '-list=false -check';

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'terraform fmt -recursive -list=false -check',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/terraform',
            shell: undefined,
          },
        );
      });

      it("Shouldn't execute command without custom arguments.", async () => {
        delete options.args;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'terraform fmt -recursive',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/terraform',
            shell: undefined,
          },
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
          'terraform fmt -recursive',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/terraform',
            shell: '/bin/bash',
          },
        );
      });

      it('Should execute command with the default shell.', async () => {
        delete options.shell;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'terraform fmt -recursive',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/terraform',
            shell: undefined,
          },
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
          'terraform fmt -recursive',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/terraform',
            shell: undefined,
          },
        );
      });
    });
  });

  describe('Windows', () => {
    let options: FormatExecutorSchema;
    let context: ExecutorContext;

    beforeEach(() => {
      useWindowsPath();

      options = {
        terraformDirectory: 'apps/test/terraform',
      };

      context = {
        root: 'C:\\Users\\castleadmin\\projects\\awesome',
        cwd: 'C:\\Users\\castleadmin\\projects\\awesome',
        isVerbose: false,
      };
    });

    describe('args', () => {
      it('Should execute command with custom arguments.', async () => {
        options.args = '-list=false -check';

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'terraform fmt -recursive -list=false -check',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\terraform',
            shell: undefined,
          },
        );
      });

      it("Shouldn't execute command without custom arguments.", async () => {
        delete options.args;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'terraform fmt -recursive',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\terraform',
            shell: undefined,
          },
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
          'terraform fmt -recursive',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\terraform',
            shell: 'powershell.exe',
          },
        );
      });

      it('Should execute command with the default shell.', async () => {
        delete options.shell;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'terraform fmt -recursive',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\terraform',
            shell: undefined,
          },
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
          'terraform fmt -recursive',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\terraform',
            shell: undefined,
          },
        );
      });
    });
  });
});
