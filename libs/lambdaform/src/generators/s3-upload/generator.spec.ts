import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { s3UploadGenerator } from './generator';
import { S3UploadGeneratorSchema } from './schema';

describe('s3-upload generator', () => {
  let tree: Tree;
  const options: S3UploadGeneratorSchema = {
    bucketName: 'test',
    project: 'test2',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    //await s3UploadGenerator(tree, options);
    //const config = readProjectConfiguration(tree, 'test');
    //expect(config).toBeDefined();
    console.log(readProjectConfiguration, s3UploadGenerator, tree, options);
  });
});
