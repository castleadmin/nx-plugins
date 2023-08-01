import { ExecutorContext } from '@nx/devkit';

export const getProjectSourceRoot = (context: ExecutorContext): string => {
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

  const { sourceRoot } = projectConfiguration;

  if (!sourceRoot) {
    throw new Error(`Project ${projectName} source root isn't defined`);
  }

  return sourceRoot;
};
