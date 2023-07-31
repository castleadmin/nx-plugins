import { ExecutorContext, joinPathFragments } from '@nx/devkit';
import { ApplyExecutorSchema } from './schema';
import { executeCommand } from '../../utils/execute-command';

export const runExecutor = async (
  options: ApplyExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const { workspace, interactive, args, planOutput, terraformDirectory } =
    options;

  const selectWorkspaceCommand = `terraform workspace select ${workspace}`;
  const applyCommand = `terraform apply -input=${interactive} ${
    args ?? ''
  } ${planOutput}`;
  const combinedCommand = `${selectWorkspaceCommand} && ${applyCommand}`;

  const { stderr } = await executeCommand(
    workspace ? combinedCommand : applyCommand,
    { cwd: joinPathFragments(context.root, terraformDirectory) }
  );

  const success = !stderr;

  return {
    success,
  };
};

export default runExecutor;
