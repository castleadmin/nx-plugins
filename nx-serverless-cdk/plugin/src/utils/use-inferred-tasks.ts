import { readNxJson, Tree } from '@nx/devkit';

export const useInferredTasks = (tree: Tree): boolean => {
  const nxJson = readNxJson(tree);

  return (
    process.env['NX_ADD_PLUGINS'] !== 'false' &&
    nxJson?.useInferencePlugins !== false
  );
};
