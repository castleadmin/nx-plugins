import { InitExecutorSchema } from './schema';
import { ExecutorContext } from '@nx/devkit';
import { executeCommand } from '../../utils/execute-command';
import { join, resolve } from 'node:path';

export const runExecutor = async (
  options: InitExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const contextRootResolved = resolve(context.root);
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

  await executeCommand(workspace ? combinedCommand : initCommand, {
    cwd: join(contextRootResolved, terraformDirectory),
  });

  return {
    success: true,
  };
};

export default runExecutor;
