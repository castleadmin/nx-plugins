import { ExecutorContext, ProjectGraph } from '@nx/devkit';
import { join, resolve } from 'node:path';
import { getProjectSourceRoot } from '../../../utils/get-project-source-root';
import { BuildExecutorSchema } from '../schema';

export const buildPrerequisites = (
  options: BuildExecutorSchema,
  context: ExecutorContext
): {
  contextRootResolved: string;
  projectSourceRootResolved: string;
  projectGraph: ProjectGraph;
  outputPathResolved: string;
} => {
  const contextRootResolved = resolve(context.root);

  const projectSourceRoot = getProjectSourceRoot(context);
  const projectSourceRootResolved = join(
    contextRootResolved,
    projectSourceRoot
  );

  const projectGraph = context.projectGraph;
  if (!projectGraph) {
    throw new Error("The project graph isn't defined");
  }

  const outputPathResolved = join(contextRootResolved, options.outputPath);

  return {
    contextRootResolved,
    projectSourceRootResolved,
    projectGraph,
    outputPathResolved,
  };
};
