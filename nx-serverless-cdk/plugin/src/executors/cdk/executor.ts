import { ExecutorContext } from '@nx/devkit';
import { resolve } from 'node:path';
import { executeCommand } from '../../utils/execute-command';
import { getProjectRoot } from '../../utils/get-project-root';
import { CdkExecutorSchema } from './schema';

export const runExecutor = async (
  options: CdkExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> => {
  const projectRootResolved = resolve(context.root, getProjectRoot(context));

  const { predefinedArguments, __unparsed__ } = options;
  const command = `npx`;
  const args = ['aws-cdk', ...(predefinedArguments ?? []), ...__unparsed__];

  await executeCommand(command, args, {
    cwd: projectRootResolved,
  });

  return {
    success: true,
  };
};

export default runExecutor;
