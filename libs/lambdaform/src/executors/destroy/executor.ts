import { DestroyExecutorSchema } from './schema';
import { ExecutorContext, joinPathFragments } from '@nx/devkit';
import { getProjectRoot } from '../../utils/getProjectRoot';
import { executeCommand } from '../../utils/executeCommand';

export const runExecutor = async (
  options: DestroyExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const project = getProjectRoot(context);

  const { workspace, interactive, args, terraformDirectory } = options;

  const selectWorkspaceCommand = `terraform workspace select ${workspace}`;
  const destroyCommand = `terraform destroy -input=${interactive} ${
    args ?? ''
  }`;
  const combinedCommand = `${selectWorkspaceCommand} && ${destroyCommand}`;

  const { stderr } = await executeCommand(
    workspace ? combinedCommand : destroyCommand,
    { cwd: joinPathFragments(context.root, project, terraformDirectory) }
  );

  const success = !stderr;

  return {
    success,
  };
};

export default runExecutor;
