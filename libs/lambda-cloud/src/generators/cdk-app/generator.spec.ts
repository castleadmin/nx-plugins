import {Tree} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { AppType } from './app-type';
import cdkAppGenerator from './generator';
import { CdkAppSchema } from './schema';

describe('cdk-app generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  describe('Given an app generator of type generic,', () => {
    let options: CdkAppSchema;

    beforeEach(() => {
      options = { appName: 'test', appType: AppType.generic, skipFormat: true };
    });

    test('should generate a cdk directory.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists('cdk')).toBe(true);
      expect(tree.isFile('cdk')).toBe(false);
    });

    test('should not generate a src directory.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists('src')).toBe(false);
    });
  });

  describe('Given an app generator of type lambda,', () => {
    let options: CdkAppSchema;

    beforeEach(() => {
      options = { appName: 'test', appType: AppType.lambda, skipFormat: true };
    });

    test('should generate a cdk directory.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists('cdk')).toBe(true);
      expect(tree.isFile('cdk')).toBe(false);
    });

    test('should generate a src directory.', async () => {
      await cdkAppGenerator(tree, options);

      expect(tree.exists('src')).toBe(true);
      expect(tree.isFile('src')).toBe(false);
    });
  });
});
