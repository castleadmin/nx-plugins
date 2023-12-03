import { ExecutorContext } from '@nx/devkit';
import { resolve } from 'node:path';
import { executeCommand } from '../../utils/execute-command';
import { getProjectRoot } from '../../utils/get-project-root';
import { StartLambdaExecutorSchema } from './schema';

export const runExecutor = async (
  options: StartLambdaExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> => {
  const projectRootResolved = resolve(context.root, getProjectRoot(context));

  const { __unparsed__ } = options;

  const command = `sam local start-lambda --config-file ../samconfig.toml`;
  console.log('Executing command:', command, __unparsed__.join(' '));

  await executeCommand(command, __unparsed__, {
    cwd: projectRootResolved,
  });

  return {
    success: true,
  };
};

export default runExecutor;
