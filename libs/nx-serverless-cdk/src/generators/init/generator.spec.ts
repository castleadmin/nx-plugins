import { readJson, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { initGenerator } from './generator';
import { InitSchema } from './schema';

describe('init', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  describe('Given an init generator,', () => {
    let options: InitSchema;

    beforeEach(() => {
      options = {
        skipFormat: true,
      };
    });

    test('should generate the workspace tsconfig file.', async () => {
      await initGenerator(tree, options);

      expect(tree.exists(`tsconfig.base.json`)).toBe(true);
      expect(tree.isFile(`tsconfig.base.json`)).toBe(true);
    });

    test('should generate the workspace jest preset file.', async () => {
      await initGenerator(tree, options);

      expect(tree.exists(`jest.preset.js`)).toBe(true);
      expect(tree.isFile(`jest.preset.js`)).toBe(true);
    });

    test('should add init dependencies.', async () => {
      await initGenerator(tree, options);

      const packageJson = readJson(tree, 'package.json');

      expect(packageJson.dependencies['aws-cdk-lib']).toBeTruthy();
      expect(packageJson.dependencies['constructs']).toBeTruthy();
      expect(packageJson.dependencies['source-map-support']).toBeTruthy();
      expect(packageJson.dependencies['tslib']).toBeTruthy();

      expect(packageJson.devDependencies['aws-cdk']).toBeTruthy();
      expect(packageJson.devDependencies['ts-node']).toBeTruthy();
      expect(packageJson.devDependencies['@types/node']).toBeTruthy();
    });

    test('should format the project files and run successful.', async () => {
      options.skipFormat = false;

      const generator = await initGenerator(tree, options);

      expect(generator).toBeTruthy();
    });
  });
});
