import {Tree} from "@nx/devkit";

export interface Versions {
  tslib: string;
  '@types/node': string;
  rollup: string;
  'rollup-plugin-copy': string;
  '@rollup/plugin-json': string;
  '@rollup/plugin-node-resolve': string;
  '@rollup/plugin-commonjs': string;
  '@rollup/plugin-typescript': string;
  awsTerraformProvider: string;
}

export const getVersions = async (tree: Tree): Promise<Versions> => {
  const packageJsonString = tree.read('package.json', 'utf-8');
  if (!packageJsonString) {
    throw new Error("package.json couldn't be read");
  }

  const packageJson = JSON.parse(packageJsonString);

  const tslib = packageJson.dependencies.tslib;
  if (!tslib) {
    throw new Error("tslib version isn't defined");
  }

  const typesNode = packageJson.devDependencies['@types/node'];
  if (!typesNode) {
    throw new Error("@types/node version isn't defined");
  }

  const rollup = '^3.26.2';
  const rollupPluginCopy = '^3.4.0';
  const rollupPluginJson = '^6.0.0';
  const rollupPluginNodeResolve = '^15.1.0';
  const rollupPluginCommonJs = '^25.0.3';
  const rollupPluginTypeScript= '^11.1.2';

  const awsTerraformProvider = '5.8.0';

  return {
    tslib,
    '@types/node': typesNode,
    rollup,
    'rollup-plugin-copy': rollupPluginCopy,
    '@rollup/plugin-json': rollupPluginJson,
    '@rollup/plugin-node-resolve': rollupPluginNodeResolve,
    '@rollup/plugin-commonjs': rollupPluginCommonJs,
    '@rollup/plugin-typescript': rollupPluginTypeScript,
    awsTerraformProvider
  };
};
