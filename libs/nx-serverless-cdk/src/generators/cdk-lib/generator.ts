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
import initGenerator from '../init/generator';
import { createProjectConfiguration } from './create-project-configuration';
import { CdkLibSchema } from './schema';

const addESLint = async (
  tree: Tree,
  options: CdkLibSchema,
  projectRoot: string,
): Promise<GeneratorCallback> => {
  return await lintProjectGenerator(tree, {
    project: options.libName,
    linter: Linter.EsLint,
    eslintFilePatterns: [`${projectRoot}/**/*.ts`],
    tsConfigPaths: [joinPathFragments(projectRoot, 'tsconfig.lib.json')],
    skipFormat: true,
    setParserOptionsProject: false,
    skipPackageJson: false,
    unitTestRunner: 'jest',
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
    supportTsx: false,
    setupFile: 'none',
    skipSerializers: true,
    testEnvironment: 'node',
    skipFormat: true,
    compiler: 'tsc',
    skipPackageJson: false,
    js: false,
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
    tmpl: '',
  });

  addProjectConfiguration(
    tree,
    options.libName,
    createProjectConfiguration(projectRoot),
  );

  tasks.push(await addESLint(tree, options, projectRoot));
  tasks.push(await addJest(tree, options));

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
};

export default cdkLibGenerator;
