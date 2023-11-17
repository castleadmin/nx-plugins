import {
  addDependenciesToPackageJson,
  readJson,
  Tree,
  updateJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { initGenerator } from './init';

describe('init', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  test('Should add dependencies.', async () => {
    const existing = 'existing';
    const existingVersion = '1.0.0';

    addDependenciesToPackageJson(
      tree,
      {
        [existing]: existingVersion,
      },
      {
        [existing]: existingVersion,
      },
    );
    await initGenerator(tree, { skipFormat: true });

    const packageJson = readJson(tree, 'package.json');

    expect(packageJson.dependencies['tslib']).toBeDefined();
    expect(packageJson.dependencies[existing]).toBeDefined();

    expect(packageJson.devDependencies['@types/node']).toBeDefined();
    expect(packageJson.devDependencies['aws-cdk']).toBeDefined();
    expect(packageJson.devDependencies['aws-cdk-lib']).toBeDefined();
    expect(packageJson.devDependencies['constructs']).toBeDefined();
    expect(packageJson.devDependencies[existing]).toBeDefined();
  });

  test('Should add jest config.', async () => {
    await initGenerator(tree, { skipFormat: true });
    expect(tree.exists('jest.config.ts')).toEqual(true);
  });

  test('Should not fail when dependencies is missing from package.json and no other init generators are invoked.', async () => {
    updateJson(tree, 'package.json', (json) => {
      delete json.dependencies;
      return json;
    });

    const generator = await initGenerator(tree, { skipFormat: true });

    expect(generator).toBeTruthy();
  });

  test('Should format the project files and run successful.', async () => {
    const generator = await initGenerator(tree, { skipFormat: false });

    expect(generator).toBeTruthy();
  });
});
