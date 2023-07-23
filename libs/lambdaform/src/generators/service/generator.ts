import {
  addProjectConfiguration,
  convertNxGenerator,
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
import { getVersions, Versions } from './versions';
import { addProjectDependencies, addTsDependencies } from './dependencies';
import { Linter, lintProjectGenerator } from '@nx/linter';

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
  const versions = await getVersions(tree);
  const projectName = names(options.serviceName).fileName;
  const projectRoot = joinPathFragments(appsDir, projectName);

  const tasks: GeneratorCallback[] = [];

  tasks.push(await addInitTasks(tree, options, versions));
  tasks.push(await addProjectDependencies(tree, versions));

  generateFiles(tree, joinPathFragments(__dirname, 'files'), projectRoot, {
    ...options,
    offset: offsetFromRoot(projectRoot),
    rootTsConfigPath: getRelativePathToRootTsConfig(tree, projectRoot),
  });

  addProjectConfiguration(tree, options.serviceName, {
    root: projectRoot,
    sourceRoot: joinPathFragments(projectRoot, 'src'),
    projectType: 'application',
    // TODO
    targets: {},
    // TODO
    tags: [`app:${options.serviceName}`, 'lambdaform:service'],
  });

  tasks.push(await addESLint(tree, options, projectRoot));
  tasks.push(await addJest(tree, options));

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
};

export default serviceGenerator;
export const serviceSchematic = convertNxGenerator(serviceGenerator);
