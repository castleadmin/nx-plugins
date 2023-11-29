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
  ProjectConfiguration,
  readProjectConfiguration,
  runTasksInSerial,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { Linter, lintProjectGenerator } from '@nx/eslint';
import { configurationGenerator } from '@nx/jest';
import { getRelativePathToRootTsConfig } from '@nx/js';
import { resolve } from 'node:path';
import { getVersions, Versions } from '../../utils/versions';
import { AppType } from '../cdk-app/app-type';
import { E2ESchema } from './schema';

const addGenericDependencies = (
  tree: Tree,
  versions: Versions,
): GeneratorCallback => {
  return addDependenciesToPackageJson(
    tree,
    {
      // E2E common
      '@aws-sdk/credential-providers':
        versions['@aws-sdk/credential-providers'],
      '@aws-sdk/client-ssm': versions['@aws-sdk/client-ssm'],
      // E2E generic dependencies
      '@aws-sdk/client-sqs': versions['@aws-sdk/client-sqs'],
    },
    {},
  );
};

const addLambdaDependencies = (
  tree: Tree,
  versions: Versions,
): GeneratorCallback => {
  return addDependenciesToPackageJson(
    tree,
    {
      // E2E common
      '@aws-sdk/credential-providers':
        versions['@aws-sdk/credential-providers'],
      '@aws-sdk/client-ssm': versions['@aws-sdk/client-ssm'],
      // E2E lambda dependencies
      '@aws-sdk/client-lambda': versions['@aws-sdk/client-lambda'],
    },
    {},
  );
};

const addEslint = async (
  tree: Tree,
  projectRoot: string,
  appName: string,
): Promise<GeneratorCallback> => {
  return await lintProjectGenerator(tree, {
    project: appName,
    linter: Linter.EsLint,
    eslintFilePatterns: [`${projectRoot}/**/*.ts`],
    tsConfigPaths: [joinPathFragments(projectRoot, 'tsconfig.spec.json')],
    skipFormat: true,
    setParserOptionsProject: false,
    skipPackageJson: false,
    unitTestRunner: 'jest',
    rootProject: false,
  });
};

const jestConfigSnippet = `,
  collectCoverageFrom: [
    'src/**/*.ts',
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
  projectRoot: string,
  appName: string,
): Promise<GeneratorCallback> => {
  const callback = await configurationGenerator(tree, {
    project: appName,
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

  const config = readProjectConfiguration(tree, appName);
  delete config.targets?.['test'];
  updateProjectConfiguration(tree, appName, config);

  return callback;
};

export const e2eProjectGenerator = async (
  tree: Tree,
  options: E2ESchema,
): Promise<GeneratorCallback> => {
  const versions = getVersions();
  const appsDir = getWorkspaceLayout(tree).appsDir;
  const appName = `${options.project}-e2e`;
  const projectName = names(appName).fileName;
  const projectRoot = joinPathFragments(appsDir, projectName);

  const tasks: GeneratorCallback[] = [];

  if (options.appType === AppType.generic) {
    tasks.push(addGenericDependencies(tree, versions));
  } else {
    tasks.push(addLambdaDependencies(tree, versions));
  }

  generateFiles(tree, resolve(__dirname, 'files'), projectRoot, {
    ...options,
    offset: offsetFromRoot(projectRoot),
    rootTsConfigPath: getRelativePathToRootTsConfig(tree, projectRoot),
    tmpl: '',
  });

  if (options.appType === AppType.generic) {
    generateFiles(tree, resolve(__dirname, 'files-generic'), projectRoot, {
      ...options,
      tmpl: '',
    });
  } else {
    generateFiles(tree, resolve(__dirname, 'files-lambda'), projectRoot, {
      ...options,
      tmpl: '',
    });
  }

  const projectConfiguration: ProjectConfiguration = {
    root: projectRoot,
    sourceRoot: joinPathFragments(projectRoot, 'src'),
    implicitDependencies: [options.project],
    projectType: 'application',
    targets: {
      e2e: {
        executor: '@nx/jest:jest',
        outputs: [`{workspaceRoot}/coverage/{projectRoot}`],
        options: {
          jestConfig: `${projectRoot}/jest.config.ts`,
          passWithNoTests: true,
        },
      },
    },
  };

  if (options.appType === AppType.lambda) {
    (
      projectConfiguration.targets as NonNullable<
        typeof projectConfiguration.targets
      >
    )['generate-event'] = {
      executor: 'nx-serverless-cdk:generate-event',
      options: {},
    };
  }

  addProjectConfiguration(tree, appName, projectConfiguration);

  tasks.push(await addEslint(tree, projectRoot, appName));
  tasks.push(await addJest(tree, projectRoot, appName));

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
};

export default e2eProjectGenerator;
