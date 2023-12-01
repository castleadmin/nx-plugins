import { faker } from '@faker-js/faker';
import { readJson, readProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import cdkLibGenerator from './generator';
import { CdkLibSchema } from './schema';

describe('cdk-lib', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  describe('Given a lib generator,', () => {
    let options: CdkLibSchema;
    let projectName: string;

    beforeEach(() => {
      projectName = faker.word.sample().toUpperCase();
      options = {
        name: projectName,
        directory: `libs/${projectName}`,
        skipFormat: true,
      };
    });

    test('should generate the workspace tsconfig file.', async () => {
      await cdkLibGenerator(tree, options);

      expect(tree.exists(`tsconfig.base.json`)).toBe(true);
      expect(tree.isFile(`tsconfig.base.json`)).toBe(true);
    });

    test('should generate the project configuration file.', async () => {
      await cdkLibGenerator(tree, options);

      expect(tree.exists(`libs/${projectName}/project.json`)).toBe(true);
      expect(tree.isFile(`libs/${projectName}/project.json`)).toBe(true);
    });

    test('should generate the eslint configuration file.', async () => {
      await cdkLibGenerator(tree, options);

      expect(tree.exists(`libs/${projectName}/.eslintrc.json`)).toBe(true);
      expect(tree.isFile(`libs/${projectName}/.eslintrc.json`)).toBe(true);
    });

    test('should generate the jest configuration file.', async () => {
      await cdkLibGenerator(tree, options);

      expect(tree.exists(`libs/${projectName}/jest.config.ts`)).toBe(true);
      expect(tree.isFile(`libs/${projectName}/jest.config.ts`)).toBe(true);
    });

    test('should modify the jest configuration file.', async () => {
      options.skipFormat = false;
      await cdkLibGenerator(tree, options);

      expect(tree.read(`libs/${projectName}/jest.config.ts`, 'utf-8')).toEqual(
        `/* eslint-disable */
export default {
  displayName: '${projectName}',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/${projectName}',
  collectCoverageFrom: ['cdk/**/*.ts', '!jest.config.ts', '!cdk/index.ts'],
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

    test('should generate a cdk directory.', async () => {
      await cdkLibGenerator(tree, options);

      expect(tree.exists(`libs/${projectName}/cdk`)).toBe(true);
      expect(tree.isFile(`libs/${projectName}/cdk`)).toBe(false);
    });

    test('should not generate a src directory.', async () => {
      await cdkLibGenerator(tree, options);

      expect(tree.exists(`libs/${projectName}/src`)).toBe(false);
    });

    test("should change the project configuration's source root.", async () => {
      await cdkLibGenerator(tree, options);

      const config = readProjectConfiguration(tree, projectName);
      expect(config.sourceRoot).toBe(`libs/${projectName}/cdk`);
    });

    test('should add a build target to the project configuration.', async () => {
      await cdkLibGenerator(tree, options);

      const config = readProjectConfiguration(tree, projectName);
      expect(config.targets?.['build']).toEqual({
        executor: `@nx/js:tsc`,
        outputs: ['{options.outputPath}'],
        options: {
          outputPath: `dist/libs/${projectName}`,
          tsConfig: `libs/${projectName}/tsconfig.lib.json`,
          packageJson: `libs/${projectName}/package.json`,
          main: `libs/${projectName}/cdk/index.ts`,
          assets: [`libs/${projectName}/*.md`],
        },
      });
    });

    test('should not add a publish target to the project configuration.', async () => {
      await cdkLibGenerator(tree, options);

      const config = readProjectConfiguration(tree, projectName);
      expect(config.targets?.['publish']).toBeFalsy();
    });

    test('should generate a tsconfig file with correct references.', async () => {
      await cdkLibGenerator(tree, options);

      const tsconfig = readJson(tree, `libs/${projectName}/tsconfig.json`);
      expect(tsconfig.references).toEqual([
        {
          path: './tsconfig.lib.json',
        },
        {
          path: './tsconfig.spec.json',
        },
      ]);
    });

    test('should use the project name as package.json name.', async () => {
      await cdkLibGenerator(tree, options);

      const workspacePackageJson = readJson(tree, 'package.json');
      const packageJson = readJson(tree, `libs/${projectName}/package.json`);
      expect(workspacePackageJson.name).toBe('@proj/source');
      expect(packageJson.name).toEqual(`@proj/${projectName}`);
    });

    test('should modify the path mapping in the tsconfig.base.json.', async () => {
      await cdkLibGenerator(tree, options);

      const tsconfigBase = readJson(tree, 'tsconfig.base.json');
      expect(
        tsconfigBase.compilerOptions.paths[`@proj/${projectName}`],
      ).toEqual([`libs/${projectName}/cdk/index.ts`]);
    });

    test('should format the project files and run successful.', async () => {
      options.skipFormat = false;

      const generator = await cdkLibGenerator(tree, options);

      expect(generator).toBeTruthy();
    });
  });

  describe('Given a lib generator that creates a publishable library,', () => {
    let options: CdkLibSchema;
    let projectName: string;
    let importPath: string;

    beforeEach(() => {
      projectName = faker.word.sample().toUpperCase();
      importPath = faker.word.sample().toLowerCase();
      options = {
        name: projectName,
        directory: `libs/${projectName}`,
        importPath,
        publishable: true,
        skipFormat: true,
      };
    });

    test('should add a publish target to the project configuration.', async () => {
      await cdkLibGenerator(tree, options);

      const config = readProjectConfiguration(tree, projectName);
      expect(config.targets?.['publish']).toBeTruthy();
    });

    test('should use the import path as package.json name.', async () => {
      await cdkLibGenerator(tree, options);

      const packageJson = readJson(tree, `libs/${projectName}/package.json`);
      expect(packageJson.name).toEqual(importPath);
    });

    test('should modify the path mapping in the tsconfig.base.json.', async () => {
      await cdkLibGenerator(tree, options);

      const tsconfigBase = readJson(tree, 'tsconfig.base.json');
      expect(tsconfigBase.compilerOptions.paths[importPath]).toEqual([
        `libs/${projectName}/cdk/index.ts`,
      ]);
    });
  });
});
