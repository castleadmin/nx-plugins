import { faker } from '@faker-js/faker';
import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { e2eProjectGenerator } from './e2e-project';

describe('e2eProjectGenerator', () => {
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

  test('Should generate the example spec.', async () => {
    const project = faker.word.sample().toLowerCase();
    await e2eProjectGenerator(tree, {
      project,
      skipFormat: true,
    });

    expect(
      tree.exists(`apps/${project}-e2e/src/${project}/${project}.spec.ts`),
    ).toBeTruthy();
  });

  test('Should format the project files and run successful.', async () => {
    const project = faker.word.sample().toLowerCase();

    const generator = await e2eProjectGenerator(tree, {
      project,
      skipFormat: false,
    });

    expect(generator).toBeTruthy();
  });
});
