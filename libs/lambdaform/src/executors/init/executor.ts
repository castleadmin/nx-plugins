import { InitExecutorSchema } from './schema';
import { ExecutorContext } from '@nx/devkit';
import { executeCommand } from '../../utils/execute-command';
import { join } from 'node:path';

export const runExecutor = async (
  options: InitExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const {
    workspace,
    createWorkspace,
    interactive,
    upgrade,
    args,
    terraformDirectory,
  } = options;

  const selectWorkspaceCommand = `terraform workspace select -or-create=${createWorkspace} ${workspace}`;
  const initCommand = `terraform init -input=${interactive} ${
    upgrade ? '-upgrade' : ''
  } ${args ?? ''}`;
  const combinedCommand = `${selectWorkspaceCommand} && ${initCommand}`;

  const { stderr } = await executeCommand(
    workspace ? combinedCommand : initCommand,
    {
      cwd: join(context.root, terraformDirectory),
    }
  );

  const success = !stderr;

  return {
    success,
  };
};

export default runExecutor;
