import {
  formatFiles,
  generateFiles,
  GeneratorCallback,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  offsetFromRoot,
  readJson,
  readProjectConfiguration,
  runTasksInSerial,
  Tree,
  updateProjectConfiguration,
  writeJson,
} from '@nx/devkit';
import { Linter } from '@nx/eslint';
import { getRelativePathToRootTsConfig, libraryGenerator } from '@nx/js';
import { resolve } from 'node:path';
import { getVersions } from '../../utils/versions';
import initGenerator from '../init/generator';
import { CdkLibSchema } from './schema';

const addJsLibrary = async (
  tree: Tree,
  options: CdkLibSchema,
  projectRoot: string,
  packageName: string,
): Promise<GeneratorCallback> => {
  const libOptions: Parameters<typeof libraryGenerator>[1] = {
    name: options.libName,
    directory: projectRoot,
    projectNameAndRootFormat: 'as-provided',
    skipFormat: true,
    tags: 'cdk-lib',
    skipTsConfig: false,
    skipPackageJson: false,
    includeBabelRc: false,
    unitTestRunner: 'jest',
    linter: Linter.EsLint,
    testEnvironment: 'node',
    importPath: packageName,
    js: false,
    pascalCaseFiles: false,
    strict: false,
    buildable: true,
    setParserOptionsProject: false,
    config: 'project',
    compiler: 'tsc',
    bundler: 'tsc',
    skipTypeCheck: false,
    minimal: false,
    rootProject: false,
    simpleName: false,
  };

  if (options.publishable) {
    libOptions.publishable = options.publishable;
  }

  return await libraryGenerator(tree, libOptions);
};

const changeProjectConfiguration = (
  tree: Tree,
  options: CdkLibSchema,
  projectRoot: string,
): void => {
  const config = readProjectConfiguration(tree, options.libName);

  config.sourceRoot = joinPathFragments(projectRoot, 'cdk');

  (config.targets as NonNullable<typeof config.targets>)['build'] = {
    executor: `@nx/js:tsc`,
    outputs: ['{options.outputPath}'],
    options: {
      outputPath: joinPathFragments('dist', projectRoot),
      tsConfig: `${projectRoot}/tsconfig.lib.json`,
      packageJson: `${projectRoot}/package.json`,
      main: `${projectRoot}/cdk/index.ts`,
      assets: [`${projectRoot}/*.md`],
    },
  };

  updateProjectConfiguration(tree, options.libName, config);
};

const changeSrcDirectory = (
  tree: Tree,
  projectRoot: string,
  packageName: string,
): void => {
  tree.delete(joinPathFragments(projectRoot, 'src'));

  const tsConfigBaseFilePath = 'tsconfig.base.json';
  const tsConfigBase = readJson(tree, tsConfigBaseFilePath);
  tsConfigBase.compilerOptions.paths[packageName] = [
    joinPathFragments(projectRoot, 'cdk', 'index.ts'),
  ];
  writeJson(tree, tsConfigBaseFilePath, tsConfigBase);
};

const jestConfigSnippet = `,
  collectCoverageFrom: [
    'cdk/**/*.ts',
    '!jest.config.ts',
    '!cdk/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['lcov', 'text'],
  resetMocks: true,
};
`;

const changeJestConfig = (
  tree: Tree,
  projectRoot: string,
): void => {
  const jestConfig = tree.read(
    `${projectRoot}/jest.config.ts`,
    'utf-8',
  ) as string;
  const lines = jestConfig.split('\n');
  lines.pop();
  lines.pop();
  const extendedJestConfig =
    lines.join('\n') + jestConfigSnippet;
  tree.write(`${projectRoot}/jest.config.ts`, extendedJestConfig);
};

export const cdkLibGenerator = async (
  tree: Tree,
  options: CdkLibSchema,
): Promise<GeneratorCallback> => {
  if (options.publishable && !options.importPath) {
    throw new Error(
      `The '--importPath' parameter has to be provided for publishable libraries. It must be a valid npm package name (e.g. 'example-lib' or '@example-org/example-lib').`,
    );
  }

  const versions = getVersions();
  const libsDir = getWorkspaceLayout(tree).libsDir;
  const projectName = names(options.libName).fileName;
  const projectRoot = joinPathFragments(libsDir, projectName);
  const packageName = options.importPath ?? projectName;

  const tasks: GeneratorCallback[] = [];

  tasks.push(
    await initGenerator(tree, {
      skipFormat: true,
    }),
  );

  tasks.push(await addJsLibrary(tree, options, projectRoot, packageName));

  generateFiles(tree, resolve(__dirname, 'files'), projectRoot, {
    ...options,
    projectName,
    packageName,
    versions,
    offset: offsetFromRoot(projectRoot),
    rootTsConfigPath: getRelativePathToRootTsConfig(tree, projectRoot),
    tmpl: '',
  });

  changeProjectConfiguration(tree, options, projectRoot);

  changeSrcDirectory(tree, projectRoot, packageName);

  changeJestConfig(tree, projectRoot);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
};

export default cdkLibGenerator;
