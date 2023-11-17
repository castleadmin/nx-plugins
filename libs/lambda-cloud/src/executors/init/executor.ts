import { ExecutorContext } from '@nx/devkit';
import { join, resolve } from 'node:path';
import { executeCommand } from '../../utils/execute-command';
import { InitExecutorSchema } from './schema';

export const runExecutor = async (
  options: InitExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> => {
  const contextRootResolved = resolve(context.root);
  const {
    workspace,
    createWorkspace,
    interactive,
    upgrade,
    args,
    terraformDirectory,
    shell,
  } = options;

  const selectWorkspaceCommand = `terraform workspace select -or-create=${createWorkspace} ${workspace}`;
  const initCommand = `terraform init -input=${interactive}${
    upgrade ? ' -upgrade' : ''
  }${args ? ` ${args}` : ''}`;
  const combinedCommand = `${selectWorkspaceCommand} && ${initCommand}`;

  await executeCommand(workspace ? combinedCommand : initCommand, {
    cwd: join(contextRootResolved, terraformDirectory),
    shell,
  });

  return {
    success: true,
  };
};

export default runExecutor;
