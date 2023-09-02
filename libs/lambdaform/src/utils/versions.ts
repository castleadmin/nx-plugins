export interface Versions {
  // TypeScript
  tslib: string;
  '@types/aws-lambda': string;
  '@types/node': string;
  // Build
  rollup: string;
  'rollup-plugin-copy': string;
  '@rollup/plugin-json': string;
  '@rollup/plugin-node-resolve': string;
  '@rollup/plugin-commonjs': string;
  '@rollup/plugin-typescript': string;
  '@rollup/plugin-terser': string;
  '@types/adm-zip': string;
  'adm-zip': string;
  '@types/fs-extra': string;
  'fs-extra': string;
  // Terraform
  awsTerraformProvider: string;
}

export const getVersions = (): Versions => {
  // TypeScript
  const tslib = '^2.3.0';
  const typesAwsLambda = '^8.10.119';
  const typesNode = '~18.7.1';
  // Build
  const rollup = '^3.28.1';
  const rollupPluginCopy = '^3.4.0';
  const rollupPluginJson = '^6.0.0';
  const rollupPluginNodeResolve = '^15.2.1';
  const rollupPluginCommonJs = '^25.0.4';
  const rollupPluginTypeScript = '^11.1.3';
  const rollupPluginTerser = '^0.4.3';
  const typesAdmZip = '^0.5.0';
  const admZip = '^0.5.10';
  const typesFsExtra = '^11.0.1';
  const fsExtra = '^11.1.1';
  // Terraform
  const awsTerraformProvider = '5.8.0';

  return {
    // TypeScript
    tslib,
    '@types/aws-lambda': typesAwsLambda,
    '@types/node': typesNode,
    // Build
    rollup,
    'rollup-plugin-copy': rollupPluginCopy,
    '@rollup/plugin-json': rollupPluginJson,
    '@rollup/plugin-node-resolve': rollupPluginNodeResolve,
    '@rollup/plugin-commonjs': rollupPluginCommonJs,
    '@rollup/plugin-typescript': rollupPluginTypeScript,
    '@rollup/plugin-terser': rollupPluginTerser,
    '@types/adm-zip': typesAdmZip,
    'adm-zip': admZip,
    '@types/fs-extra': typesFsExtra,
    'fs-extra': fsExtra,
    // Terraform
    awsTerraformProvider,
  };
};
