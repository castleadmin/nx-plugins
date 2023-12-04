import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  GeneratorCallback,
  joinPathFragments,
  offsetFromRoot,
  ProjectConfiguration,
  readProjectConfiguration,
  runTasksInSerial,
  Tree,
  updateProjectConfiguration,
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
import { AppType } from '../cdk-app/app-type';
import initGenerator from '../init/generator';
import { E2ESchema } from './schema';
import { toValidSsmParameterName } from './to-valid-ssm-parameter-name';

const addCommonDependencies = (
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
    },
    {},
  );
};

const addGenericDependencies = (
  tree: Tree,
  versions: Versions,
): GeneratorCallback => {
  return addDependenciesToPackageJson(
    tree,
    {
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
      // E2E lambda dependencies
      '@aws-sdk/client-lambda': versions['@aws-sdk/client-lambda'],
    },
    {},
  );
};

const addConfiguration = (
  tree: Tree,
  options: E2ESchema,
  projectOptions: NormalizedProjectOptionsApplication,
): void => {
  const { projectName, projectRoot } = projectOptions;

  const projectConfiguration: ProjectConfiguration = {
    root: projectRoot,
    sourceRoot: joinPathFragments(projectRoot, 'src'),
    implicitDependencies: [options.project],
    projectType: 'application',
    targets: {
      e2e: {
        executor: '@nx/jest:jest',
        outputs: [`{workspaceRoot}/coverage/{projectRoot}`],
        cache: false,
        options: {
          jestConfig: `${projectRoot}/jest.config.ts`,
          passWithNoTests: true,
        },
      },
    },
  };

  if (options.type === AppType.lambda) {
    (
      projectConfiguration.targets as NonNullable<
        typeof projectConfiguration.targets
      >
    )['generate-event'] = {
      executor: 'nx-serverless-cdk:generate-event',
      options: {},
    };
  }

  addProjectConfiguration(tree, projectName, projectConfiguration);
};

const addEslint = async (
  tree: Tree,
  projectOptions: NormalizedProjectOptionsApplication,
): Promise<GeneratorCallback> => {
  const { projectName, projectRoot } = projectOptions;

  return await lintProjectGenerator(tree, {
    project: projectName,
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
  testTimeout: 10000,
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

  const config = readProjectConfiguration(tree, projectName);
  delete config.targets?.['test'];
  updateProjectConfiguration(tree, projectName, config);

  return callback;
};

const addFiles = (
  tree: Tree,
  options: E2ESchema,
  projectOptions: NormalizedProjectOptionsApplication,
): void => {
  const { projectRoot } = projectOptions;

  generateFiles(tree, resolve(__dirname, 'files'), projectRoot, {
    offset: offsetFromRoot(projectRoot),
    rootTsConfigPath: getRelativePathToRootTsConfig(tree, projectRoot),
    tmpl: '',
  });

  if (options.type === AppType.generic) {
    generateFiles(tree, resolve(__dirname, 'files-generic'), projectRoot, {
      project: options.project,
      toValidSsmParameterName,
      tmpl: '',
    });
  } else {
    generateFiles(tree, resolve(__dirname, 'files-lambda'), projectRoot, {
      project: options.project,
      toValidSsmParameterName,
      tmpl: '',
    });
  }
};

export const e2eProjectGenerator = async (
  tree: Tree,
  options: E2ESchema,
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

  tasks.push(addCommonDependencies(tree, versions));
  if (options.type === AppType.generic) {
    tasks.push(addGenericDependencies(tree, versions));
  } else {
    tasks.push(addLambdaDependencies(tree, versions));
  }

  addConfiguration(tree, options, projectOptions);

  tasks.push(await addEslint(tree, projectOptions));
  tasks.push(await addJest(tree, projectOptions));

  addFiles(tree, options, projectOptions);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
};

export default e2eProjectGenerator;
