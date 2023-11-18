import { faker } from '@faker-js/faker';
import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import cdkLibGenerator from './generator';
import { CdkLibSchema } from './schema';

describe('cdk-lib', () => {
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

  describe('Given a lib generator,', () => {
    let options: CdkLibSchema;

    beforeEach(() => {
      options = {
        libName: faker.word.sample().toLowerCase(),
        skipFormat: true,
      };
    });

    test('should generate the workspace tsconfig file.', async () => {
      await cdkLibGenerator(tree, options);

      expect(tree.exists(`tsconfig.base.json`)).toBe(true);
      expect(tree.isFile(`tsconfig.base.json`)).toBe(true);
    });

    test('should generate a cdk directory.', async () => {
      await cdkLibGenerator(tree, options);

      expect(tree.exists(`libs/${options.libName}/cdk`)).toBe(true);
      expect(tree.isFile(`libs/${options.libName}/cdk`)).toBe(false);
    });

    test('should generate the project configuration file.', async () => {
      await cdkLibGenerator(tree, options);

      expect(tree.exists(`libs/${options.libName}/project.json`)).toBe(true);
      expect(tree.isFile(`libs/${options.libName}/project.json`)).toBe(true);
    });

    test('should generate the eslint configuration file.', async () => {
      await cdkLibGenerator(tree, options);

      expect(tree.exists(`libs/${options.libName}/.eslintrc.json`)).toBe(true);
      expect(tree.isFile(`libs/${options.libName}/.eslintrc.json`)).toBe(true);
    });

    test('should generate the jest configuration file.', async () => {
      await cdkLibGenerator(tree, options);

      expect(tree.exists(`libs/${options.libName}/jest.config.ts`)).toBe(true);
      expect(tree.isFile(`libs/${options.libName}/jest.config.ts`)).toBe(true);
    });

    test('should format the project files and run successful.', async () => {
      options.skipFormat = false;

      const generator = await cdkLibGenerator(tree, options);

      expect(generator).toBeTruthy();
    });
  });
});
