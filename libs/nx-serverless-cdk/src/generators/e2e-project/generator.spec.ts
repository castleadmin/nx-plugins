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
    tree.write(
      'nx.json',
      JSON.stringify(
        {
          $schema: './node_modules/nx/schemas/nx-schema.json',
          workspaceLayout: {
            appsDir: 'apps',
            libsDir: 'libs',
          },
        },
        null,
        2,
      ),
    );
  });

  describe('Given a generic e2e project generator,', () => {
    let options: E2ESchema;
    let projectFileName: string;

    beforeEach(() => {
      options = {
        project: faker.word.sample().toUpperCase(),
        appType: AppType.generic,
        skipFormat: true,
      };
      projectFileName = options.project.toLowerCase();
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

    test('should generate the example spec.', async () => {
      await e2eProjectGenerator(tree, options);

      expect(
        tree.exists(
          `apps/${projectFileName}-e2e/src/${projectFileName}.spec.ts`,
        ),
      ).toBeTruthy();
    });

    test('should generate the project configuration file.', async () => {
      await e2eProjectGenerator(tree, options);

      expect(tree.exists(`apps/${projectFileName}-e2e/project.json`)).toBe(
        true,
      );
      expect(tree.isFile(`apps/${projectFileName}-e2e/project.json`)).toBe(
        true,
      );
    });

    test('should generate a tsconfig file with correct references.', async () => {
      await e2eProjectGenerator(tree, options);

      const tsconfig = readJson(
        tree,
        `apps/${projectFileName}-e2e/tsconfig.json`,
      );
      expect(tsconfig.references).toEqual([
        {
          path: './tsconfig.spec.json',
        },
      ]);
    });

    test('should generate the eslint configuration file.', async () => {
      await e2eProjectGenerator(tree, options);

      expect(tree.exists(`apps/${projectFileName}-e2e/.eslintrc.json`)).toBe(
        true,
      );
      expect(tree.isFile(`apps/${projectFileName}-e2e/.eslintrc.json`)).toBe(
        true,
      );
    });

    test('should generate the jest configuration file.', async () => {
      await e2eProjectGenerator(tree, options);

      expect(tree.exists(`apps/${projectFileName}-e2e/jest.config.ts`)).toBe(
        true,
      );
      expect(tree.isFile(`apps/${projectFileName}-e2e/jest.config.ts`)).toBe(
        true,
      );
    });

    test('should modify the jest configuration file.', async () => {
      options.skipFormat = false;
      await e2eProjectGenerator(tree, options);

      expect(
        tree.read(`apps/${projectFileName}-e2e/jest.config.ts`, 'utf-8'),
      ).toEqual(
        `/* eslint-disable */
export default {
  displayName: '${options.project}-e2e',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/${projectFileName}-e2e',
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
};
`,
      );
    });

    test('should not add a test target to the project configuration.', async () => {
      await e2eProjectGenerator(tree, options);

      const config = readProjectConfiguration(tree, `${options.project}-e2e`);
      expect(config.targets?.['test']).toBeFalsy();
    });

    test('should format the project files and run successful.', async () => {
      options.skipFormat = false;

      const result = await e2eProjectGenerator(tree, options);

      expect(result).toBeTruthy();
    });
  });

  describe('Given a lambda e2e project generator,', () => {
    let options: E2ESchema;
    let projectFileName: string;

    beforeEach(() => {
      options = {
        project: faker.word.sample().toUpperCase(),
        appType: AppType.lambda,
        skipFormat: true,
      };
      projectFileName = options.project.toLowerCase();
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

    test('should generate the example spec.', async () => {
      await e2eProjectGenerator(tree, options);

      expect(
        tree.exists(
          `apps/${projectFileName}-e2e/src/${projectFileName}.spec.ts`,
        ),
      ).toBeTruthy();
    });

    test('should generate the project configuration file.', async () => {
      await e2eProjectGenerator(tree, options);

      expect(tree.exists(`apps/${projectFileName}-e2e/project.json`)).toBe(
        true,
      );
      expect(tree.isFile(`apps/${projectFileName}-e2e/project.json`)).toBe(
        true,
      );
    });

    test('should generate a tsconfig file with correct references.', async () => {
      await e2eProjectGenerator(tree, options);

      const tsconfig = readJson(
        tree,
        `apps/${projectFileName}-e2e/tsconfig.json`,
      );
      expect(tsconfig.references).toEqual([
        {
          path: './tsconfig.spec.json',
        },
      ]);
    });

    test('should generate the eslint configuration file.', async () => {
      await e2eProjectGenerator(tree, options);

      expect(tree.exists(`apps/${projectFileName}-e2e/.eslintrc.json`)).toBe(
        true,
      );
      expect(tree.isFile(`apps/${projectFileName}-e2e/.eslintrc.json`)).toBe(
        true,
      );
    });

    test('should generate the jest configuration file.', async () => {
      await e2eProjectGenerator(tree, options);

      expect(tree.exists(`apps/${projectFileName}-e2e/jest.config.ts`)).toBe(
        true,
      );
      expect(tree.isFile(`apps/${projectFileName}-e2e/jest.config.ts`)).toBe(
        true,
      );
    });

    test('should modify the jest configuration file.', async () => {
      options.skipFormat = false;
      await e2eProjectGenerator(tree, options);

      expect(
        tree.read(`apps/${projectFileName}-e2e/jest.config.ts`, 'utf-8'),
      ).toEqual(
        `/* eslint-disable */
export default {
  displayName: '${options.project}-e2e',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/${projectFileName}-e2e',
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
};
`,
      );
    });

    test('should not add a test target to the project configuration.', async () => {
      await e2eProjectGenerator(tree, options);

      const config = readProjectConfiguration(tree, `${options.project}-e2e`);
      expect(config.targets?.['test']).toBeFalsy();
    });

    test('should format the project files and run successful.', async () => {
      options.skipFormat = false;

      const result = await e2eProjectGenerator(tree, options);

      expect(result).toBeTruthy();
    });
  });
});
