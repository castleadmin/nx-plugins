import { ExecutorContext } from '@nx/devkit';
import { ApplyExecutorSchema } from './schema';
import { executeCommand } from '../../utils/execute-command';
import { join, resolve } from 'node:path';

export const runExecutor = async (
  options: ApplyExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const contextRootResolved = resolve(context.root);
  const { workspace, interactive, args, planOutput, terraformDirectory } =
    options;

  const selectWorkspaceCommand = `terraform workspace select ${workspace}`;
  const applyCommand = `terraform apply -input=${interactive} ${
    args ?? ''
  } ${planOutput}`;
  const combinedCommand = `${selectWorkspaceCommand} && ${applyCommand}`;

  await executeCommand(workspace ? combinedCommand : applyCommand, {
    cwd: join(contextRootResolved, terraformDirectory),
  });

  return {
    success: true,
  };
};

export default runExecutor;
