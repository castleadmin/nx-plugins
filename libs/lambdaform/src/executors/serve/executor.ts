import { ExecutorContext } from '@nx/devkit';
import { join, relative, resolve } from 'node:path';
import { additionalArgsToString } from '../../utils/additional-args-to-string';
import { executeCommand } from '../../utils/execute-command';
import { ServeExecutorSchema } from './schema';

export const runExecutor = async (
  options: ServeExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const contextRootResolved = resolve(context.root);

  const { samConfiguration, terraformDirectory, api, args, shell, _, ...rest } =
    options;
  const additionalArgs = additionalArgsToString(_, rest);

  const workingDirectoryResolved = join(
    contextRootResolved,
    terraformDirectory
  );

  const samConfigurationRelative = relative(
    workingDirectoryResolved,
    join(context.root, samConfiguration)
  );

  const samCommand = api ? 'sam local start-api' : 'sam local start-lambda';

  const startCommand = `${samCommand} --config-file ${samConfigurationRelative} ${
    args ? `${args} ${additionalArgs}` : additionalArgs
  }`;
  console.log('Executing command:', startCommand);

  await executeCommand(startCommand, {
    cwd: workingDirectoryResolved,
    shell,
  });

  return {
    success: true,
  };
};

export default runExecutor;
