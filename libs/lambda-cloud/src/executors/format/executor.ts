import { ExecutorContext } from '@nx/devkit';
import { join, resolve } from 'node:path';
import { executeCommand } from '../../utils/execute-command';
import { FormatExecutorSchema } from './schema';

export const runExecutor = async (
  options: FormatExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> => {
  const contextRootResolved = resolve(context.root);

  const { args, terraformDirectory, shell } = options;

  const fmtCommand = `terraform fmt -recursive${args ? ` ${args}` : ''}`;

  await executeCommand(fmtCommand, {
    cwd: join(contextRootResolved, terraformDirectory),
    shell,
  });

  return {
    success: true,
  };
};

export default runExecutor;
