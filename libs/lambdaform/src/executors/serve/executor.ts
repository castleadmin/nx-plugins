import { ServeExecutorSchema } from './schema';
import { ExecutorContext } from '@nx/devkit';
import { join, relative } from 'node:path';
import { executeCommand } from '../../utils/execute-command';

export const runExecutor = async (
  options: ServeExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const { samConfiguration, terraformDirectory, api, __unparsed__ } = options;
  const commandWorkingDirectory = join(context.root, terraformDirectory);

  const samConfigurationRelative = relative(
    commandWorkingDirectory,
    join(context.root, samConfiguration)
  );

  const samCommand = api ? 'sam local start-api' : 'sam local start-lambda';

  const startCommand = `${samCommand} --config-file ${samConfigurationRelative} ${__unparsed__.join(
    ' '
  )}`;

  const { stderr } = await executeCommand(startCommand, {
    cwd: commandWorkingDirectory,
  });

  const success = !stderr;

  return {
    success,
  };
};

export default runExecutor;
