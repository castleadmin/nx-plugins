import { InvokeExecutorSchema } from './schema';
import { executeCommand } from '../../utils/execute-command';
import { join, relative, resolve } from 'node:path';
import { ExecutorContext } from '@nx/devkit';
import { additionalArgsToString } from '../../utils/additional-args-to-string';

export const runExecutor = async (
  options: InvokeExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const contextRootResolved = resolve(context.root);

  const { samConfiguration, terraformDirectory, args, _, ...rest } = options;
  const additionalArgs = additionalArgsToString(_, rest);

  const workingDirectoryResolved = join(
    contextRootResolved,
    terraformDirectory
  );

  const samConfigurationRelative = relative(
    workingDirectoryResolved,
    join(contextRootResolved, samConfiguration)
  );

  const invokeCommand = `sam local invoke --config-file ${samConfigurationRelative} ${
    args ? `${args} ${additionalArgs}` : additionalArgs
  }`;
  console.log('Executing command:', invokeCommand);

  await executeCommand(invokeCommand, {
    cwd: workingDirectoryResolved,
  });

  return {
    success: true,
  };
};

export default runExecutor;
