import { ExecutorContext } from '@nx/devkit';
import { executeCommand } from '../../utils/execute-command';
import * as isWindowsModule from '../../utils/is-windows';
import { useUnixPath, useWindowsPath } from '../../utils/path.mock.spec';
import executor from './executor';
import { StartLambdaExecutorSchema } from './schema';

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

describe('start-lambda', () => {
  beforeEach(() => {
    (
      executeCommand as jest.MockedFunction<typeof executeCommand>
    ).mockImplementation(() => Promise.resolve(undefined));
  });

  describe('unix', () => {
    let context: ExecutorContext;

    beforeEach(() => {
      useUnixPath();
      jest.spyOn(isWindowsModule, 'isWindows').mockImplementation(() => false);

      context = {
        root: '/home/castleadmin/projects/awesome',
        cwd: '/home/castleadmin/projects/awesome',
        projectName: 'test',
        projectsConfigurations: {
          version: 1,
          projects: {
            test: {
              root: 'apps/test',
            },
          },
        },
        isVerbose: false,
      };
    });

    test('Given the -h arg, the command should be executed successfully.', async () => {
      const output = await executor({ __unparsed__: ['-h'] }, context);

      expect(output.success).toBe(true);
      expect(executeCommand).toHaveBeenCalledTimes(1);
      expect(executeCommand).toHaveBeenCalledWith(
        'sam',
        ['local', 'start-lambda', '-h'],
        {
          cwd: '/home/castleadmin/projects/awesome/apps/test',
        },
      );
    });

    describe('Given a command with 2 arguments,', () => {
      let options: StartLambdaExecutorSchema;

      beforeEach(() => {
        options = {
          __unparsed__: ['--debug', '--template=cdk.out/test.template.json'],
        };
      });

      test('the command should be executed successfully.', async () => {
        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam',
          [
            'local',
            'start-lambda',
            '--config-file',
            '../samconfig.toml',
            ...options.__unparsed__,
          ],
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test',
          },
        );
      });

      test('should throw an error if the command fails to execute successfully.', async () => {
        (
          executeCommand as jest.MockedFunction<typeof executeCommand>
        ).mockImplementationOnce(() => Promise.reject(new Error('Test error')));

        await expect(executor(options, context)).rejects.toBeInstanceOf(Error);

        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam',
          [
            'local',
            'start-lambda',
            '--config-file',
            '../samconfig.toml',
            ...options.__unparsed__,
          ],
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test',
          },
        );
      });
    });

    describe('Given a command with 2 arguments and 2 predefined arguments,', () => {
      let options: StartLambdaExecutorSchema;

      beforeEach(() => {
        options = {
          predefinedArguments: ['--debug-port', '9229'],
          __unparsed__: ['--debug', '--template=cdk.out/test.template.json'],
        };
      });

      test('the command should be executed successfully.', async () => {
        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam',
          [
            'local',
            'start-lambda',
            '--config-file',
            '../samconfig.toml',
            ...(options.predefinedArguments as string[]),
            ...options.__unparsed__,
          ],
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test',
          },
        );
      });

      test('should throw an error if the command fails to execute successfully.', async () => {
        (
          executeCommand as jest.MockedFunction<typeof executeCommand>
        ).mockImplementationOnce(() => Promise.reject(new Error('Test error')));

        await expect(executor(options, context)).rejects.toBeInstanceOf(Error);

        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam',
          [
            'local',
            'start-lambda',
            '--config-file',
            '../samconfig.toml',
            ...(options.predefinedArguments as string[]),
            ...options.__unparsed__,
          ],
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test',
          },
        );
      });
    });
  });

  describe('windows', () => {
    let context: ExecutorContext;

    beforeEach(() => {
      useWindowsPath();
      jest.spyOn(isWindowsModule, 'isWindows').mockImplementation(() => true);

      context = {
        root: 'C:\\Users\\castleadmin\\projects\\awesome',
        cwd: 'C:\\Users\\castleadmin\\projects\\awesome',
        projectName: 'test',
        projectsConfigurations: {
          version: 1,
          projects: {
            test: {
              root: 'apps/test',
            },
          },
        },
        isVerbose: false,
      };
    });

    test('Given the -h arg, the command should be executed successfully.', async () => {
      const output = await executor({ __unparsed__: ['-h'] }, context);

      expect(output.success).toBe(true);
      expect(executeCommand).toHaveBeenCalledTimes(1);
      expect(executeCommand).toHaveBeenCalledWith(
        'sam',
        ['local', 'start-lambda', '-h'],
        {
          cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test',
        },
      );
    });

    describe('Given a command with 2 arguments,', () => {
      let options: StartLambdaExecutorSchema;

      beforeEach(() => {
        options = {
          __unparsed__: ['--debug', '--template=cdk.out/test.template.json'],
        };
      });

      test('the command should be executed successfully.', async () => {
        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam',
          [
            'local',
            'start-lambda',
            '--config-file',
            '..\\samconfig.toml',
            ...options.__unparsed__,
          ],
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test',
          },
        );
      });

      test('should throw an error if the command fails to execute successfully.', async () => {
        (
          executeCommand as jest.MockedFunction<typeof executeCommand>
        ).mockImplementationOnce(() => Promise.reject(new Error('Test error')));

        await expect(executor(options, context)).rejects.toBeInstanceOf(Error);

        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam',
          [
            'local',
            'start-lambda',
            '--config-file',
            '..\\samconfig.toml',
            ...options.__unparsed__,
          ],
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test',
          },
        );
      });
    });

    describe('Given a command with 2 arguments and 2 predefined arguments,', () => {
      let options: StartLambdaExecutorSchema;

      beforeEach(() => {
        options = {
          predefinedArguments: ['--debug-port', '9229'],
          __unparsed__: ['--debug', '--template=cdk.out/test.template.json'],
        };
      });

      test('the command should be executed successfully.', async () => {
        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam',
          [
            'local',
            'start-lambda',
            '--config-file',
            '..\\samconfig.toml',
            ...(options.predefinedArguments as string[]),
            ...options.__unparsed__,
          ],
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test',
          },
        );
      });

      test('should throw an error if the command fails to execute successfully.', async () => {
        (
          executeCommand as jest.MockedFunction<typeof executeCommand>
        ).mockImplementationOnce(() => Promise.reject(new Error('Test error')));

        await expect(executor(options, context)).rejects.toBeInstanceOf(Error);

        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'sam',
          [
            'local',
            'start-lambda',
            '--config-file',
            '..\\samconfig.toml',
            ...(options.predefinedArguments as string[]),
            ...options.__unparsed__,
          ],
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test',
          },
        );
      });
    });
  });
});
