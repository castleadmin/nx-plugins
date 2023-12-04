import { ExecutorContext } from '@nx/devkit';
import { resolve } from 'node:path';
import { executeCommand } from '../../utils/execute-command';
import { getProjectRoot } from '../../utils/get-project-root';
import { GenerateEventExecutorSchema } from './schema';

export const runExecutor = async (
  options: GenerateEventExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> => {
  const projectRootResolved = resolve(context.root, getProjectRoot(context));

  const { __unparsed__ } = options;
  const command = `sam`;
  const args = ['local', 'generate-event', ...__unparsed__];

  await executeCommand(command, args, {
    cwd: projectRootResolved,
  });

  return {
    success: true,
  };
};

export default runExecutor;
