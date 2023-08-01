import { InvokeExecutorSchema } from './schema';
import { executeCommand } from '../../utils/execute-command';
import { relative, join } from 'node:path';
import { ExecutorContext } from '@nx/devkit';

export const runExecutor = async (
  options: InvokeExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const { samConfiguration, terraformDirectory, args, __unparsed__ } = options;
  const commandWorkingDirectory = join(context.root, terraformDirectory);

  const samConfigurationRelative = relative(
    commandWorkingDirectory,
    join(context.root, samConfiguration)
  );

  const invokeCommand = `sam local invoke --config-file ${samConfigurationRelative} ${
    args ?? ''
  } ${__unparsed__.join(' ')}`;

  const { stderr } = await executeCommand(invokeCommand, {
    cwd: commandWorkingDirectory,
  });

  const success = !stderr;

  return {
    success,
  };
};

export default runExecutor;
