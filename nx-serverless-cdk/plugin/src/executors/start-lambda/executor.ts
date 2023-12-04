import { ExecutorContext } from '@nx/devkit';
import { resolve } from 'node:path';
import { executeCommand } from '../../utils/execute-command';
import { getProjectRoot } from '../../utils/get-project-root';
import { getSamconfigPath } from '../../utils/get-samconfig-path';
import { isWindows } from '../../utils/is-windows';
import { StartLambdaExecutorSchema } from './schema';

export const runExecutor = async (
  options: StartLambdaExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> => {
  const projectRootResolved = resolve(context.root, getProjectRoot(context));

  const { __unparsed__ } = options;
  const samconfigPath = getSamconfigPath(__unparsed__, projectRootResolved);
  const command = `sam`;

  let args = [...__unparsed__];
  if (samconfigPath) {
    args.unshift('--config-file', samconfigPath);
  }
  args.unshift('local', 'start-lambda');
  args = args.map((arg) => (isWindows() ? `"${arg}"` : arg));

  console.log('Executing command:', command, args.join(' '));

  await executeCommand(command, args, {
    cwd: projectRootResolved,
  });

  return {
    success: true,
  };
};

export default runExecutor;
