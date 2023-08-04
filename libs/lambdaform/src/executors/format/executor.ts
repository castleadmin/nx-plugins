import { FormatExecutorSchema } from './schema';
import { ExecutorContext } from '@nx/devkit';
import { executeCommand } from '../../utils/execute-command';
import { join, resolve } from 'node:path';

export const runExecutor = async (
  options: FormatExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const contextRootResolved = resolve(context.root);
  const projectName = context.projectName;
  if (!projectName) {
    throw new Error(`Project name isn't defined`);
  }

  const { args, terraformDirectory } = options;

  const nxFormatCommand = `nx format --projects=${projectName}`;
  const fmtCommand = `terraform fmt -recursive ${args ?? ''}`;

  await executeCommand(nxFormatCommand, {
    cwd: contextRootResolved,
  });

  await executeCommand(fmtCommand, {
    cwd: join(contextRootResolved, terraformDirectory),
  });

  return {
    success: true,
  };
};

export default runExecutor;
