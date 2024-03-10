import {
  joinPathFragments,
  ProjectConfiguration,
  TargetConfiguration,
} from '@nx/devkit';
import { ProjectType } from '@nx/workspace';
import { NormalizedProjectOptionsApplication } from '../../utils/normalize-project-options';
import { AppType } from './app-type';
import { CdkAppSchema } from './schema';

const createPredefinedArguments = ({
  command,
  commandSuffix,
  environments,
}: {
  command: string;
  commandSuffix?: string[];
  environments: string[];
}): {
  [environment: string]: {
    predefinedArguments: string[];
  };
} => {
  const commandSuffixNormalized = commandSuffix ?? [];

  return {
    ...environments.reduce(
      (
        acc: Record<
          string,
          {
            predefinedArguments: string[];
          }
        >,
        environment,
      ) => {
        acc[environment] = {
          predefinedArguments: [
            command,
            `${environment}/*`,
            ...commandSuffixNormalized,
          ],
        };

        return acc;
      },
      {},
    ),
  };
};

// TODO support custom target names
export const createTargets = ({
  defaultEnvironment,
  environments,
  type,
}: {
  defaultEnvironment: string;
  environments: string[];
  type: AppType;
}): Record<string, TargetConfiguration> => {
  let targets: Record<string, TargetConfiguration> = {
    cdk: {
      executor: 'nx-serverless-cdk:cdk',
      options: {},
    },
    deploy: {
      executor: 'nx-serverless-cdk:cdk',
      defaultConfiguration: defaultEnvironment,
      options: {
        predefinedArguments: ['deploy'],
      },
      configurations: createPredefinedArguments({
        command: 'deploy',
        environments,
      }),
    },
    'deploy-all': {
      executor: 'nx-serverless-cdk:cdk',
      dependsOn: [
        {
          dependencies: true,
          params: 'forward',
          target: 'deploy-all',
        },
      ],
      defaultConfiguration: defaultEnvironment,
      options: {
        predefinedArguments: ['deploy'],
      },
      configurations: createPredefinedArguments({
        command: 'deploy',
        environments,
      }),
    },
    destroy: {
      executor: 'nx-serverless-cdk:cdk',
      defaultConfiguration: defaultEnvironment,
      options: {
        predefinedArguments: ['destroy', '--force'],
      },
      configurations: createPredefinedArguments({
        command: 'destroy',
        environments,
        commandSuffix: ['--force'],
      }),
    },
    diff: {
      executor: 'nx-serverless-cdk:cdk',
      defaultConfiguration: defaultEnvironment,
      options: {
        predefinedArguments: ['diff'],
      },
      configurations: createPredefinedArguments({
        command: 'diff',
        environments,
      }),
    },
    ls: {
      executor: 'nx-serverless-cdk:cdk',
      defaultConfiguration: defaultEnvironment,
      options: {
        predefinedArguments: ['ls'],
      },
      configurations: createPredefinedArguments({
        command: 'ls',
        environments,
      }),
    },
    synth: {
      executor: 'nx-serverless-cdk:cdk',
      defaultConfiguration: defaultEnvironment,
      options: {
        predefinedArguments: ['synth'],
      },
      configurations: createPredefinedArguments({
        command: 'synth',
        environments,
      }),
    },
    watch: {
      executor: 'nx-serverless-cdk:cdk',
      defaultConfiguration: defaultEnvironment,
      options: {
        predefinedArguments: ['watch'],
      },
      configurations: createPredefinedArguments({
        command: 'watch',
        environments,
      }),
    },
  };

  if (type === AppType.lambda) {
    targets = {
      ...targets,
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

  return targets;
};

export const createProjectConfiguration = (
  options: CdkAppSchema,
  projectOptions: NormalizedProjectOptionsApplication,
  defaultEnvironment: string,
  environments: string[],
): ProjectConfiguration => {
  const { projectRoot } = projectOptions;

  return {
    root: projectRoot,
    sourceRoot: joinPathFragments(projectRoot, 'cdk'),
    projectType: ProjectType.Application,
    implicitDependencies: [],
    targets: createTargets({
      defaultEnvironment,
      environments,
      type: options.type,
    }),
    tags: ['cdk-app'],
  };
};
