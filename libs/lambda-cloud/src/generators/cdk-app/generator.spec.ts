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

  describe('Given an app generator of type generic,', () => {
    let options: CdkAppSchema;

    beforeEach(() => {
      options = {
        appName: faker.word.sample().toLowerCase(),
        appType: AppType.generic,
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

      expect(packageJson.devDependencies['@types/aws-lambda']).toBeFalsy();
      expect(packageJson.devDependencies['esbuild']).toBeFalsy();
    });

    test('should generate a cdk directory.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${options.appName}/cdk`)).toBe(true);
      expect(tree.isFile(`apps/${options.appName}/cdk`)).toBe(false);
    });

    test('should not generate a src directory.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${options.appName}/src`)).toBe(false);
    });

    test('should generate the project configuration file.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${options.appName}/project.json`)).toBe(true);
      expect(tree.isFile(`apps/${options.appName}/project.json`)).toBe(true);
    });

    test('should generate the eslint configuration file.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${options.appName}/.eslintrc.json`)).toBe(true);
      expect(tree.isFile(`apps/${options.appName}/.eslintrc.json`)).toBe(true);
    });

    test('should generate the jest configuration file.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${options.appName}/jest.config.ts`)).toBe(true);
      expect(tree.isFile(`apps/${options.appName}/jest.config.ts`)).toBe(true);
    });

    test('should generate the e2e project.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${options.appName}-e2e`)).toBe(true);
      expect(tree.isFile(`apps/${options.appName}-e2e`)).toBe(false);
    });

    test('should format the project files and run successful.', async () => {
      options.skipFormat = false;

      const generator = await cdkAppGenerator(tree, options);

      expect(generator).toBeTruthy();
    });
  });

  describe('Given an app generator of type lambda,', () => {
    let options: CdkAppSchema;

    beforeEach(() => {
      options = {
        appName: faker.word.sample().toLowerCase(),
        appType: AppType.lambda,
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

      expect(packageJson.devDependencies['@types/aws-lambda']).toBeTruthy();
      expect(packageJson.devDependencies['esbuild']).toBeTruthy();
    });

    test('should generate a cdk directory.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${options.appName}/cdk`)).toBe(true);
      expect(tree.isFile(`apps/${options.appName}/cdk`)).toBe(false);
    });

    test('should generate a src directory.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${options.appName}/src`)).toBe(true);
      expect(tree.isFile(`apps/${options.appName}/src`)).toBe(false);
    });

    test('should generate the project configuration file.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${options.appName}/project.json`)).toBe(true);
      expect(tree.isFile(`apps/${options.appName}/project.json`)).toBe(true);
    });

    test('should generate the eslint configuration file.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${options.appName}/.eslintrc.json`)).toBe(true);
      expect(tree.isFile(`apps/${options.appName}/.eslintrc.json`)).toBe(true);
    });

    test('should generate the jest configuration file.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${options.appName}/jest.config.ts`)).toBe(true);
      expect(tree.isFile(`apps/${options.appName}/jest.config.ts`)).toBe(true);
    });

    test('should generate the e2e project.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${options.appName}-e2e`)).toBe(true);
      expect(tree.isFile(`apps/${options.appName}-e2e`)).toBe(false);
    });

    test('should format the project files and run successful.', async () => {
      options.skipFormat = false;

      const generator = await cdkAppGenerator(tree, options);

      expect(generator).toBeTruthy();
    });
  });
});
