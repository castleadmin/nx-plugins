import { PlanExecutorSchema } from './schema';
import { ExecutorContext, joinPathFragments } from '@nx/devkit';
import { executeCommand } from '../../utils/execute-command';

export const runExecutor = async (
  options: PlanExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const { workspace, interactive, args, planOutput, terraformDirectory } =
    options;

  const selectWorkspaceCommand = `terraform workspace select ${workspace}`;
  const planCommand = `terraform plan -input=${interactive} -out=${planOutput} ${
    args ?? ''
  }`;
  const combinedCommand = `${selectWorkspaceCommand} && ${planCommand}`;

  const { stderr } = await executeCommand(
    workspace ? combinedCommand : planCommand,
    { cwd: joinPathFragments(context.root, terraformDirectory) }
  );

  const success = !stderr;

  return {
    success,
  };
};

export default runExecutor;
