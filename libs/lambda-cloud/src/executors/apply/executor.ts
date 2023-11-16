import { ExecutorContext } from '@nx/devkit';
import { join, resolve } from 'node:path';
import { executeCommand } from '../../utils/execute-command';
import { ApplyExecutorSchema } from './schema';

export const runExecutor = async (
  options: ApplyExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const contextRootResolved = resolve(context.root);
  const {
    workspace,
    interactive,
    args,
    planOutput,
    terraformDirectory,
    shell,
  } = options;

  const selectWorkspaceCommand = `terraform workspace select ${workspace}`;
  const applyCommand = `terraform apply -input=${interactive}${
    args ? ` ${args}` : ''
  } "${planOutput}"`;
  const combinedCommand = `${selectWorkspaceCommand} && ${applyCommand}`;

  await executeCommand(workspace ? combinedCommand : applyCommand, {
    cwd: join(contextRootResolved, terraformDirectory),
    shell,
  });

  return {
    success: true,
  };
};

export default runExecutor;
