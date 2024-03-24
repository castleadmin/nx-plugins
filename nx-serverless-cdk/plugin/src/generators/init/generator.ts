import {
  addDependenciesToPackageJson,
  formatFiles,
  GeneratorCallback,
  NxJsonConfiguration,
  readNxJson,
  runTasksInSerial,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import { NxServerlessCdkPluginOptions } from '../../plugins/plugin';
import { useInferredTasks } from '../../utils/use-inferred-tasks';
import { getVersions, Versions } from '../../utils/versions';
import { InitSchema } from './schema';

const addPlugin = (tree: Tree): void => {
  const nxJson = readNxJson(tree) as NxJsonConfiguration;
  nxJson.plugins ??= [];

  if (
    !nxJson.plugins.some((p) =>
      typeof p === 'string'
        ? p === 'nx-serverless-cdk/plugin'
        : p.plugin === 'nx-serverless-cdk/plugin',
    )
  ) {
    const defaultOptions: NxServerlessCdkPluginOptions = {
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
    };

    nxJson.plugins.push({
      plugin: 'nx-serverless-cdk/plugin',
      options: defaultOptions,
    });
  }

  updateNxJson(tree, nxJson);
};

const addInitDependencies = (tree: Tree, versions: Versions) => {
  return addDependenciesToPackageJson(
    tree,
    {
      // CDK dependencies
      'aws-cdk-lib': versions['aws-cdk-lib'],
      constructs: versions['constructs'],
      'source-map-support': versions['source-map-support'],
      // TypeScript dependencies
      tslib: versions.tslib,
    },
    {
      // CDK development dependencies
      'aws-cdk': versions['aws-cdk'],
      'tsconfig-paths': versions['tsconfig-paths'],
      'ts-node': versions['ts-node'],
      // TypeScript development dependencies
      '@types/node': versions['@types/node'],
    },
  );
};

export const initGenerator = async (
  tree: Tree,
  options: InitSchema,
): Promise<GeneratorCallback> => {
  const versions = getVersions();

  if (useInferredTasks()) {
    addPlugin(tree);
  }

  const tasks: GeneratorCallback[] = [];

  tasks.push(addInitDependencies(tree, versions));

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
};

export default initGenerator;
