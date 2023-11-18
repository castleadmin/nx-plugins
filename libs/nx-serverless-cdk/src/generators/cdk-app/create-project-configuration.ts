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
        executor: 'nx-serverless-cdk:cdk',
        options: {},
      },
    },
    tags: ['cdk-app'],
  };

  if (isLambdaApp) {
    projectConfiguration.targets = {
      ...projectConfiguration.targets,
      'generate-event': {
        executor: 'nx-serverless-cdk:generate-event',
        options: {},
      },
      invoke: {
        executor: 'nx-serverless-cdk:invoke',
        options: {},
      },
      'start-api': {
        executor: 'nx-serverless-cdk:start-api',
        options: {},
      },
      'start-lambda': {
        executor: 'nx-serverless-cdk:start-lambda',
        options: {},
      },
    };
  }

  return projectConfiguration;
};
