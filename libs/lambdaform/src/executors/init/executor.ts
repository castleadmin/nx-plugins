import { InitExecutorSchema } from './schema';
import { ExecutorContext, joinPathFragments } from '@nx/devkit';
import { getProjectRoot } from '../../utils/getProjectRoot';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';

export const runExecutor = async (
  options: InitExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const project = getProjectRoot(context);

  const { workspace, interactive, upgrade, args, terraformDirectory } = options;

  const selectWorkspaceCommand = `terraform workspace select ${workspace}`;
  const initCommand = `terraform init -input=${interactive} ${
    upgrade ? '-upgrade' : ''
  } ${args ?? ''}`;
  const combinedCommand = `${selectWorkspaceCommand} && ${initCommand}`;

  const { stdout, stderr } = await promisify(exec)(
    workspace ? combinedCommand : initCommand,
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
