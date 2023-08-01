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
  zipFilterRegExp?: string;
  treeshake: TreeshakingPreset;
  // TODO
  rollupConfig?: string;
  deleteOutputPath: boolean;
  // TODO
  watch: boolean;
}
