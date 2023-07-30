import { DestroyExecutorSchema } from './schema';
import { ExecutorContext, joinPathFragments } from '@nx/devkit';
import { getProjectRoot } from '../../utils/getProjectRoot';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';

export const runExecutor = async (
  options: DestroyExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const project = getProjectRoot(context);

  const { workspace, interactive, args, terraformDirectory } = options;

  const selectWorkspaceCommand = `terraform workspace select ${workspace}`;
  const destroyCommand = `terraform destroy -input=${interactive} ${
    args ?? ''
  }`;
  const combinedCommand = `${selectWorkspaceCommand} && ${destroyCommand}`;

  const { stdout, stderr } = await promisify(exec)(
    workspace ? combinedCommand : destroyCommand,
    { cwd: joinPathFragments(context.root, project, terraformDirectory) }
  );
  console.log(stdout);
  console.error(stderr);

  const success = !stderr;

  return {
    success,
  };
};

export default runExecutor;
