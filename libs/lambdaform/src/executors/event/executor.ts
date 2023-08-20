import { ExecutorContext } from '@nx/devkit';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { additionalArgsToString } from '../../utils/additional-args-to-string';
import { executeCommandBufferResults } from '../../utils/execute-command';
import { EventExecutorSchema } from './schema';

const createEventFile = async (
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

  const { eventsDirectory, args, save, shell, _, ...rest } = options;
  const additionalArgs = additionalArgsToString(_, rest);

  const workingDirectoryResolved = join(contextRootResolved, eventsDirectory);

  const generateEventCommand = `sam local generate-event${
    args ? ` ${args}` : ''
  }${additionalArgs ? ` ${additionalArgs}` : ''}`;
  console.log('Executing command:', generateEventCommand);

  const { stdout } = await executeCommandBufferResults(generateEventCommand, {
    cwd: workingDirectoryResolved,
    shell,
  });

  if (save) {
    await createEventFile(join(workingDirectoryResolved, save), stdout);
  }

  return {
    success: true,
  };
};

export default runExecutor;
