import { InvokeExecutorSchema } from './schema';
import { getProjectRoot } from '../../utils/get-project-root';
import { executeCommand } from '../../utils/execute-command';
import { relative, join } from 'node:path';
import { ExecutorContext } from '@nx/devkit';

export const runExecutor = async (
  options: InvokeExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const projectRoot = getProjectRoot(context);
  const samConfigDirRelative = relative(
    join(context.root, options.terraformDirectory),
    join(context.root, projectRoot)
  );

  const { __unparsed__ } = options;

  const invokeCommand = `sam local invoke --config-file ${join(
    samConfigDirRelative,
    'samconfig.toml'
  )} ${__unparsed__.join(' ')}`;

  const { stderr } = await executeCommand(invokeCommand, {
    cwd: join(context.root, options.terraformDirectory),
  });

  const success = !stderr;

  return {
    success,
  };
};

export default runExecutor;
