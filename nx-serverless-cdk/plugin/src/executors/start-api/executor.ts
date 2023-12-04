import { ExecutorContext } from '@nx/devkit';
import { resolve } from 'node:path';
import { executeCommand } from '../../utils/execute-command';
import { getProjectRoot } from '../../utils/get-project-root';
import { getSamconfigPath } from '../../utils/get-samconfig-path';
import { StartApiExecutorSchema } from './schema';

export const runExecutor = async (
  options: StartApiExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> => {
  const projectRootResolved = resolve(context.root, getProjectRoot(context));

  const { __unparsed__ } = options;
  const samconfigPath = getSamconfigPath(__unparsed__, projectRootResolved);
  const command = `sam`;

  const args = [...__unparsed__];
  if (samconfigPath) {
    args.unshift('--config-file', samconfigPath);
  }
  args.unshift('local', 'start-api');

  await executeCommand(command, args, {
    cwd: projectRootResolved,
  });

  return {
    success: true,
  };
};

export default runExecutor;
