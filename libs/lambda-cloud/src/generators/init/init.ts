import {
  addDependenciesToPackageJson,
  formatFiles,
  GeneratorCallback,
  runTasksInSerial,
  Tree,
} from '@nx/devkit';
import { jestInitGenerator } from '@nx/jest';
import { initGenerator as jsInitGenerator } from '@nx/js';
import { getVersions } from '../../utils/versions';
import { InitSchema } from './schema';

function updateDependencies(tree: Tree) {
  const versions = getVersions();

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
}

export async function initGenerator(
  tree: Tree,
  options: InitSchema,
): Promise<GeneratorCallback> {
  const tasks: GeneratorCallback[] = [];
  tasks.push(
    await jsInitGenerator(tree, {
      ...schema,
      tsConfigName: 'tsconfig.base.json',
      skipFormat: true,
    }),
  );

  tasks.push(
    await jestInitGenerator(tree, { ...schema, testEnvironment: 'node' }),
  );

  tasks.push(updateDependencies(tree));

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
}

export default initGenerator;
