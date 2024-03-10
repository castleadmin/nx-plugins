import {
  joinPathFragments,
  ProjectConfiguration,
  TargetConfiguration,
} from '@nx/devkit';
import { ProjectType } from '@nx/workspace';
import { NormalizedProjectOptionsApplication } from '../../utils/normalize-project-options';
import { AppType } from './app-type';
import { CdkAppSchema } from './schema';

export interface CustomTargetNames {
  cdkTargetName?: string;
  deployTargetName?: string;
  deployAllTargetName?: string;
  destroyTargetName?: string;
  diffTargetName?: string;
  lsTargetName?: string;
  synthTargetName?: string;
  watchTargetName?: string;
  generateEventTargetName?: string;
  invokeTargetName?: string;
  startApiTargetName?: string;
  startLambdaTargetName?: string;
}

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

export const createTargets = ({
  defaultEnvironment,
  environments,
  type,
  customTargetNames,
}: {
  defaultEnvironment: string;
  environments: string[];
  type: AppType;
  customTargetNames: CustomTargetNames;
}): Record<string, TargetConfiguration> => {
  const names = {
    cdkTargetName: 'cdk',
    deployTargetName: 'deploy',
    deployAllTargetName: 'deploy-all',
    destroyTargetName: 'destroy',
    diffTargetName: 'diff',
    lsTargetName: 'ls',
    synthTargetName: 'synth',
    watchTargetName: 'watch',
    generateEventTargetName: 'generate-event',
    invokeTargetName: 'invoke',
    startApiTargetName: 'start-api',
    startLambdaTargetName: 'start-lambda',
    ...customTargetNames,
  };

  let targets: Record<string, TargetConfiguration> = {
    [names.cdkTargetName]: {
      executor: 'nx-serverless-cdk:cdk',
      options: {},
    },
    [names.deployTargetName]: {
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
    [names.deployAllTargetName]: {
      executor: 'nx-serverless-cdk:cdk',
      dependsOn: [
        {
          dependencies: true,
          params: 'forward',
          target: names.deployAllTargetName,
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
    [names.destroyTargetName]: {
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
    [names.diffTargetName]: {
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
    [names.lsTargetName]: {
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
    [names.synthTargetName]: {
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
    [names.watchTargetName]: {
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
      [names.generateEventTargetName]: {
        executor: 'nx-serverless-cdk:generate-event',
        options: {},
      },
      [names.invokeTargetName]: {
        executor: 'nx-serverless-cdk:invoke',
        options: {},
      },
      [names.startApiTargetName]: {
        executor: 'nx-serverless-cdk:start-api',
        options: {},
      },
      [names.startLambdaTargetName]: {
        executor: 'nx-serverless-cdk:start-lambda',
        options: {},
      },
    };
  }

  return targets;
};

export const createProjectConfiguration = ({
  options,
  projectOptions,
  useInferredTasks,
}: {
  options: CdkAppSchema;
  projectOptions: NormalizedProjectOptionsApplication;
  useInferredTasks: boolean;
}): ProjectConfiguration => {
  const { projectRoot } = projectOptions;

  return {
    root: projectRoot,
    sourceRoot: joinPathFragments(projectRoot, 'cdk'),
    projectType: ProjectType.Application,
    implicitDependencies: [],
    targets: useInferredTasks
      ? {}
      : createTargets({
          defaultEnvironment: options.defaultEnvironment,
          environments: options.environments,
          type: options.type,
          customTargetNames: {},
        }),
    tags: ['cdk-app'],
  };
};
