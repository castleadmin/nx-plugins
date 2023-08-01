import { EventExecutorSchema } from './schema';
import { executeCommand } from '../../utils/execute-command';
import { ExecutorContext } from '@nx/devkit';
import { getProjectRoot } from '../../utils/get-project-root';
import { join, relative } from 'node:path';

export const runExecutor = async (
  options: EventExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const projectRoot = getProjectRoot(context);

  const { samConfiguration, __unparsed__ } = options;
  const commandWorkingDirectory = join(context.root, projectRoot);

  const samConfigurationRelative = relative(
    commandWorkingDirectory,
    join(context.root, samConfiguration)
  );

  const generateEventCommand = `sam local generate-event --config-file ${samConfigurationRelative} ${__unparsed__.join(
    ' '
  )}`;

  const { stderr } = await executeCommand(generateEventCommand, {
    cwd: commandWorkingDirectory,
  });

  const success = !stderr;

  return {
    success,
  };
};

export default runExecutor;
