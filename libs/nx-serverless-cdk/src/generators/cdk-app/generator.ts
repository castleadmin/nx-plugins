import {
  addDependenciesToPackageJson,
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

const addESLint = async (
  tree: Tree,
  options: CdkAppSchema,
  projectRoot: string,
): Promise<GeneratorCallback> => {
  return await lintProjectGenerator(tree, {
    project: options.appName,
    linter: Linter.EsLint,
    eslintFilePatterns: [`${projectRoot}/**/*.ts`],
    tsConfigPaths: [joinPathFragments(projectRoot, 'tsconfig.app.json')],
    skipFormat: true,
    setParserOptionsProject: false,
    skipPackageJson: false,
    unitTestRunner: 'jest',
    rootProject: false,
  });
};

const jestConfigGenericSnippet = `,
  collectCoverageFrom: [
    'cdk/**/*.ts',
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

const jestConfigLambdaSnippet = `,
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
  options: CdkAppSchema,
  projectRoot: string,
  isLambdaApp: boolean,
): Promise<GeneratorCallback> => {
  const callback = await configurationGenerator(tree, {
    project: options.appName,
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
  const extendedJestConfig =
    lines.join('\n') +
    (isLambdaApp ? jestConfigLambdaSnippet : jestConfigGenericSnippet);
  tree.write(`${projectRoot}/jest.config.ts`, extendedJestConfig);

  return callback;
};

const addE2ETestsProject = async (
  tree: Tree,
  options: CdkAppSchema,
): Promise<GeneratorCallback> => {
  return await e2eProjectGenerator(tree, {
    project: options.appName,
    appType: options.appType,
    skipFormat: true,
  });
};

export const cdkAppGenerator = async (
  tree: Tree,
  options: CdkAppSchema,
): Promise<GeneratorCallback> => {
  const versions = getVersions();
  const appsDir = getWorkspaceLayout(tree).appsDir;
  const projectName = names(options.appName).fileName;
  const projectRoot = joinPathFragments(appsDir, projectName);
  const isLambdaApp = options.appType === AppType.lambda;

  const tasks: GeneratorCallback[] = [];

  tasks.push(
    await initGenerator(tree, {
      skipFormat: true,
    }),
  );

  if (isLambdaApp) {
    tasks.push(addLambdaDependencies(tree, versions));
  }

  generateFiles(
    tree,
    resolve(__dirname, isLambdaApp ? 'files-lambda' : 'files-generic'),
    projectRoot,
    {
      ...options,
      offset: offsetFromRoot(projectRoot),
      rootTsConfigPath: getRelativePathToRootTsConfig(tree, projectRoot),
      tmpl: '',
    },
  );

  addProjectConfiguration(
    tree,
    options.appName,
    createProjectConfiguration(projectRoot, options),
  );

  tasks.push(await addESLint(tree, options, projectRoot));
  tasks.push(await addJest(tree, options, projectRoot, isLambdaApp));
  tasks.push(await addE2ETestsProject(tree, options));

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
};

export default cdkAppGenerator;
