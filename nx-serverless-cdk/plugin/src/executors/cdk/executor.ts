import { ExecutorContext } from '@nx/devkit';
import { resolve } from 'node:path';
import { executeCommand } from '../../utils/execute-command';
import { getProjectRoot } from '../../utils/get-project-root';
import { isWindows } from '../../utils/is-windows';
import { CdkExecutorSchema } from './schema';

export const runExecutor = async (
  options: CdkExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> => {
  const projectRootResolved = resolve(context.root, getProjectRoot(context));

  const { __unparsed__ } = options;
  const command = `npx`;
  let args = ['aws-cdk', ...__unparsed__];
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
