import {
  addDependenciesToPackageJson,
  GeneratorCallback,
  Tree,
} from '@nx/devkit';
import { Versions } from '../../utils/versions';

export const addTsDependencies = (
  tree: Tree,
  versions: Versions
): GeneratorCallback => {
  return addDependenciesToPackageJson(
    tree,
    {
      tslib: versions.tslib,
    },
    {
      '@types/aws-lambda': versions['@types/aws-lambda'],
      '@types/node': versions['@types/node'],
    }
  );
};

export const addProjectDependencies = (
  tree: Tree,
  versions: Versions
): GeneratorCallback => {
  return addDependenciesToPackageJson(
    tree,
    {},
    {
      rollup: versions.rollup,
      'rollup-plugin-copy': versions['rollup-plugin-copy'],
      '@rollup/plugin-json': versions['@rollup/plugin-json'],
      '@rollup/plugin-node-resolve': versions['@rollup/plugin-node-resolve'],
      '@rollup/plugin-commonjs': versions['@rollup/plugin-commonjs'],
      '@rollup/plugin-typescript': versions['@rollup/plugin-typescript'],
      '@types/adm-zip': versions['@types/adm-zip'],
      'adm-zip': versions['adm-zip'],
    }
  );
};
