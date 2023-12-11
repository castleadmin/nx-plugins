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
      deploy: {
        executor: 'nx-serverless-cdk:cdk',
        defaultConfiguration: 'dev',
        options: {},
        configurations: {
          dev: {
            predefinedArguments: ['deploy', 'Dev/*'],
          },
          stage: {
            predefinedArguments: ['deploy', 'Stage/*'],
          },
          prod: {
            predefinedArguments: ['deploy', 'Prod/*'],
          },
        },
      },
      'deploy-all': {
        executor: 'nx-serverless-cdk:cdk',
        defaultConfiguration: 'dev',
        dependsOn: [
          {
            dependencies: true,
            params: 'forward',
            target: 'deploy-all',
          },
        ],
        options: {},
        configurations: {
          dev: {
            predefinedArguments: ['deploy', 'Dev/*'],
          },
          stage: {
            predefinedArguments: ['deploy', 'Stage/*'],
          },
          prod: {
            predefinedArguments: ['deploy', 'Prod/*'],
          },
        },
      },
      destroy: {
        executor: 'nx-serverless-cdk:cdk',
        defaultConfiguration: 'dev',
        options: {},
        configurations: {
          dev: {
            predefinedArguments: ['destroy', 'Dev/*', '--force'],
          },
          stage: {
            predefinedArguments: ['destroy', 'Stage/*', '--force'],
          },
          prod: {
            predefinedArguments: ['destroy', 'Prod/*', '--force'],
          },
        },
      },
      diff: {
        executor: 'nx-serverless-cdk:cdk',
        defaultConfiguration: 'dev',
        options: {},
        configurations: {
          dev: {
            predefinedArguments: ['diff', 'Dev/*'],
          },
          stage: {
            predefinedArguments: ['diff', 'Stage/*'],
          },
          prod: {
            predefinedArguments: ['diff', 'Prod/*'],
          },
        },
      },
      ls: {
        executor: 'nx-serverless-cdk:cdk',
        defaultConfiguration: 'dev',
        options: {},
        configurations: {
          dev: {
            predefinedArguments: ['ls', 'Dev/*'],
          },
          stage: {
            predefinedArguments: ['ls', 'Stage/*'],
          },
          prod: {
            predefinedArguments: ['ls', 'Prod/*'],
          },
        },
      },
      synth: {
        executor: 'nx-serverless-cdk:cdk',
        defaultConfiguration: 'dev',
        options: {},
        configurations: {
          dev: {
            predefinedArguments: ['synth', 'Dev/*'],
          },
          stage: {
            predefinedArguments: ['synth', 'Stage/*'],
          },
          prod: {
            predefinedArguments: ['synth', 'Prod/*'],
          },
        },
      },
      watch: {
        executor: 'nx-serverless-cdk:cdk',
        defaultConfiguration: 'dev',
        options: {},
        configurations: {
          dev: {
            predefinedArguments: ['watch', 'Dev/*'],
          },
          stage: {
            predefinedArguments: ['watch', 'Stage/*'],
          },
          prod: {
            predefinedArguments: ['watch', 'Prod/*'],
          },
        },
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
