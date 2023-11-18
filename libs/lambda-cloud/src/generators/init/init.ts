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
      // TypeScript
      tslib: versions.tslib,
    },
    {
      // TypeScript
      '@types/node': versions['@types/node'],
      // CDK
      'aws-cdk': versions['aws-cdk'],
      'aws-cdk-lib': versions['aws-cdk-lib'],
      constructs: versions['constructs'],
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
      ...options,
      tsConfigName: 'tsconfig.base.json',
      skipFormat: true,
    }),
  );

  tasks.push(
    await jestInitGenerator(tree, { ...options, testEnvironment: 'node' }),
  );

  tasks.push(addInitDependencies(tree, versions));

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
};

export default initGenerator;
