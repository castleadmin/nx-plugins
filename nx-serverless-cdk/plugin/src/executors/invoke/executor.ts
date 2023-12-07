import { ExecutorContext } from '@nx/devkit';
import { resolve } from 'node:path';
import { executeCommand } from '../../utils/execute-command';
import { getProjectRoot } from '../../utils/get-project-root';
import { getSamconfigPath } from '../../utils/get-samconfig-path';
import { InvokeExecutorSchema } from './schema';

export const runExecutor = async (
  options: InvokeExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> => {
  const projectRootResolved = resolve(context.root, getProjectRoot(context));

  const { predefinedArguments, __unparsed__ } = options;
  const samconfigPath = getSamconfigPath(__unparsed__, projectRootResolved);
  const command = `sam`;

  const args = [...(predefinedArguments ?? []), ...__unparsed__];
  if (samconfigPath) {
    args.unshift('--config-file', samconfigPath);
  }
  args.unshift('local', 'invoke');

  await executeCommand(command, args, {
    cwd: projectRootResolved,
  });

  return {
    success: true,
  };
};

export default runExecutor;
