import { joinPathFragments, ProjectConfiguration } from '@nx/devkit';
import { ProjectType } from '@nx/workspace';

export const createProjectConfiguration = (
  projectRoot: string,
): ProjectConfiguration => {
  return {
    root: projectRoot,
    sourceRoot: joinPathFragments(projectRoot, 'cdk'),
    projectType: ProjectType.Library,
    implicitDependencies: [],
    targets: {
      cdk: {
        executor: 'nx-serverless-cdk:cdk',
        options: {},
      },
    },
    tags: ['cdk-lib'],
  };
};
