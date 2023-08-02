import { InvokeExecutorSchema } from './schema';
import { executeCommand } from '../../utils/execute-command';
import { join, relative, resolve } from 'node:path';
import { ExecutorContext } from '@nx/devkit';
import { filterUnparsed } from '../../utils/filter-unparsed';

export const runExecutor = async (
  options: InvokeExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const contextRootResolved = resolve(context.root);
  const { samConfiguration, terraformDirectory, args, __unparsed__ } = options;
  const filteredUnparsed = filterUnparsed(__unparsed__, [
    'samConfiguration',
    'terraformDirectory',
    'args',
  ]);
  const workingDirectoryResolved = join(
    contextRootResolved,
    terraformDirectory
  );

  const samConfigurationRelative = relative(
    workingDirectoryResolved,
    join(contextRootResolved, samConfiguration)
  );

  const invokeCommand = `sam local invoke --config-file ${samConfigurationRelative} ${
    args ?? ''
  } ${filteredUnparsed.join(' ')}`;

  await executeCommand(invokeCommand, {
    cwd: workingDirectoryResolved,
  });

  return {
    success: true,
  };
};

export default runExecutor;
