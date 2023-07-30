import { PlanExecutorSchema } from './schema';
import { ExecutorContext, joinPathFragments } from '@nx/devkit';
import { getProjectRoot } from '../../utils/getProjectRoot';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';

export const runExecutor = async (
  options: PlanExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const project = getProjectRoot(context);

  const { workspace, interactive, args, planOutput, terraformDirectory } =
    options;

  const selectWorkspaceCommand = `terraform workspace select ${workspace}`;
  const planCommand = `terraform plan -input=${interactive} -out=${planOutput} ${
    args ?? ''
  }`;
  const combinedCommand = `${selectWorkspaceCommand} && ${planCommand}`;

  const { stdout, stderr } = await promisify(exec)(
    workspace ? combinedCommand : planCommand,
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
