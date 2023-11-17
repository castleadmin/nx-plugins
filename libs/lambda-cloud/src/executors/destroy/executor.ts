import { ExecutorContext } from '@nx/devkit';
import { join, resolve } from 'node:path';
import { executeCommand } from '../../utils/execute-command';
import { DestroyExecutorSchema } from './schema';

export const runExecutor = async (
  options: DestroyExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> => {
  const contextRootResolved = resolve(context.root);
  const { workspace, interactive, args, terraformDirectory, shell } = options;

  const selectWorkspaceCommand = `terraform workspace select ${workspace}`;
  const destroyCommand = `terraform destroy -input=${interactive}${
    args ? ` ${args}` : ''
  }`;
  const combinedCommand = `${selectWorkspaceCommand} && ${destroyCommand}`;

  await executeCommand(workspace ? combinedCommand : destroyCommand, {
    cwd: join(contextRootResolved, terraformDirectory),
    shell,
  });

  return {
    success: true,
  };
};

export default runExecutor;
