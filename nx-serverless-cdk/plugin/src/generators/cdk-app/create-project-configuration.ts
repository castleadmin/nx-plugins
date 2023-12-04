import { joinPathFragments, ProjectConfiguration } from '@nx/devkit';
import { ProjectType } from '@nx/workspace';
import { NormalizedProjectOptionsApplication } from '../../utils/normalize-project-options';
import { AppType } from './app-type';
import { CdkAppSchema } from './schema';

export const createProjectConfiguration = (
  options: CdkAppSchema,
  projectOptions: NormalizedProjectOptionsApplication,
): ProjectConfiguration => {
  const { projectRoot } = projectOptions;

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
      'cdk-ci': {
        executor: 'nx-serverless-cdk:cdk',
        options: {},
        dependsOn: [
          {
            dependencies: true,
            target: 'cdk-ci',
            params: 'forward',
          },
        ],
      },
    },
    tags: ['cdk-app'],
  };

  if (options.type === AppType.lambda) {
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