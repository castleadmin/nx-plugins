import { PlanExecutorSchema } from './schema';
import { ExecutorContext } from '@nx/devkit';
import { executeCommand } from '../../utils/execute-command';
import { join, resolve } from 'node:path';

export const runExecutor = async (
  options: PlanExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const contextRootResolved = resolve(context.root);
  const { workspace, interactive, args, planOutput, terraformDirectory } =
    options;

  const selectWorkspaceCommand = `terraform workspace select ${workspace}`;
  const planCommand = `terraform plan -input=${interactive} -out=${planOutput} ${
    args ?? ''
  }`;
  const combinedCommand = `${selectWorkspaceCommand} && ${planCommand}`;

  const { stderr } = await executeCommand(
    workspace ? combinedCommand : planCommand,
    { cwd: join(contextRootResolved, terraformDirectory) }
  );

  const success = !stderr;

  return {
    success,
  };
};

export default runExecutor;
