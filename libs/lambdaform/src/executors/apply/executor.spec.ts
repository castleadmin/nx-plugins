import { ApplyExecutorSchema } from './schema';
import executor from './executor';
import { useUnixPath, useWindowsPath } from '../../utils/path.mock.spec';
import { executeCommand } from '../../utils/execute-command';
import { ExecutorContext } from '@nx/devkit';

jest.mock('node:path', () => {
  const originalModule = jest.requireActual('node:path');

  return {
    __esModule: true,
    ...originalModule,
    join: jest.fn(),
    normalize: jest.fn(),
    resolve: jest.fn(),
  };
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
      it('Should select the workspace', async () => {
        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'terraform workspace select app_test && terraform apply -input=false tfplan',
          {
            cwd: '/home/castleadmin/projects/awesome/apps/test/terraform',
            shell: undefined,
          }
        );
      });

      it("Shouldn't select a workspace", async () => {
        delete options.workspace;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'terraform apply -input=false tfplan',
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
      it('Should select the workspace', async () => {
        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'terraform workspace select app_test && terraform apply -input=false tfplan',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\terraform',
            shell: undefined,
          }
        );
      });

      it("Shouldn't select a workspace", async () => {
        delete options.workspace;

        const output = await executor(options, context);

        expect(output.success).toBe(true);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
          'terraform apply -input=false tfplan',
          {
            cwd: 'C:\\Users\\castleadmin\\projects\\awesome\\apps\\test\\terraform',
            shell: undefined,
          }
        );
      });
    });
  });
});
