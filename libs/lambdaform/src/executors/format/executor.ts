import { FormatExecutorSchema } from './schema';
import { ExecutorContext, joinPathFragments } from '@nx/devkit';
import { getProjectRoot } from '../../utils/getProjectRoot';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';

export const runExecutor = async (
  options: FormatExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const project = getProjectRoot(context);

  const projectName = context.projectName;
  if (!projectName) {
    throw new Error(`Project name isn't defined`);
  }

  const { args, terraformDirectory } = options;

  const nxFormatCommand = `nx format --projects=${projectName}`;
  const fmtCommand = `terraform fmt -recursive ${args ?? ''}`;

  const { stdout: nxStdout, stderr: nxStderr } = await promisify(exec)(nxFormatCommand, {
    cwd: joinPathFragments(context.root),
  });
  console.log(nxStdout);
  console.error(nxStderr);

  const { stdout: fmtStdout, stderr: fmtStderr } = await promisify(exec)(fmtCommand, {
    cwd: joinPathFragments(context.root, project, terraformDirectory),
  });
  console.log(fmtStdout);
  console.error(fmtStderr);

  const success = !nxStderr && !fmtStderr;

  return {
    success,
  };
};

export default runExecutor;
