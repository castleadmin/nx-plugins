import type { ExecutorContext } from '@nx/devkit';
import { ApplyExecutorSchema } from './schema';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { joinPathFragments } from '@nx/devkit';
import { getProjectRoot } from '../../utils/getProjectRoot';

export const runExecutor = async (
  options: ApplyExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const project = getProjectRoot(context);

  const { workspace, interactive, args, planOutput, terraformDirectory } =
    options;

  const selectWorkspaceCommand = `terraform workspace select ${workspace}`;
  const applyCommand = `terraform apply -input=${interactive} ${
    args ?? ''
  } ${planOutput}`;
  const combinedCommand = `${selectWorkspaceCommand} && ${applyCommand}`;

  const { stdout, stderr } = await promisify(exec)(
    workspace ? combinedCommand : applyCommand,
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
