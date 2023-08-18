import { Tree, readProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { sharedGenerator } from './generator';
import { SharedGeneratorSchema } from './schema';

describe('shared generator', () => {
  let tree: Tree;
  const options: SharedGeneratorSchema = { sharedResourcesName: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await sharedGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
