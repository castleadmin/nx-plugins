import {
  formatFiles,
  generateFiles,
  GeneratorCallback,
  joinPathFragments,
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
import { ProjectType } from '@nx/workspace';
import { resolve } from 'node:path';
import normalizeProjectOptions, {
  NormalizedProjectOptionsLibrary,
} from '../../utils/normalize-project-options';
import { getVersions, Versions } from '../../utils/versions';
import initGenerator from '../init/generator';
import { CdkLibSchema } from './schema';

const addJsLibrary = async (
  tree: Tree,
  options: CdkLibSchema,
  projectOptions: NormalizedProjectOptionsLibrary,
): Promise<GeneratorCallback> => {
  const { projectName, projectRoot, importPath } = projectOptions;

  const libOptions: Parameters<typeof libraryGenerator>[1] = {
    name: projectName,
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
    importPath,
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

const addFiles = (
  tree: Tree,
  projectOptions: NormalizedProjectOptionsLibrary,
  versions: Versions,
): void => {
  const { projectName, projectRoot, importPath } = projectOptions;

  generateFiles(tree, resolve(__dirname, 'files'), projectRoot, {
    projectName,
    importPath,
    versions,
    offset: offsetFromRoot(projectRoot),
    rootTsConfigPath: getRelativePathToRootTsConfig(tree, projectRoot),
    tmpl: '',
  });
};

const changeProjectConfiguration = (
  tree: Tree,
  projectOptions: NormalizedProjectOptionsLibrary,
): void => {
  const { projectName, projectRoot } = projectOptions;
  const config = readProjectConfiguration(tree, projectName);

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

  updateProjectConfiguration(tree, projectName, config);
};

const changeSrcDirectory = (
  tree: Tree,
  projectOptions: NormalizedProjectOptionsLibrary,
): void => {
  const { projectRoot, importPath } = projectOptions;

  tree.delete(joinPathFragments(projectRoot, 'src'));

  const tsConfigBaseFilePath = 'tsconfig.base.json';
  const tsConfigBase = readJson(tree, tsConfigBaseFilePath);
  tsConfigBase.compilerOptions.paths[importPath] = [
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
  projectOptions: NormalizedProjectOptionsLibrary,
): void => {
  const { projectRoot } = projectOptions;

  const jestConfig = tree.read(
    `${projectRoot}/jest.config.ts`,
    'utf-8',
  ) as string;
  const lines = jestConfig.split('\n');
  lines.pop();
  lines.pop();
  const extendedJestConfig = lines.join('\n') + jestConfigSnippet;
  tree.write(`${projectRoot}/jest.config.ts`, extendedJestConfig);
};

export const cdkLibGenerator = async (
  tree: Tree,
  options: CdkLibSchema,
): Promise<GeneratorCallback> => {
  const versions = getVersions();
  const projectOptions = normalizeProjectOptions(tree, {
    name: options.name,
    directory: options.directory,
    projectType: ProjectType.Library,
    importPath: options.importPath,
  });

  const tasks: GeneratorCallback[] = [];

  tasks.push(
    await initGenerator(tree, {
      skipFormat: true,
    }),
  );

  tasks.push(await addJsLibrary(tree, options, projectOptions));

  addFiles(tree, projectOptions, versions);

  changeProjectConfiguration(tree, projectOptions);
  changeSrcDirectory(tree, projectOptions);
  changeJestConfig(tree, projectOptions);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
};

export default cdkLibGenerator;
