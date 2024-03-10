import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  GeneratorCallback,
  joinPathFragments,
  offsetFromRoot,
  runTasksInSerial,
  Tree,
  writeJson,
} from '@nx/devkit';
import { Linter, lintProjectGenerator } from '@nx/eslint';
import { configurationGenerator } from '@nx/jest';
import { getRelativePathToRootTsConfig } from '@nx/js';
import { ProjectType } from '@nx/workspace';
import { resolve } from 'node:path';
import normalizeProjectOptions, {
  NormalizedProjectOptionsApplication,
} from '../../utils/normalize-project-options';
import { getVersions, Versions } from '../../utils/versions';
import e2eProjectGenerator from '../e2e-project/generator';
import initGenerator from '../init/generator';
import { AppType } from './app-type';
import { createProjectConfiguration } from './create-project-configuration';
import { CdkAppSchema } from './schema';

const addLambdaDependencies = (
  tree: Tree,
  versions: Versions,
): GeneratorCallback => {
  return addDependenciesToPackageJson(
    tree,
    {
      // Lambda dependencies
      '@aws-lambda-powertools/logger':
        versions['@aws-lambda-powertools/logger'],
    },
    {
      // Lambda development dependencies
      '@types/aws-lambda': versions['@types/aws-lambda'],
      esbuild: versions['esbuild'],
    },
  );
};

const addConfiguration = (
  tree: Tree,
  options: CdkAppSchema,
  projectOptions: NormalizedProjectOptionsApplication,
): void => {
  const { projectName } = projectOptions;
  const defaultEnvironment = 'Dev';
  const environments = ['Dev', 'Stage', 'Prod'];

  const useInferredTasks = process.env['NX_ADD_PLUGINS'] !== 'false';

  addProjectConfiguration(
    tree,
    projectName,
    createProjectConfiguration({
      options,
      projectOptions,
      defaultEnvironment,
      environments,
      useInferredTasks,
    }),
  );
};

const addESLint = async (
  tree: Tree,
  projectOptions: NormalizedProjectOptionsApplication,
): Promise<GeneratorCallback> => {
  const { projectName, projectRoot } = projectOptions;

  return await lintProjectGenerator(tree, {
    project: projectName,
    linter: Linter.EsLint,
    eslintFilePatterns: [`${projectRoot}/**/*.ts`],
    tsConfigPaths: [joinPathFragments(projectRoot, 'tsconfig.cdk.json')],
    skipFormat: true,
    setParserOptionsProject: false,
    skipPackageJson: false,
    unitTestRunner: 'jest',
    rootProject: false,
  });
};

const jestConfigSnippet = `,
  collectCoverageFrom: [
    'cdk/**/*.ts',
    'shared/**/*.ts',
    'src/**/*.ts',
    '!cdk/main.ts',
    '!cdk.out/**/*',
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

const addJest = async (
  tree: Tree,
  projectOptions: NormalizedProjectOptionsApplication,
): Promise<GeneratorCallback> => {
  const { projectName, projectRoot } = projectOptions;

  writeJson(
    tree,
    joinPathFragments(projectOptions.projectRoot, 'tsconfig.json'),
    {},
  );

  const callback = await configurationGenerator(tree, {
    project: projectName,
    supportTsx: false,
    setupFile: 'none',
    skipSerializers: true,
    testEnvironment: 'node',
    skipFormat: true,
    compiler: 'tsc',
    skipPackageJson: false,
    js: false,
  });

  const jestConfig = tree.read(
    `${projectRoot}/jest.config.ts`,
    'utf-8',
  ) as string;
  const lines = jestConfig.split('\n');
  lines.pop();
  lines.pop();
  const extendedJestConfig = lines.join('\n') + jestConfigSnippet;
  tree.write(`${projectRoot}/jest.config.ts`, extendedJestConfig);

  return callback;
};

const addE2ETestsProject = async (
  tree: Tree,
  options: CdkAppSchema,
  projectOptions: NormalizedProjectOptionsApplication,
): Promise<GeneratorCallback> => {
  const { projectName, projectRoot } = projectOptions;

  return await e2eProjectGenerator(tree, {
    name: `${projectName}-e2e`,
    directory: `${projectRoot}-e2e`,
    project: projectName,
    type: options.type,
    skipFormat: true,
  });
};

const addFiles = (
  tree: Tree,
  options: CdkAppSchema,
  projectOptions: NormalizedProjectOptionsApplication,
): void => {
  const { projectName, projectRoot } = projectOptions;

  generateFiles(tree, resolve(__dirname, 'files'), projectRoot, {
    offset: offsetFromRoot(projectRoot),
    rootTsConfigPath: getRelativePathToRootTsConfig(tree, projectRoot),
    type: options.type,
    tmpl: '',
  });
  if (options.type === AppType.generic) {
    generateFiles(tree, resolve(__dirname, 'files-generic'), projectRoot, {
      projectName,
      tmpl: '',
    });
  } else {
    generateFiles(tree, resolve(__dirname, 'files-lambda'), projectRoot, {
      projectName,
      tmpl: '',
    });
  }
};

export const cdkAppGenerator = async (
  tree: Tree,
  options: CdkAppSchema,
): Promise<GeneratorCallback> => {
  const versions = getVersions();
  const projectOptions = normalizeProjectOptions(tree, {
    name: options.name,
    directory: options.directory,
    projectType: ProjectType.Application,
  });

  const tasks: GeneratorCallback[] = [];

  tasks.push(
    await initGenerator(tree, {
      skipFormat: true,
    }),
  );

  if (options.type === AppType.lambda) {
    tasks.push(addLambdaDependencies(tree, versions));
  }

  addConfiguration(tree, options, projectOptions);

  tasks.push(await addESLint(tree, projectOptions));
  tasks.push(await addJest(tree, projectOptions));
  tasks.push(await addE2ETestsProject(tree, options, projectOptions));

  addFiles(tree, options, projectOptions);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
};

export default cdkAppGenerator;
