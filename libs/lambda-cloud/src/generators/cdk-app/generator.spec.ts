import { faker } from '@faker-js/faker';
import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { AppType } from './app-type';
import cdkAppGenerator from './generator';
import { CdkAppSchema } from './schema';

describe('cdk-app generator', () => {
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

    test('should generate a cdk directory.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${options.appName}/cdk`)).toBe(true);
      expect(tree.isFile(`apps/${options.appName}/cdk`)).toBe(false);
    });

    test('should not generate a src directory.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists(`apps/${options.appName}/src`)).toBe(false);
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

    test('should format the project files and run successful.', async () => {
      options.skipFormat = false;

      const generator = await cdkAppGenerator(tree, options);

      expect(generator).toBeTruthy();
    });
  });
});
