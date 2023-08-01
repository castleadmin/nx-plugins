import { TreeshakingPreset } from 'rollup';

export interface Handler {
  name: string;
  path: string;
  assets?: (AssetGlobPattern | string)[];
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
  externalDependencies: string[];

  deleteOutputPath: boolean;

  watch: boolean;
}
