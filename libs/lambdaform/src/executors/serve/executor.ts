import { ServeExecutorSchema } from './schema';
import { ExecutorContext } from '@nx/devkit';
import { getProjectRoot } from '../../utils/get-project-root';
import { join, relative } from 'node:path';
import { executeCommand } from '../../utils/execute-command';

export const runExecutor = async (
  options: ServeExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const projectRoot = getProjectRoot(context);
  const samConfigDirRelative = relative(
    join(context.root, options.terraformDirectory),
    join(context.root, projectRoot)
  );

  const { __unparsed__ } = options;
  const samCommand = options.api
    ? 'sam local start-api'
    : 'sam local start-lambda';

  const startCommand = `${samCommand} --config-file ${join(
    samConfigDirRelative,
    'samconfig.toml'
  )} ${__unparsed__.join(' ')}`;

  const { stderr } = await executeCommand(startCommand, {
    cwd: join(context.root, options.terraformDirectory),
  });

  const success = !stderr;

  return {
    success,
  };
};

export default runExecutor;
