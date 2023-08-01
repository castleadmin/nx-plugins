import { EventExecutorSchema } from './schema';
import { executeCommand } from '../../utils/execute-command';
import { ExecutorContext } from '@nx/devkit';
import { getProjectRoot } from '../../utils/get-project-root';
import { join } from 'node:path';

export const runExecutor = async (
  options: EventExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const projectRoot = getProjectRoot(context);

  const { __unparsed__ } = options;

  const generateEventCommand = `sam local generate-event ${__unparsed__.join(
    ' '
  )}`;

  const { stderr } = await executeCommand(generateEventCommand, {
    cwd: join(context.root, projectRoot),
  });

  const success = !stderr;

  return {
    success,
  };
};

export default runExecutor;
