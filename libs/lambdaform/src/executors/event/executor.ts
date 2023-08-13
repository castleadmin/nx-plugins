import { EventExecutorSchema } from './schema';
import { executeCommandBufferResults } from '../../utils/execute-command';
import { ExecutorContext } from '@nx/devkit';
import { getProjectRoot } from '../../utils/get-project-root';
import { dirname, resolve, join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { additionalArgsToString } from '../../utils/additional-args-to-string';

export const createEventFile = async (
  fileResolved: string,
  data: string
): Promise<void> => {
  await mkdir(dirname(fileResolved), { recursive: true });
  await writeFile(fileResolved, data, {
    encoding: 'utf8',
  });
};

export const runExecutor = async (
  options: EventExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const contextRootResolved = resolve(context.root);
  const projectRoot = getProjectRoot(context);
  const workingDirectoryResolved = join(contextRootResolved, projectRoot);

  const { create, args, shell, _, ...rest } = options;
  const additionalArgs = additionalArgsToString(_, rest);

  const generateEventCommand = `sam local generate-event ${
    args ? `${args} ${additionalArgs}` : additionalArgs
  }`;
  console.log('Executing command:', generateEventCommand);

  const { stdout } = await executeCommandBufferResults(generateEventCommand, {
    cwd: workingDirectoryResolved,
    shell,
  });

  if (create) {
    await createEventFile(join(workingDirectoryResolved, create), stdout);
  }

  return {
    success: true,
  };
};

export default runExecutor;
