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
import { ServiceGeneratorSchema } from './schema';
import {
  getRelativePathToRootTsConfig,
  initGenerator as jsInitGenerator,
} from '@nx/js';
import { jestInitGenerator, jestProjectGenerator } from '@nx/jest';
import { addProjectDependencies, addTsDependencies } from './dependencies';
import { Linter, lintProjectGenerator } from '@nx/linter';
import { getVersions, Versions } from '../../utils/versions';
import { createProjectConfiguration } from './create-project-configuration';
import { toTerraformName } from '../../utils/to-terraform-name';
import { resolve } from 'node:path';

const addInitTasks = async (
  tree: Tree,
  options: ServiceGeneratorSchema,
  versions: Versions
): Promise<GeneratorCallback> => {
  const initTasks: GeneratorCallback[] = [];
  initTasks.push(
    await jsInitGenerator(tree, {
      js: false,
      skipFormat: false,
      skipPackageJson: false,
      tsConfigName: 'tsconfig.base.json',
    })
  );
  initTasks.push(await jestInitGenerator(tree, { testEnvironment: 'node' }));
  initTasks.push(addTsDependencies(tree, versions));

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...initTasks);
};

const addESLint = async (
  tree: Tree,
  options: ServiceGeneratorSchema,
  projectRoot: string
): Promise<GeneratorCallback> => {
  return await lintProjectGenerator(tree, {
    linter: Linter.EsLint,
    project: options.serviceName,
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
  options: ServiceGeneratorSchema
): Promise<GeneratorCallback> => {
  return await jestProjectGenerator(tree, {
    ...options,
    project: options.serviceName,
    setupFile: 'none',
    skipSerializers: true,
    supportTsx: false,
    testEnvironment: 'node',
    compiler: 'tsc',
    skipFormat: true,
  });
};

export const serviceGenerator = async (
  tree: Tree,
  options: ServiceGeneratorSchema
): Promise<GeneratorCallback> => {
  const appsDir = getWorkspaceLayout(tree).appsDir;
  const versions = getVersions();
  const projectName = names(options.serviceName).fileName;
  const projectRoot = joinPathFragments(appsDir, projectName);

  const tasks: GeneratorCallback[] = [];

  tasks.push(await addInitTasks(tree, options, versions));
  tasks.push(await addProjectDependencies(tree, versions));

  const terraformOptions = {
    serviceNameTf: toTerraformName(options.serviceName),
  };

  generateFiles(tree, resolve(__dirname, 'files'), projectRoot, {
    ...options,
    ...terraformOptions,
    offset: offsetFromRoot(projectRoot),
    rootTsConfigPath: getRelativePathToRootTsConfig(tree, projectRoot),
  });

  addProjectConfiguration(
    tree,
    options.serviceName,
    createProjectConfiguration(projectRoot, options)
  );

  tasks.push(await addESLint(tree, options, projectRoot));
  tasks.push(await addJest(tree, options));

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
};

export default serviceGenerator;
