import { ServeExecutorSchema } from './schema';
import { ExecutorContext } from '@nx/devkit';
import { join, resolve, relative } from 'node:path';
import { executeCommand } from '../../utils/execute-command';
import { filterUnparsed } from '../../utils/filter-unparsed';

export const runExecutor = async (
  options: ServeExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const contextRootResolved = resolve(context.root);
  const { samConfiguration, terraformDirectory, api, args, __unparsed__ } =
    options;
  const filteredUnparsed = filterUnparsed(__unparsed__, [
    'samConfiguration',
    'terraformDirectory',
    'api',
    'args',
  ]);
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
    args ?? ''
  } ${filteredUnparsed.join(' ')}`;

  await executeCommand(startCommand, {
    cwd: workingDirectoryResolved,
  });

  return {
    success: true,
  };
};

export default runExecutor;
