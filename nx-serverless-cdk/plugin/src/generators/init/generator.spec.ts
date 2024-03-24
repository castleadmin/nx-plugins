import { PluginConfiguration, readJson, Tree, writeJson } from '@nx/devkit';
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

    test("and a NX_ADD_PLUGINS environment variable that has been set to 'false', shouldn't modify the nx.json plugins.", async () => {
      process.env['NX_ADD_PLUGINS'] = 'false';

      const nxJsonBeforeInit = readJson(tree, 'nx.json');

      await initGenerator(tree, options);

      const nxJsonAfterInit = readJson(tree, 'nx.json');

      expect(nxJsonBeforeInit).toBeTruthy();
      expect(nxJsonBeforeInit).toEqual(nxJsonAfterInit);
    });

    describe("and a NX_ADD_PLUGINS environment variable that hasn't been defined", () => {
      beforeEach(() => {
        delete process.env['NX_ADD_PLUGINS'];
      });

      test('should modify the nx.json plugins.', async () => {
        const nxJsonBeforeInit = readJson(tree, 'nx.json');

        await initGenerator(tree, options);

        const nxJsonAfterInit = readJson(tree, 'nx.json');

        expect(nxJsonBeforeInit).toBeTruthy();
        expect(nxJsonBeforeInit.plugins).toBeFalsy();
        expect(
          nxJsonAfterInit.plugins.find(
            (p: PluginConfiguration) =>
              typeof p !== 'string' && p.plugin === 'nx-serverless-cdk/plugin',
          ),
        ).toEqual({
          plugin: 'nx-serverless-cdk/plugin',
          options: {
            cdkTargetName: 'cdk',
            deployTargetName: 'deploy',
            deployAllTargetName: 'deploy-all',
            destroyTargetName: 'destroy',
            diffTargetName: 'diff',
            lsTargetName: 'ls',
            synthTargetName: 'synth',
            watchTargetName: 'watch',
            generateEventTargetName: 'generate-event',
            invokeTargetName: 'invoke',
            startApiTargetName: 'start-api',
            startLambdaTargetName: 'start-lambda',
          },
        });
      });

      test("and an existing plugin entry in nx.json of type string, shouldn't modify the nx.json plugins.", async () => {
        const nxJsonBeforeInit = readJson(tree, 'nx.json');
        nxJsonBeforeInit.plugins = ['nx-serverless-cdk/plugin'];
        writeJson(tree, 'nx.json', nxJsonBeforeInit);

        await initGenerator(tree, options);

        const nxJsonAfterInit = readJson(tree, 'nx.json');

        expect(nxJsonBeforeInit).toBeTruthy();
        expect(nxJsonBeforeInit).toEqual(nxJsonAfterInit);
      });

      test("and an existing plugin entry in nx.json of type object, shouldn't modify the nx.json plugins.", async () => {
        const nxJsonBeforeInit = readJson(tree, 'nx.json');
        nxJsonBeforeInit.plugins = [
          { plugin: 'nx-serverless-cdk/plugin', options: {} },
        ];
        writeJson(tree, 'nx.json', nxJsonBeforeInit);

        await initGenerator(tree, options);

        const nxJsonAfterInit = readJson(tree, 'nx.json');

        expect(nxJsonBeforeInit).toBeTruthy();
        expect(nxJsonBeforeInit).toEqual(nxJsonAfterInit);
      });
    });

    test('should add init dependencies.', async () => {
      await initGenerator(tree, options);

      const packageJson = readJson(tree, 'package.json');

      expect(packageJson.dependencies['aws-cdk-lib']).toBeTruthy();
      expect(packageJson.dependencies['constructs']).toBeTruthy();
      expect(packageJson.dependencies['source-map-support']).toBeTruthy();
      expect(packageJson.dependencies['tslib']).toBeTruthy();

      expect(packageJson.devDependencies['aws-cdk']).toBeTruthy();
      expect(packageJson.devDependencies['tsconfig-paths']).toBeTruthy();
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
