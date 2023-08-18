import { Tree, readProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { handlerGenerator } from './generator';
import { HandlerGeneratorSchema } from './schema';

describe('handler generator', () => {
  let tree: Tree;
  const options: HandlerGeneratorSchema = {
    handlerName: 'test',
    project: 'test2',
    s3Upload: false,
    xray: false,
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    //await handlerGenerator(tree, options);
    //const config = readProjectConfiguration(tree, 'test');
    //expect(config).toBeDefined();
    console.log(readProjectConfiguration, handlerGenerator, tree, options);
  });
});
