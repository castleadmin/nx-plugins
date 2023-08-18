import { ExecutorContext } from '@nx/devkit';
import { join, resolve } from 'node:path';
import { executeCommand } from '../../utils/execute-command';
import { PlanExecutorSchema } from './schema';

export const runExecutor = async (
  options: PlanExecutorSchema,
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
  const planCommand = `terraform plan -input=${interactive} -out=${planOutput}${
    args ? ` ${args}` : ''
  }`;
  const combinedCommand = `${selectWorkspaceCommand} && ${planCommand}`;

  await executeCommand(workspace ? combinedCommand : planCommand, {
    cwd: join(contextRootResolved, terraformDirectory),
    shell,
  });

  return {
    success: true,
  };
};

export default runExecutor;
