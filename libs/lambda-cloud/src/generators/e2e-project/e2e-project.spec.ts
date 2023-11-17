import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { AppType } from '../cdk-app/app-type';
import cdkAppGenerator from '../cdk-app/generator';
import { e2eProjectGenerator } from './e2e-project';

describe('e2eProjectGenerator', () => {
  let tree: Tree;

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
  });

  test('Should generate default spec for a generic app.', async () => {
    await cdkAppGenerator(tree, {
      appName: 'test',
      appType: AppType.generic,
      skipFormat: true
    });
    await e2eProjectGenerator(tree, {
      project: 'test',
      skipFormat: true
    });

    expect(tree.exists(`test-e2e/src/api/api.spec.ts`)).toBeTruthy();
  });

  test('Should generate default spec for a lambda app.', async () => {
    await cdkAppGenerator(tree, {
      appName: 'test',
      appType: AppType.lambda,
      skipFormat: true
    });
    await e2eProjectGenerator(tree, {
      project: 'test',
      skipFormat: true
    });

    expect(tree.exists(`test-e2e/src/api/api.spec.ts`)).toBeTruthy();
  });
});
