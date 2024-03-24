import { faker } from '@faker-js/faker';
import { readJson, readProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { AppType } from '../cdk-app/app-type';
import { e2eProjectGenerator } from './generator';
import { E2ESchema } from './schema';

describe('e2e-project', () => {
  let tree: Tree;

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
  });

  describe('Given a generic e2e project generator,', () => {
    let options: E2ESchema;
    let project: string;
    let projectName: string;

    beforeEach(() => {
      project = faker.word.sample().toUpperCase();
      projectName = `${project}-e2e`;
      options = {
        name: projectName,
        directory: `apps/${projectName}`,
        project,
        type: AppType.generic,
        skipFormat: true,
      };
    });

    test('should generate the workspace tsconfig file.', async () => {
      await e2eProjectGenerator(tree, options);

      expect(tree.exists(`tsconfig.base.json`)).toBe(true);
      expect(tree.isFile(`tsconfig.base.json`)).toBe(true);
    });

    test('should add common dependencies.', async () => {
      await e2eProjectGenerator(tree, options);

      const packageJson = readJson(tree, 'package.json');

      expect(
        packageJson.dependencies['@aws-sdk/credential-providers'],
      ).toBeTruthy();
      expect(packageJson.dependencies['@aws-sdk/client-ssm']).toBeTruthy();
    });

    test('should add generic dependencies.', async () => {
      await e2eProjectGenerator(tree, options);

      const packageJson = readJson(tree, 'package.json');

      expect(packageJson.dependencies['@aws-sdk/client-sqs']).toBeTruthy();
    });

    test('should not add lambda dependencies.', async () => {
      await e2eProjectGenerator(tree, options);

      const packageJson = readJson(tree, 'package.json');

      expect(packageJson.dependencies['@aws-sdk/client-lambda']).toBeFalsy();
    });

    test('should generate the example specs.', async () => {
      await e2eProjectGenerator(tree, options);

      expect(
        tree.exists(`apps/${projectName}/src/environment.spec.ts`),
      ).toBeTruthy();
      expect(
        tree.exists(`apps/${projectName}/src/environment.ts`),
      ).toBeTruthy();
      expect(tree.exists(`apps/${projectName}/src/sdk-logger.ts`)).toBeTruthy();
      expect(
        tree.exists(`apps/${projectName}/src/receive-message.spec.ts`),
      ).toBeTruthy();
    });

    test('should generate the project configuration file.', async () => {
      await e2eProjectGenerator(tree, options);

      expect(tree.exists(`apps/${projectName}/project.json`)).toBe(true);
      expect(tree.isFile(`apps/${projectName}/project.json`)).toBe(true);
    });

    test('should not add a test target to the project configuration.', async () => {
      await e2eProjectGenerator(tree, options);

      const config = readProjectConfiguration(tree, `${options.project}-e2e`);
      expect(config.targets?.['test']).toBeFalsy();
    });

    test('should not add a generate-event target to the project configuration.', async () => {
      await e2eProjectGenerator(tree, options);

      const config = readProjectConfiguration(tree, `${options.project}-e2e`);
      expect(config.targets?.['generate-event']).toBeFalsy();
    });

    test('should generate a tsconfig file with correct references.', async () => {
      await e2eProjectGenerator(tree, options);

      const tsconfig = readJson(tree, `apps/${projectName}/tsconfig.json`);
      expect(tsconfig.references).toEqual([
        {
          path: './tsconfig.spec.json',
        },
      ]);
    });

    test('should generate the eslint configuration file.', async () => {
      await e2eProjectGenerator(tree, options);

      expect(tree.exists(`apps/${projectName}/.eslintrc.json`)).toBe(true);
      expect(tree.isFile(`apps/${projectName}/.eslintrc.json`)).toBe(true);
    });

    test('should generate the workspace jest preset file.', async () => {
      await e2eProjectGenerator(tree, options);

      expect(tree.exists(`jest.preset.js`)).toBe(true);
      expect(tree.isFile(`jest.preset.js`)).toBe(true);
    });

    test('should generate the jest configuration file.', async () => {
      await e2eProjectGenerator(tree, options);

      expect(tree.exists(`apps/${projectName}/jest.config.ts`)).toBe(true);
      expect(tree.isFile(`apps/${projectName}/jest.config.ts`)).toBe(true);
    });

    test('should modify the jest configuration file.', async () => {
      options.skipFormat = false;
      await e2eProjectGenerator(tree, options);

      expect(tree.read(`apps/${projectName}/jest.config.ts`, 'utf-8')).toEqual(
        `/* eslint-disable */
export default {
  displayName: '${options.project}-e2e',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/${projectName}',
  collectCoverageFrom: ['src/**/*.ts', '!jest.config.ts'],
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
`,
      );
    });

    test('should format the project files and run successful.', async () => {
      options.skipFormat = false;

      const result = await e2eProjectGenerator(tree, options);

      expect(result).toBeTruthy();
    });
  });

  describe('Given a lambda e2e project generator,', () => {
    let options: E2ESchema;
    let project: string;
    let projectName: string;

    beforeEach(() => {
      project = faker.word.sample().toUpperCase();
      projectName = `${project}-e2e`;
      options = {
        name: projectName,
        directory: `apps/${projectName}`,
        project,
        type: AppType.lambda,
        skipFormat: true,
      };
    });

    test('should add common dependencies.', async () => {
      await e2eProjectGenerator(tree, options);

      const packageJson = readJson(tree, 'package.json');

      expect(
        packageJson.dependencies['@aws-sdk/credential-providers'],
      ).toBeTruthy();
      expect(packageJson.dependencies['@aws-sdk/client-ssm']).toBeTruthy();
    });

    test('should not add generic dependencies.', async () => {
      await e2eProjectGenerator(tree, options);

      const packageJson = readJson(tree, 'package.json');

      expect(packageJson.dependencies['@aws-sdk/client-sqs']).toBeFalsy();
    });

    test('should add lambda dependencies.', async () => {
      await e2eProjectGenerator(tree, options);

      const packageJson = readJson(tree, 'package.json');

      expect(packageJson.dependencies['@aws-sdk/client-lambda']).toBeTruthy();
    });

    test('should generate the example specs.', async () => {
      await e2eProjectGenerator(tree, options);

      expect(
        tree.exists(`apps/${projectName}/src/environment.spec.ts`),
      ).toBeTruthy();
      expect(
        tree.exists(`apps/${projectName}/src/environment.ts`),
      ).toBeTruthy();
      expect(tree.exists(`apps/${projectName}/src/sdk-logger.ts`)).toBeTruthy();
      expect(
        tree.exists(`apps/${projectName}/src/calculate-product.spec.ts`),
      ).toBeTruthy();
      expect(
        tree.exists(`apps/${projectName}/src/calculate-sum.spec.ts`),
      ).toBeTruthy();
    });

    test('should generate the project configuration file.', async () => {
      await e2eProjectGenerator(tree, options);

      expect(tree.exists(`apps/${projectName}/project.json`)).toBe(true);
      expect(tree.isFile(`apps/${projectName}/project.json`)).toBe(true);
    });

    test('should not add a test target to the project configuration.', async () => {
      await e2eProjectGenerator(tree, options);

      const config = readProjectConfiguration(tree, `${options.project}-e2e`);
      expect(config.targets?.['test']).toBeFalsy();
    });

    test('should add a generate-event target to the project configuration.', async () => {
      await e2eProjectGenerator(tree, options);

      const config = readProjectConfiguration(tree, `${options.project}-e2e`);
      expect(config.targets?.['generate-event']).toBeTruthy();
    });

    test('should generate a tsconfig file with correct references.', async () => {
      await e2eProjectGenerator(tree, options);

      const tsconfig = readJson(tree, `apps/${projectName}/tsconfig.json`);
      expect(tsconfig.references).toEqual([
        {
          path: './tsconfig.spec.json',
        },
      ]);
    });

    test('should generate the eslint configuration file.', async () => {
      await e2eProjectGenerator(tree, options);

      expect(tree.exists(`apps/${projectName}/.eslintrc.json`)).toBe(true);
      expect(tree.isFile(`apps/${projectName}/.eslintrc.json`)).toBe(true);
    });

    test('should generate the jest configuration file.', async () => {
      await e2eProjectGenerator(tree, options);

      expect(tree.exists(`apps/${projectName}/jest.config.ts`)).toBe(true);
      expect(tree.isFile(`apps/${projectName}/jest.config.ts`)).toBe(true);
    });

    test('should modify the jest configuration file.', async () => {
      options.skipFormat = false;
      await e2eProjectGenerator(tree, options);

      expect(tree.read(`apps/${projectName}/jest.config.ts`, 'utf-8')).toEqual(
        `/* eslint-disable */
export default {
  displayName: '${options.project}-e2e',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/${projectName}',
  collectCoverageFrom: ['src/**/*.ts', '!jest.config.ts'],
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
`,
      );
    });

    test('should format the project files and run successful.', async () => {
      options.skipFormat = false;

      const result = await e2eProjectGenerator(tree, options);

      expect(result).toBeTruthy();
    });
  });
});
