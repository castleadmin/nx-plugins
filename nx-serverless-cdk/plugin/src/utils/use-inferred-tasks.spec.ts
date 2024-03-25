import {
  NxJsonConfiguration,
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { useInferredTasks } from './use-inferred-tasks';

describe('useInferredTasks', () => {
  let tree: Tree;

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
  });

  describe('Given a nx.json file with a falsy useInferencePlugins option,', () => {
    beforeEach(() => {
      const nxJson = readNxJson(tree) as NxJsonConfiguration;

      nxJson.useInferencePlugins = false;

      updateNxJson(tree, nxJson);
    });

    test("and the environment variable NX_ADD_PLUGINS with the value 'true', then inferred tasks shouldn't be used.", () => {
      process.env['NX_ADD_PLUGINS'] = 'true';
      expect(useInferredTasks(tree)).toBe(false);
    });

    test("and the environment variable NX_ADD_PLUGINS with the value 'false', then inferred tasks shouldn't be used.", () => {
      process.env['NX_ADD_PLUGINS'] = 'false';
      expect(useInferredTasks(tree)).toBe(false);
    });

    test("and the environment variable NX_ADD_PLUGINS hasn't been defined, then inferred tasks shouldn't be used.", () => {
      delete process.env['NX_ADD_PLUGINS'];
      expect(useInferredTasks(tree)).toBe(false);
    });
  });

  describe('Given a nx.json file with a truthy useInferencePlugins option,', () => {
    beforeEach(() => {
      const nxJson = readNxJson(tree) as NxJsonConfiguration;

      nxJson.useInferencePlugins = true;

      updateNxJson(tree, nxJson);
    });

    test("and the environment variable NX_ADD_PLUGINS with the value 'true', then inferred tasks should be used.", () => {
      process.env['NX_ADD_PLUGINS'] = 'true';
      expect(useInferredTasks(tree)).toBe(true);
    });

    test("and the environment variable NX_ADD_PLUGINS with the value 'false', then inferred tasks shouldn't be used.", () => {
      process.env['NX_ADD_PLUGINS'] = 'false';
      expect(useInferredTasks(tree)).toBe(false);
    });

    test("and the environment variable NX_ADD_PLUGINS hasn't been defined, then inferred tasks should be used.", () => {
      delete process.env['NX_ADD_PLUGINS'];
      expect(useInferredTasks(tree)).toBe(true);
    });
  });
});
