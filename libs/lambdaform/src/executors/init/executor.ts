import { InitExecutorSchema } from './schema';
import { ExecutorContext, joinPathFragments } from '@nx/devkit';
import { executeCommand } from '../../utils/execute-command';

export const runExecutor = async (
  options: InitExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const { workspace, interactive, upgrade, args, terraformDirectory } = options;

  const selectWorkspaceCommand = `terraform workspace select ${workspace}`;
  const initCommand = `terraform init -input=${interactive} ${
    upgrade ? '-upgrade' : ''
  } ${args ?? ''}`;
  const combinedCommand = `${selectWorkspaceCommand} && ${initCommand}`;

  const { stderr } = await executeCommand(
    workspace ? combinedCommand : initCommand,
    {
      cwd: joinPathFragments(context.root, terraformDirectory),
    }
  );

  const success = !stderr;

  return {
    success,
  };
};

export default runExecutor;
