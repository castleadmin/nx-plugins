import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  GeneratorCallback,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  offsetFromRoot,
  runTasksInSerial,
  Tree,
} from '@nx/devkit';
import { Linter, lintProjectGenerator } from '@nx/eslint';
import { configurationGenerator } from '@nx/jest';
import { getRelativePathToRootTsConfig } from '@nx/js';
import { resolve } from 'node:path';
import initGenerator from '../init/init';
import { createProjectConfiguration } from './create-project-configuration';
import { CdkLibSchema } from './schema';

const addESLint = async (
  tree: Tree,
  options: CdkLibSchema,
  projectRoot: string,
): Promise<GeneratorCallback> => {
  return await lintProjectGenerator(tree, {
    linter: Linter.EsLint,
    project: options.libName,
    tsConfigPaths: [joinPathFragments(projectRoot, 'tsconfig.app.json')],
    eslintFilePatterns: [`${projectRoot}/**/*.ts`],
    unitTestRunner: 'jest',
    skipFormat: true,
    setParserOptionsProject: false,
    rootProject: false,
  });
};

const addJest = async (
  tree: Tree,
  options: CdkLibSchema,
): Promise<GeneratorCallback> => {
  return await configurationGenerator(tree, {
    ...options,
    project: options.libName,
    setupFile: 'none',
    skipSerializers: true,
    supportTsx: false,
    testEnvironment: 'node',
    compiler: 'tsc',
    skipFormat: true,
  });
};

export const cdkLibGenerator = async (
  tree: Tree,
  options: CdkLibSchema,
): Promise<GeneratorCallback> => {
  const libsDir = getWorkspaceLayout(tree).libsDir;
  const projectName = names(options.libName).fileName;
  const projectRoot = joinPathFragments(libsDir, projectName);

  const tasks: GeneratorCallback[] = [];

  const initTask = await initGenerator(tree, {
    skipFormat: true,
  });

  tasks.push(initTask);

  generateFiles(tree, resolve(__dirname, 'files'), projectRoot, {
    ...options,
    offset: offsetFromRoot(projectRoot),
    rootTsConfigPath: getRelativePathToRootTsConfig(tree, projectRoot),
    tmpl: ''
  });

  addProjectConfiguration(
    tree,
    options.libName,
    createProjectConfiguration(projectRoot, options),
  );

  tasks.push(await addESLint(tree, options, projectRoot));
  tasks.push(await addJest(tree, options));

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
};

export default cdkLibGenerator;
