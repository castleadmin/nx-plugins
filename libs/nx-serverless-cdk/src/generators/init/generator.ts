import {
  addDependenciesToPackageJson,
  formatFiles,
  GeneratorCallback,
  runTasksInSerial,
  Tree,
} from '@nx/devkit';
import { jestInitGenerator } from '@nx/jest';
import { initGenerator as jsInitGenerator } from '@nx/js';
import { getVersions, Versions } from '../../utils/versions';
import { InitSchema } from './schema';

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

  const tasks: GeneratorCallback[] = [];

  tasks.push(
    await jsInitGenerator(tree, {
      js: false,
      skipFormat: true,
      skipPackageJson: false,
      tsConfigName: 'tsconfig.base.json',
    }),
  );

  tasks.push(
    await jestInitGenerator(tree, {
      compiler: 'tsc',
      js: false,
      skipPackageJson: false,
      testEnvironment: 'node',
      rootProject: false,
    }),
  );

  tasks.push(addInitDependencies(tree, versions));

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
};

export default initGenerator;
