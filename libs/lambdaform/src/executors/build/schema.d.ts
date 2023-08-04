import { TreeshakingPreset } from 'rollup';

export interface Handler {
  name: string;
  path: string;
  assets?: (AssetGlobPattern | string)[];
  externalDependencies: 'all' | 'none' | string[];
  excludeAwsSdk: boolean;
}

export interface AssetGlobPattern {
  glob: string;
  input: string;
  output: string;
}

export interface BuildExecutorSchema {
  handlers: Handler[];
  tsConfig: string;
  outputPath: string;
  outputFileName: string;
  outputChunkNames: string;
  excludeZipRegExp?: string;
  format: 'commonjs' | 'module';
  packageJsonType: 'commonjs' | 'module';
  sourcemap: boolean | 'inline' | 'hidden';
  treeshake: boolean | TreeshakingPreset;
  minify: boolean | object;
  rollupConfig?: string;
  deleteOutputPath: boolean;
  verbose: boolean;
  // TODO
  watch: boolean;
}
