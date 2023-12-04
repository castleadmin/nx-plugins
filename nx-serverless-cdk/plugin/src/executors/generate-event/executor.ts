import { ExecutorContext } from '@nx/devkit';
import { resolve } from 'node:path';
import { executeCommand } from '../../utils/execute-command';
import { getProjectRoot } from '../../utils/get-project-root';
import { isWindows } from '../../utils/is-windows';
import { GenerateEventExecutorSchema } from './schema';

export const runExecutor = async (
  options: GenerateEventExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> => {
  const projectRootResolved = resolve(context.root, getProjectRoot(context));

  const { __unparsed__ } = options;
  const command = `sam`;
  let args = ['local', 'generate-event', ...__unparsed__];
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
