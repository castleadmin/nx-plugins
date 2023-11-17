import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import cdkLibGenerator from './generator';
import { CdkLibSchema } from './schema';

describe('cdk-lib generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  describe('Given a lib generator,', () => {
    let options: CdkLibSchema;

    beforeEach(() => {
      options = { libName: 'test', skipFormat: true };
    });

    test('should generate a cdk directory.', async () => {
      await cdkLibGenerator(tree, options);

      expect(tree.exists('cdk')).toBe(true);
      expect(tree.isFile('cdk')).toBe(false);
    });
  });
});
