import { DestroyExecutorSchema } from './schema';
import { ExecutorContext } from '@nx/devkit';
import { executeCommand } from '../../utils/execute-command';
import { join, resolve } from 'node:path';

export const runExecutor = async (
  options: DestroyExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const contextRootResolved = resolve(context.root);
  const { workspace, interactive, args, terraformDirectory } = options;

  const selectWorkspaceCommand = `terraform workspace select ${workspace}`;
  const destroyCommand = `terraform destroy -input=${interactive} ${
    args ?? ''
  }`;
  const combinedCommand = `${selectWorkspaceCommand} && ${destroyCommand}`;

  await executeCommand(workspace ? combinedCommand : destroyCommand, {
    cwd: join(contextRootResolved, terraformDirectory),
  });

  return {
    success: true,
  };
};

export default runExecutor;
