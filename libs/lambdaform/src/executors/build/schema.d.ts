import { TreeshakingPreset } from 'rollup';
import { OutputType } from './output-type';
import { PackType } from './pack-type';

export interface ZipOutput {
  type: OutputType.zip;
  zipFileNames: string;
  excludeZipRegExp?: string;
}

export type Output = ZipOutput;

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
  output: Output;
  entryFileNames: string;
  chunkFileNames: string;
  sourcemap: boolean | 'inline' | 'hidden';
  sourcemapExcludeSources: boolean;
  sourcemapBaseUrl?: string;
  sourcemapPathTransform: SourcemapPathTransform;
  treeshake: boolean | TreeshakingPreset;
  minify: boolean | object;
  externalDependencies: 'all' | 'none' | string[];
  excludeAwsSdk: boolean;
  rollupConfig?: string;
  deleteOutputPath: boolean;
  verbose: boolean;
  watch: boolean;
}
