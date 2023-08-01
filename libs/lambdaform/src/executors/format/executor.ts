import { FormatExecutorSchema } from './schema';
import { ExecutorContext } from '@nx/devkit';
import { executeCommand } from '../../utils/execute-command';
import { join } from 'node:path';

export const runExecutor = async (
  options: FormatExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const projectName = context.projectName;
  if (!projectName) {
    throw new Error(`Project name isn't defined`);
  }

  const { args, terraformDirectory } = options;

  const nxFormatCommand = `nx format --projects=${projectName}`;
  const fmtCommand = `terraform fmt -recursive ${args ?? ''}`;

  const { stderr: nxStderr } = await executeCommand(nxFormatCommand, {
    cwd: context.root,
  });

  const { stderr: fmtStderr } = await executeCommand(fmtCommand, {
    cwd: join(context.root, terraformDirectory),
  });

  const success = !nxStderr && !fmtStderr;

  return {
    success,
  };
};

export default runExecutor;
