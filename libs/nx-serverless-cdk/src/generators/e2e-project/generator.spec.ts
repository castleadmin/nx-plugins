import { faker } from '@faker-js/faker';
import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
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

  describe('Given an e2e project generator,', () => {
    let project: string;
    let options: E2ESchema;

    beforeEach(() => {
      project = faker.word.sample().toLowerCase();
      options = {
        project,
        skipFormat: true,
      };
    });

    test('should generate the example spec.', async () => {
      await e2eProjectGenerator(tree, options);

      expect(
        tree.exists(`apps/${project}-e2e/src/${project}/${project}.spec.ts`),
      ).toBeTruthy();
    });

    test('should generate the project configuration file.', async () => {
      await e2eProjectGenerator(tree, options);

      expect(tree.exists(`apps/${project}-e2e/project.json`)).toBe(true);
      expect(tree.isFile(`apps/${project}-e2e/project.json`)).toBe(true);
    });

    test('should generate the eslint configuration file.', async () => {
      await e2eProjectGenerator(tree, options);

      expect(tree.exists(`apps/${project}-e2e/.eslintrc.json`)).toBe(true);
      expect(tree.isFile(`apps/${project}-e2e/.eslintrc.json`)).toBe(true);
    });

    test('should format the project files and run successful.', async () => {
      options.skipFormat = false;

      const result = await e2eProjectGenerator(tree, options);

      expect(result).toBeTruthy();
    });
  });
});
