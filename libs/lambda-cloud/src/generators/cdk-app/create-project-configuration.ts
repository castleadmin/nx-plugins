import { joinPathFragments, ProjectConfiguration } from '@nx/devkit';
import { ProjectType } from '@nx/workspace';
import { AppType } from './app-type';
import { CdkAppSchema } from './schema';

export const createProjectConfiguration = (
  projectRoot: string,
  options: CdkAppSchema,
): ProjectConfiguration => {
  const isLambdaApp = options.appType === AppType.lambda;

  const projectConfiguration: ProjectConfiguration = {
    root: projectRoot,
    sourceRoot: joinPathFragments(projectRoot, 'cdk'),
    projectType: ProjectType.Application,
    implicitDependencies: [],
    targets: {
      cdk: {
        executor: 'lambda-cloud:cdk',
        options: {},
      },
    },
    tags: ['cdk-app'],
  };

  if (isLambdaApp) {
    projectConfiguration.targets = {
      ...projectConfiguration.targets,
      'generate-event': {
        executor: 'lambda-cloud:generate-event',
        options: {},
      },
      invoke: {
        executor: 'lambda-cloud:invoke',
        options: {},
      },
      'start-api': {
        executor: 'lambda-cloud:start-api',
        options: {},
      },
      'start-lambda': {
        executor: 'lambda-cloud:start-lambda',
        options: {},
      },
    };
  }

  return projectConfiguration;
};
