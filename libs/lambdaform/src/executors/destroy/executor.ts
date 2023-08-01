import { DestroyExecutorSchema } from './schema';
import { ExecutorContext } from '@nx/devkit';
import { executeCommand } from '../../utils/execute-command';
import { join } from 'node:path';

export const runExecutor = async (
  options: DestroyExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const { workspace, interactive, args, terraformDirectory } = options;

  const selectWorkspaceCommand = `terraform workspace select ${workspace}`;
  const destroyCommand = `terraform destroy -input=${interactive} ${
    args ?? ''
  }`;
  const combinedCommand = `${selectWorkspaceCommand} && ${destroyCommand}`;

  const { stderr } = await executeCommand(
    workspace ? combinedCommand : destroyCommand,
    { cwd: join(context.root, terraformDirectory) }
  );

  const success = !stderr;

  return {
    success,
  };
};

export default runExecutor;
