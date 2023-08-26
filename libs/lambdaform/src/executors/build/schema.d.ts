import { TreeshakingPreset } from 'rollup';

export enum Output {
  zip = 'zip',
}

export enum PackType {
  separately = 'separately',
  together = 'together',
}

export interface ZipOutputType {
  type: Output.zip;
  zipFileNames: string;
  excludeZipRegExp?: string;
}

export type OutputType = ZipOutputType;

export interface AssetGlobPattern {
  glob: string;
  input: string;
  output: string;
}

export interface Handler {
  name: string;
  main: string;
  assets: (AssetGlobPattern | string)[];
}

export interface BuildExecutorSchema {
  handlers: Handler[];
  tsConfig: string;
  pack: PackType;
  format: 'commonjs' | 'module';
  packageJsonType: 'commonjs' | 'module';
  outputPath: string;
  outputType: OutputType;
  entryFileNames: string;
  chunkFileNames: string;
  sourcemap: boolean | 'inline' | 'hidden';
  treeshake: boolean | TreeshakingPreset;
  minify: boolean | object;
  externalDependencies: 'all' | 'none' | string[];
  excludeAwsSdk: boolean;
  rollupConfig?: string;
  deleteOutputPath: boolean;
  verbose: boolean;
  watch: boolean;
}
