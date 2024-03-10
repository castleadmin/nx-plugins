import { faker } from '@faker-js/faker';
import { readJson, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { AppType } from './app-type';
import cdkAppGenerator from './generator';
import { CdkAppSchema } from './schema';

describe('cdk-app', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  describe('Given an app generator of type generic,', () => {
    let options: CdkAppSchema;
    let projectName: string;

    beforeEach(() => {
      projectName = faker.word.sample().toUpperCase();
      options = {
        name: projectName,
        directory: `apps/${projectName}`,
        type: AppType.generic,
        defaultEnvironment: 'Dev',
        environments: ['Dev', 'Stage', 'Prod'],
        skipFormat: true,
      };
    });

    test('should generate the workspace tsconfig file.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`tsconfig.base.json`)).toBe(true);
      expect(tree.isFile(`tsconfig.base.json`)).toBe(true);
    });

    test('should not add lambda dependencies.', async () => {
      await cdkAppGenerator(tree, options);

      const packageJson = readJson(tree, 'package.json');

      expect(
        packageJson.dependencies['@aws-lambda-powertools/logger'],
      ).toBeFalsy();
      expect(packageJson.devDependencies['@types/aws-lambda']).toBeFalsy();
      expect(packageJson.devDependencies['esbuild']).toBeFalsy();
    });

    test('should generate a cdk directory.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${projectName}/cdk`)).toBe(true);
      expect(tree.isFile(`apps/${projectName}/cdk`)).toBe(false);
    });

    test('should generate a src directory.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${projectName}/src`)).toBe(true);
    });

    test('should generate the project configuration file.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${projectName}/project.json`)).toBe(true);
      expect(tree.isFile(`apps/${projectName}/project.json`)).toBe(true);
    });

    test('should generate a tsconfig file with correct references.', async () => {
      await cdkAppGenerator(tree, options);

      const tsconfig = readJson(tree, `apps/${projectName}/tsconfig.json`);
      expect(tsconfig.references).toEqual([
        {
          path: './tsconfig.cdk.json',
        },
        {
          path: './tsconfig.spec.json',
        },
        {
          path: './tsconfig.src.json',
        },
      ]);
    });

    test('should generate the eslint configuration file.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${projectName}/.eslintrc.json`)).toBe(true);
      expect(tree.isFile(`apps/${projectName}/.eslintrc.json`)).toBe(true);
    });

    test('should generate the jest configuration file.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${projectName}/jest.config.ts`)).toBe(true);
      expect(tree.isFile(`apps/${projectName}/jest.config.ts`)).toBe(true);
    });

    test('should modify the jest configuration file.', async () => {
      options.skipFormat = false;
      await cdkAppGenerator(tree, options);

      expect(tree.read(`apps/${projectName}/jest.config.ts`, 'utf-8')).toEqual(
        `/* eslint-disable */
export default {
  displayName: '${projectName}',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/${projectName}',
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
`,
      );
    });

    test('should generate the e2e project.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${projectName}-e2e`)).toBe(true);
      expect(tree.isFile(`apps/${projectName}-e2e`)).toBe(false);
    });

    test('should format the project files and run successful.', async () => {
      options.skipFormat = false;

      const generator = await cdkAppGenerator(tree, options);

      expect(generator).toBeTruthy();
    });
  });

  describe('Given an app generator of type lambda,', () => {
    let options: CdkAppSchema;
    let projectName: string;

    beforeEach(() => {
      projectName = faker.word.sample().toUpperCase();
      options = {
        name: projectName,
        directory: `apps/${projectName}`,
        type: AppType.lambda,
        defaultEnvironment: 'Dev',
        environments: ['Dev', 'Stage', 'Prod'],
        skipFormat: true,
      };
    });

    test('should generate the workspace tsconfig file.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`tsconfig.base.json`)).toBe(true);
      expect(tree.isFile(`tsconfig.base.json`)).toBe(true);
    });

    test('should add lambda dependencies.', async () => {
      await cdkAppGenerator(tree, options);

      const packageJson = readJson(tree, 'package.json');

      expect(
        packageJson.dependencies['@aws-lambda-powertools/logger'],
      ).toBeTruthy();
      expect(packageJson.devDependencies['@types/aws-lambda']).toBeTruthy();
      expect(packageJson.devDependencies['esbuild']).toBeTruthy();
    });

    test('should generate a cdk directory.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${projectName}/cdk`)).toBe(true);
      expect(tree.isFile(`apps/${projectName}/cdk`)).toBe(false);
    });

    test('should generate a src directory.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${projectName}/src`)).toBe(true);
      expect(tree.isFile(`apps/${projectName}/src`)).toBe(false);
    });

    test('should generate the project configuration file.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${projectName}/project.json`)).toBe(true);
      expect(tree.isFile(`apps/${projectName}/project.json`)).toBe(true);
    });

    test('should generate a tsconfig file with correct references.', async () => {
      await cdkAppGenerator(tree, options);

      const tsconfig = readJson(tree, `apps/${projectName}/tsconfig.json`);
      expect(tsconfig.references).toEqual([
        {
          path: './tsconfig.cdk.json',
        },
        {
          path: './tsconfig.spec.json',
        },
        {
          path: './tsconfig.src.json',
        },
      ]);
    });

    test('should generate the eslint configuration file.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${projectName}/.eslintrc.json`)).toBe(true);
      expect(tree.isFile(`apps/${projectName}/.eslintrc.json`)).toBe(true);
    });

    test('should generate the jest configuration file.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${projectName}/jest.config.ts`)).toBe(true);
      expect(tree.isFile(`apps/${projectName}/jest.config.ts`)).toBe(true);
    });

    test('should modify the jest configuration file.', async () => {
      options.skipFormat = false;
      await cdkAppGenerator(tree, options);

      expect(tree.read(`apps/${projectName}/jest.config.ts`, 'utf-8')).toEqual(
        `/* eslint-disable */
export default {
  displayName: '${projectName}',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/${projectName}',
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
`,
      );
    });

    test('should generate the e2e project.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${projectName}-e2e`)).toBe(true);
      expect(tree.isFile(`apps/${projectName}-e2e`)).toBe(false);
    });

    test('should format the project files and run successful.', async () => {
      options.skipFormat = false;

      const generator = await cdkAppGenerator(tree, options);

      expect(generator).toBeTruthy();
    });
  });
});
