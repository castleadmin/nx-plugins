import { ExecutorContext } from '@nx/devkit';
import { executeCommand } from '../../utils/execute-command';
import { useUnixPath, useWindowsPath } from '../../utils/path.mock.spec';
import executor from './executor';
import { ApplyExecutorSchema } from './schema';

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

describe('Apply Executor', () => {
  beforeEach(() => {
    (
      executeCommand as jest.MockedFunction<typeof executeCommand>
    ).mockImplementation(() => Promise.resolve(undefined));
  });

  describe('Unix', () => {
    let options: ApplyExecutorSchema;
    let context: ExecutorContext;

    beforeEach(() => {
      useUnixPath();

      options = {
        workspace: 'app_test',
        interactive: false,
        planOutput: 'tfplan',
        terraformDirectory: 'apps/test/terraform',
      };

      context = {
        root: '/home/castleadmin/projects/awesome',
        cwd: '/home/castleadmin/projects/awesome',
        isVerbose: false,
      };
    });

    describe('workspace', () => {
      it('Should select the workspace.', async () => {
        options.workspace = 'app_test';

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'terraform workspace select app_test && terraform apply -input=false "tfplan"',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/terraform',
            shell: undefined,
          }
        );
      });

      it("Shouldn't select a workspace.", async () => {
        delete options.workspace;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'terraform apply -input=false "tfplan"',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/terraform',
            shell: undefined,
          }
        );
      });
    });

    describe('interactive', () => {
      it('Should execute command interactively.', async () => {
        options.interactive = true;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'terraform workspace select app_test && terraform apply -input=true "tfplan"',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/terraform',
            shell: undefined,
          }
        );
      });

      it("Shouldn't execute command interactively.", async () => {
        options.interactive = false;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'terraform workspace select app_test && terraform apply -input=false "tfplan"',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/terraform',
            shell: undefined,
          }
        );
      });
    });

    describe('args', () => {
      it('Should execute command with custom arguments.', async () => {
        options.args = '-no-color -parallelism=8';

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'terraform workspace select app_test && terraform apply -input=false -no-color -parallelism=8 "tfplan"',
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
          'terraform workspace select app_test && terraform apply -input=false "tfplan"',
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
          'terraform workspace select app_test && terraform apply -input=false "tfplan"',
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
          'terraform workspace select app_test && terraform apply -input=false "tfplan"',
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
          'terraform workspace select app_test && terraform apply -input=false "tfplan"',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/terraform',
            shell: undefined,
          }
        );
      });
    });
  });

  describe('Windows', () => {
    let options: ApplyExecutorSchema;
    let context: ExecutorContext;

    beforeEach(() => {
      useWindowsPath();

      options = {
        workspace: 'app_test',
        interactive: false,
        planOutput: 'tfplan',
        terraformDirectory: 'apps/test/terraform',
      };

      context = {
        root: 'C:\\Users\\castleadmin\\projects\\awesome',
        cwd: 'C:\\Users\\castleadmin\\projects\\awesome',
        isVerbose: false,
      };
    });

    describe('workspace', () => {
      it('Should select the workspace.', async () => {
        options.workspace = 'app_test';

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'terraform workspace select app_test && terraform apply -input=false "tfplan"',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\terraform',
            shell: undefined,
          }
        );
      });

      it("Shouldn't select a workspace.", async () => {
        delete options.workspace;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'terraform apply -input=false "tfplan"',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\terraform',
            shell: undefined,
          }
        );
      });
    });

    describe('interactive', () => {
      it('Should execute command interactively.', async () => {
        options.interactive = true;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'terraform workspace select app_test && terraform apply -input=true "tfplan"',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\terraform',
            shell: undefined,
          }
        );
      });

      it("Shouldn't execute command interactively.", async () => {
        options.interactive = false;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'terraform workspace select app_test && terraform apply -input=false "tfplan"',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\terraform',
            shell: undefined,
          }
        );
      });
    });

    describe('args', () => {
      it('Should execute command with custom arguments.', async () => {
        options.args = '-no-color -parallelism=8';

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'terraform workspace select app_test && terraform apply -input=false -no-color -parallelism=8 "tfplan"',
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
          'terraform workspace select app_test && terraform apply -input=false "tfplan"',
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
          'terraform workspace select app_test && terraform apply -input=false "tfplan"',
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
          'terraform workspace select app_test && terraform apply -input=false "tfplan"',
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
          'terraform workspace select app_test && terraform apply -input=false "tfplan"',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\terraform',
            shell: undefined,
          }
        );
      });
    });
  });
});
