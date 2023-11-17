import { faker } from '@faker-js/faker';
import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import cdkLibGenerator from './generator';
import { CdkLibSchema } from './schema';

describe('cdk-lib generator', () => {
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
      options = { libName: faker.lorem.word().toLowerCase(), skipFormat: true };
    });

    test('should generate a cdk directory.', async () => {
      await cdkLibGenerator(tree, options);

      expect(tree.exists(`libs/${options.libName}/cdk`)).toBe(true);
      expect(tree.isFile(`libs/${options.libName}/cdk`)).toBe(false);
    });

    test('should format the project files and run successful.', async () => {
      options.skipFormat = false;

      const generator = await cdkLibGenerator(tree, options);

      expect(generator).toBeTruthy();
    });
  });
});
