import { ExecutorContext } from '@nx/devkit';
import { executeCommand } from '../../utils/execute-command';
import { useUnixPath, useWindowsPath } from '../../utils/path.mock.spec';
import executor from './executor';
import { ServeExecutorSchema } from './schema';

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

describe('Serve Executor', () => {
  beforeEach(() => {
    (
      executeCommand as jest.MockedFunction<typeof executeCommand>
    ).mockImplementation(() => Promise.resolve(undefined));
  });

  describe('Unix', () => {
    let options: ServeExecutorSchema;
    let context: ExecutorContext;

    beforeEach(() => {
      useUnixPath();

      options = {
        samConfiguration: 'apps/test/samconfig.toml',
        terraformDirectory: 'apps/test/terraform',
      };

      context = {
        root: '/home/castleadmin/projects/awesome',
        cwd: '/home/castleadmin/projects/awesome',
        isVerbose: false,
      };
    });

    describe('api', () => {
      it('Should start as API server.', async () => {
        options.api = true;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam local start-api --config-file "../samconfig.toml"',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/terraform',
            shell: undefined,
          },
        );
      });

      it("Shouldn't start as API server.", async () => {
        delete options.api;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam local start-lambda --config-file "../samconfig.toml"',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/terraform',
            shell: undefined,
          },
        );
      });
    });

    describe('args', () => {
      it('Should execute command with custom arguments.', async () => {
        options.args = '--debug --log-file "../log.txt"';

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam local start-lambda --config-file "../samconfig.toml" --debug --log-file "../log.txt"',
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
          'sam local start-lambda --config-file "../samconfig.toml"',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/terraform',
            shell: undefined,
          },
        );
      });
    });

    describe('additional args', () => {
      it('Should execute command with custom additional arguments.', async () => {
        (options as typeof options & { debug?: boolean })['debug'] = true;
        (options as typeof options & { 'log-file'?: string })['log-file'] =
          '../log.txt';

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam local start-lambda --config-file "../samconfig.toml" --debug --log-file "../log.txt"',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/terraform',
            shell: undefined,
          },
        );
      });

      it("Shouldn't execute command without custom additional arguments.", async () => {
        delete (options as typeof options & { debug?: boolean })['debug'];
        delete (options as typeof options & { 'log-file'?: string })[
          'log-file'
        ];

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam local start-lambda --config-file "../samconfig.toml"',
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
          'sam local start-lambda --config-file "../samconfig.toml"',
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
          'sam local start-lambda --config-file "../samconfig.toml"',
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
          'sam local start-lambda --config-file "../samconfig.toml"',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/terraform',
            shell: undefined,
          },
        );
      });
    });
  });

  describe('Windows', () => {
    let options: ServeExecutorSchema;
    let context: ExecutorContext;

    beforeEach(() => {
      useWindowsPath();

      options = {
        samConfiguration: 'apps/test/samconfig.toml',
        terraformDirectory: 'apps/test/terraform',
      };

      context = {
        root: 'C:\\Users\\castleadmin\\projects\\awesome',
        cwd: 'C:\\Users\\castleadmin\\projects\\awesome',
        isVerbose: false,
      };
    });

    describe('api', () => {
      it('Should start as API server.', async () => {
        options.api = true;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam local start-api --config-file "..\\samconfig.toml"',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\terraform',
            shell: undefined,
          },
        );
      });

      it("Shouldn't start as API server.", async () => {
        delete options.api;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam local start-lambda --config-file "..\\samconfig.toml"',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\terraform',
            shell: undefined,
          },
        );
      });
    });

    describe('args', () => {
      it('Should execute command with custom arguments.', async () => {
        options.args = '--debug --log-file "..\\log.txt"';

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam local start-lambda --config-file "..\\samconfig.toml" --debug --log-file "..\\log.txt"',
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
          'sam local start-lambda --config-file "..\\samconfig.toml"',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\terraform',
            shell: undefined,
          },
        );
      });
    });

    describe('additional args', () => {
      it('Should execute command with custom additional arguments.', async () => {
        (options as typeof options & { debug?: boolean })['debug'] = true;
        (options as typeof options & { 'log-file'?: string })['log-file'] =
          '..\\log.txt';

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam local start-lambda --config-file "..\\samconfig.toml" --debug --log-file "..\\log.txt"',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\terraform',
            shell: undefined,
          },
        );
      });

      it("Shouldn't execute command without custom additional arguments.", async () => {
        delete (options as typeof options & { debug?: boolean })['debug'];
        delete (options as typeof options & { 'log-file'?: string })[
          'log-file'
        ];

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam local start-lambda --config-file "..\\samconfig.toml"',
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
          'sam local start-lambda --config-file "..\\samconfig.toml"',
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
          'sam local start-lambda --config-file "..\\samconfig.toml"',
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
          'sam local start-lambda --config-file "..\\samconfig.toml"',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\terraform',
            shell: undefined,
          },
        );
      });
    });
  });
});