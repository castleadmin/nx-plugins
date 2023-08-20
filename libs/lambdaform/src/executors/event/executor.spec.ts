import { ExecutorContext } from '@nx/devkit';
import { mkdir, writeFile } from 'node:fs/promises';
import { executeCommandBufferResults } from '../../utils/execute-command';
import { useUnixPath, useWindowsPath } from '../../utils/path.mock.spec';
import executor from './executor';
import { EventExecutorSchema } from './schema';

jest.mock('node:fs/promises');

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

describe('Event Executor', () => {
  beforeEach(() => {
    (
      executeCommandBufferResults as jest.MockedFunction<
        typeof executeCommandBufferResults
      >
    ).mockImplementation(() =>
      Promise.resolve({
        stdout: JSON.stringify({ test: 'event' }, null, 2),
        stderr: '',
      })
    );
  });

  describe('Unix', () => {
    let options: EventExecutorSchema;
    let context: ExecutorContext;

    beforeEach(() => {
      useUnixPath();

      options = {
        eventsDirectory: 'apps/test/events',
      };

      context = {
        root: '/home/castleadmin/projects/awesome',
        cwd: '/home/castleadmin/projects/awesome',
        isVerbose: false,
      };
    });

    describe('args', () => {
      it('Should execute command with custom arguments.', async () => {
        options.args =
          'cloudwatch scheduled-event --region "eu-central-1" --account-id "123456789876"';

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommandBufferResults).toHaveBeenCalledTimes(1);
        expect(executeCommandBufferResults).toHaveBeenCalledWith(
          'sam local generate-event cloudwatch scheduled-event --region "eu-central-1" --account-id "123456789876"',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/events',
            shell: undefined,
          }
        );
        expect(mkdir).toHaveBeenCalledTimes(0);
        expect(writeFile).toHaveBeenCalledTimes(0);
      });

      it("Shouldn't execute command without custom arguments.", async () => {
        delete options.args;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommandBufferResults).toHaveBeenCalledTimes(1);
        expect(executeCommandBufferResults).toHaveBeenCalledWith(
          'sam local generate-event',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/events',
            shell: undefined,
          }
        );
        expect(mkdir).toHaveBeenCalledTimes(0);
        expect(writeFile).toHaveBeenCalledTimes(0);
      });
    });

    describe('additional args', () => {
      it('Should execute command with custom additional arguments.', async () => {
        options._ = ['cloudwatch', 'scheduled-event'];
        (options as any)['region'] = 'eu-central-1';
        (options as any)['account-id'] = '123456789876';

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommandBufferResults).toHaveBeenCalledTimes(1);
        expect(executeCommandBufferResults).toHaveBeenCalledWith(
          'sam local generate-event cloudwatch scheduled-event --region "eu-central-1" --account-id "123456789876"',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/events',
            shell: undefined,
          }
        );
        expect(mkdir).toHaveBeenCalledTimes(0);
        expect(writeFile).toHaveBeenCalledTimes(0);
      });

      it("Shouldn't execute command without custom additional arguments.", async () => {
        delete options._;
        delete (options as any)['region'];
        delete (options as any)['account-id'];

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommandBufferResults).toHaveBeenCalledTimes(1);
        expect(executeCommandBufferResults).toHaveBeenCalledWith(
          'sam local generate-event',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/events',
            shell: undefined,
          }
        );
        expect(mkdir).toHaveBeenCalledTimes(0);
        expect(writeFile).toHaveBeenCalledTimes(0);
      });
    });

    describe('save', () => {
      it('Should save the stdout of the command to an event file.', async () => {
        options.save = 'abc/def/test.json';

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommandBufferResults).toHaveBeenCalledTimes(1);
        expect(executeCommandBufferResults).toHaveBeenCalledWith(
          'sam local generate-event',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/events',
            shell: undefined,
          }
        );
        expect(mkdir).toHaveBeenCalledTimes(1);
        expect(mkdir).toHaveBeenCalledWith(
          '/home/castleadmin/projects/awesome/apps/test/events/abc/def',
          { recursive: true }
        );
        expect(writeFile).toHaveBeenCalledTimes(1);
        expect(writeFile).toHaveBeenCalledWith(
          '/home/castleadmin/projects/awesome/apps/test/events/abc/def/test.json',
          JSON.stringify({ test: 'event' }, null, 2),
          {
            encoding: 'utf8',
          }
        );
      });

      it("Shouldn't save the stdout of the command to an event file.", async () => {
        delete options.save;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommandBufferResults).toHaveBeenCalledTimes(1);
        expect(executeCommandBufferResults).toHaveBeenCalledWith(
          'sam local generate-event',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/events',
            shell: undefined,
          }
        );
        expect(mkdir).toHaveBeenCalledTimes(0);
        expect(writeFile).toHaveBeenCalledTimes(0);
      });
    });

    describe('shell', () => {
      it('Should execute command with a specific shell.', async () => {
        options.shell = '/bin/bash';

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommandBufferResults).toHaveBeenCalledTimes(1);
        expect(executeCommandBufferResults).toHaveBeenCalledWith(
          'sam local generate-event',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/events',
            shell: '/bin/bash',
          }
        );
        expect(mkdir).toHaveBeenCalledTimes(0);
        expect(writeFile).toHaveBeenCalledTimes(0);
      });

      it('Should execute command with the default shell.', async () => {
        delete options.shell;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommandBufferResults).toHaveBeenCalledTimes(1);
        expect(executeCommandBufferResults).toHaveBeenCalledWith(
          'sam local generate-event',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/events',
            shell: undefined,
          }
        );
        expect(mkdir).toHaveBeenCalledTimes(0);
        expect(writeFile).toHaveBeenCalledTimes(0);
      });
    });

    describe('errors', () => {
      it('Should throw an error if the command fails to execute successfully.', async () => {
        (
          executeCommandBufferResults as jest.MockedFunction<
            typeof executeCommandBufferResults
          >
        ).mockImplementationOnce(() => Promise.reject(new Error('Test error')));

        await expect(executor(options, context)).rejects.toBeInstanceOf(Error);

        expect(executeCommandBufferResults).toHaveBeenCalledTimes(1);
        expect(executeCommandBufferResults).toHaveBeenCalledWith(
          'sam local generate-event',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/events',
            shell: undefined,
          }
        );
        expect(mkdir).toHaveBeenCalledTimes(0);
        expect(writeFile).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('Windows', () => {
    let options: EventExecutorSchema;
    let context: ExecutorContext;

    beforeEach(() => {
      useWindowsPath();

      options = {
        eventsDirectory: 'apps/test/events',
      };

      context = {
        root: 'C:\\Users\\castleadmin\\projects\\awesome',
        cwd: 'C:\\Users\\castleadmin\\projects\\awesome',
        isVerbose: false,
      };
    });

    describe('args', () => {
      it('Should execute command with custom arguments.', async () => {
        options.args =
          'cloudwatch scheduled-event --region "eu-central-1" --account-id "123456789876"';

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommandBufferResults).toHaveBeenCalledTimes(1);
        expect(executeCommandBufferResults).toHaveBeenCalledWith(
          'sam local generate-event cloudwatch scheduled-event --region "eu-central-1" --account-id "123456789876"',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\events',
            shell: undefined,
          }
        );
        expect(mkdir).toHaveBeenCalledTimes(0);
        expect(writeFile).toHaveBeenCalledTimes(0);
      });

      it("Shouldn't execute command without custom arguments.", async () => {
        delete options.args;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommandBufferResults).toHaveBeenCalledTimes(1);
        expect(executeCommandBufferResults).toHaveBeenCalledWith(
          'sam local generate-event',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\events',
            shell: undefined,
          }
        );
        expect(mkdir).toHaveBeenCalledTimes(0);
        expect(writeFile).toHaveBeenCalledTimes(0);
      });
    });

    describe('additional args', () => {
      it('Should execute command with custom additional arguments.', async () => {
        options._ = ['cloudwatch', 'scheduled-event'];
        (options as any)['region'] = 'eu-central-1';
        (options as any)['account-id'] = '123456789876';

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommandBufferResults).toHaveBeenCalledTimes(1);
        expect(executeCommandBufferResults).toHaveBeenCalledWith(
          'sam local generate-event cloudwatch scheduled-event --region "eu-central-1" --account-id "123456789876"',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\events',
            shell: undefined,
          }
        );
        expect(mkdir).toHaveBeenCalledTimes(0);
        expect(writeFile).toHaveBeenCalledTimes(0);
      });

      it("Shouldn't execute command without custom additional arguments.", async () => {
        delete options._;
        delete (options as any)['region'];
        delete (options as any)['account-id'];

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommandBufferResults).toHaveBeenCalledTimes(1);
        expect(executeCommandBufferResults).toHaveBeenCalledWith(
          'sam local generate-event',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\events',
            shell: undefined,
          }
        );
        expect(mkdir).toHaveBeenCalledTimes(0);
        expect(writeFile).toHaveBeenCalledTimes(0);
      });
    });

    describe('save', () => {
      it('Should save the stdout of the command to an event file.', async () => {
        options.save = 'abc/def/test.json';

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommandBufferResults).toHaveBeenCalledTimes(1);
        expect(executeCommandBufferResults).toHaveBeenCalledWith(
          'sam local generate-event',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\events',
            shell: undefined,
          }
        );
        expect(mkdir).toHaveBeenCalledTimes(1);
        expect(mkdir).toHaveBeenCalledWith(
          'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\events\\abc\\def',
          { recursive: true }
        );
        expect(writeFile).toHaveBeenCalledTimes(1);
        expect(writeFile).toHaveBeenCalledWith(
          'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\events\\abc\\def\\test.json',
          JSON.stringify({ test: 'event' }, null, 2),
          {
            encoding: 'utf8',
          }
        );
      });

      it("Shouldn't save the stdout of the command to an event file.", async () => {
        delete options.save;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommandBufferResults).toHaveBeenCalledTimes(1);
        expect(executeCommandBufferResults).toHaveBeenCalledWith(
          'sam local generate-event',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\events',
            shell: undefined,
          }
        );
        expect(mkdir).toHaveBeenCalledTimes(0);
        expect(writeFile).toHaveBeenCalledTimes(0);
      });
    });

    describe('shell', () => {
      it('Should execute command with a specific shell.', async () => {
        options.shell = 'powershell.exe';

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommandBufferResults).toHaveBeenCalledTimes(1);
        expect(executeCommandBufferResults).toHaveBeenCalledWith(
          'sam local generate-event',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\events',
            shell: 'powershell.exe',
          }
        );
        expect(mkdir).toHaveBeenCalledTimes(0);
        expect(writeFile).toHaveBeenCalledTimes(0);
      });

      it('Should execute command with the default shell.', async () => {
        delete options.shell;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommandBufferResults).toHaveBeenCalledTimes(1);
        expect(executeCommandBufferResults).toHaveBeenCalledWith(
          'sam local generate-event',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\events',
            shell: undefined,
          }
        );
        expect(mkdir).toHaveBeenCalledTimes(0);
        expect(writeFile).toHaveBeenCalledTimes(0);
      });
    });

    describe('errors', () => {
      it('Should throw an error if the command fails to execute successfully.', async () => {
        (
          executeCommandBufferResults as jest.MockedFunction<
            typeof executeCommandBufferResults
          >
        ).mockImplementationOnce(() => Promise.reject(new Error('Test error')));

        await expect(executor(options, context)).rejects.toBeInstanceOf(Error);

        expect(executeCommandBufferResults).toHaveBeenCalledTimes(1);
        expect(executeCommandBufferResults).toHaveBeenCalledWith(
          'sam local generate-event',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\events',
            shell: undefined,
          }
        );
        expect(mkdir).toHaveBeenCalledTimes(0);
        expect(writeFile).toHaveBeenCalledTimes(0);
      });
    });
  });
});
