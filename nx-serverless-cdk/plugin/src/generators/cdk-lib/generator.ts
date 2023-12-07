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
    setParserOptionsProject: false,
    config: 'project',
    bundler: 'esbuild',
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
  projectOptions: NormalizedProjectOptionsLibrary,
): void => {
  const { projectName, projectRoot } = projectOptions;
  const config = readProjectConfiguration(tree, projectName);

  config.sourceRoot = joinPathFragments(projectRoot, 'cdk');

  const configTargets = config.targets as NonNullable<typeof config.targets>;
  configTargets['build-declarations'] = {
    executor: '@nx/js:tsc',
    options: {
      cache: false,
      clean: true,
      main: joinPathFragments(projectRoot, 'cdk', 'index.ts'),
      outputPath: joinPathFragments('dist', projectRoot),
      tsConfig: joinPathFragments(projectRoot, 'tsconfig.cdk.dts.json'),
    },
    dependsOn: ['^build-declarations'],
  };

  configTargets['build'] = {
    executor: '@nx/esbuild:esbuild',
    outputs: ['{options.outputPath}'],
    options: {
      assets: [joinPathFragments(projectRoot, '*.md')],
      bundle: true,
      // handled by build-declarations
      deleteOutputPath: false,
      format: ['cjs'],
      main: joinPathFragments(projectRoot, 'cdk', 'index.ts'),
      minify: true,
      outputPath: joinPathFragments('dist', projectRoot),
      platform: 'node',
      esbuildOptions: {
        outExtension: {
          '.js': '.js',
        },
        sourcemap: 'inline',
        sourcesContent: true,
      },
      target: 'node20',
      thirdParty: false,
      tsConfig: joinPathFragments(projectRoot, 'tsconfig.cdk.json'),
    },
    dependsOn: ['build-declarations'],
  };

  config.targets = Object.keys(configTargets)
    .sort()
    .reduce((acc, key) => ({ ...acc, ...{ [key]: configTargets[key] } }), {});

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

const removeTsconfigLibJson = (
  tree: Tree,
  projectOptions: NormalizedProjectOptionsLibrary,
): void => {
  const { projectRoot } = projectOptions;

  tree.delete(joinPathFragments(projectRoot, 'tsconfig.lib.json'));
};

const jestConfigSnippet = `,
  collectCoverageFrom: [
    'cdk/**/*.ts',
    '!cdk/index.ts',
    '!jest.config.ts',
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

  changeProjectConfiguration(tree, projectOptions);
  changeSrcDirectory(tree, projectOptions);
  removeTsconfigLibJson(tree, projectOptions);
  changeJestConfig(tree, projectOptions);

  addFiles(tree, projectOptions, versions);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
};

export default cdkLibGenerator;
