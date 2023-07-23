import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { sharedGenerator } from './generator';
import { SharedGeneratorSchema } from './schema';

describe('shared generator', () => {
  let tree: Tree;
  const options: SharedGeneratorSchema = { sharedResourcesName: 'test', s3Upload: false };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await sharedGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
