import { ExecutorContext } from '@nx/devkit';

export const getProjectRoot = (context: ExecutorContext): string => {
  const projectName = context.projectName;

  if (!projectName) {
    throw new Error("Project name isn't defined");
  }

  if (!context.projectsConfigurations) {
    throw new Error("Projects configurations aren't defined");
  }

  const projectConfiguration =
    context.projectsConfigurations.projects[projectName];
  if (!projectConfiguration) {
    throw new Error(`Project configuration ${projectName} isn't defined`);
  }

  const { root } = projectConfiguration;

  return root;
};
