import { EventExecutorSchema } from './schema';
import { executeCommand } from '../../utils/execute-command';
import { ExecutorContext } from '@nx/devkit';
import { getProjectRoot } from '../../utils/get-project-root';
import { dirname, resolve, join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { filterUnparsed } from '../../utils/filter-unparsed';

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

  const { create, args, __unparsed__ } = options;
  const filteredUnparsed = filterUnparsed(__unparsed__, ['create', 'args']);
  const workingDirectoryResolved = join(contextRootResolved, projectRoot);

  const generateEventCommand = `sam local generate-event ${
    args ?? ''
  } ${filteredUnparsed.join(' ')}`;

  const { stdout } = await executeCommand(generateEventCommand, {
    cwd: workingDirectoryResolved,
  });

  if (create) {
    await createEventFile(join(workingDirectoryResolved, create), stdout);
  }

  return {
    success: true,
  };
};

export default runExecutor;
