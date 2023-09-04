import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { dirname, relative, resolve } from 'node:path';
import {
  ExternalOption,
  OutputOptions,
  Plugin,
  RollupOptions,
  TreeshakingOptions,
  TreeshakingPreset,
} from 'rollup';
import copy from 'rollup-plugin-copy';
import { SourcemapPathTransform } from '../sourcemap-path-transform';
import { AssetCopyTarget } from './assets';

export const createRollupOptions = ({
  inputsResolved,
  tsConfigResolved,
  contextRootResolved,
  format,
  buildOutputPathResolved,
  entryFileNames,
  chunkFileNames,
  sourcemap,
  sourcemapExcludeSources,
  sourcemapBaseUrl,
  sourcemapPathTransform,
  treeshake,
  minify,
  external,
  assetCopyTargets,
  verbose,
}: {
  inputsResolved: { [handlerName: string]: string };
  tsConfigResolved: string;
  contextRootResolved: string;
  format: 'commonjs' | 'module';
  buildOutputPathResolved: string;
  entryFileNames: string;
  chunkFileNames: string;
  sourcemap: boolean | 'inline' | 'hidden';
  sourcemapExcludeSources: boolean;
  sourcemapBaseUrl: string | undefined;
  sourcemapPathTransform: SourcemapPathTransform;
  treeshake: boolean | TreeshakingPreset | TreeshakingOptions;
  minify: boolean | object;
  external: ExternalOption;
  assetCopyTargets: AssetCopyTarget[];
  verbose: boolean;
}): RollupOptions => {
  let terserPlugin: Plugin | undefined = undefined;

  if (minify) {
    terserPlugin = typeof minify === 'boolean' ? terser() : terser(minify);
  }

  const rollupOptions: RollupOptions = {
    input: inputsResolved,
    treeshake,
    external,
    logLevel: verbose ? 'debug' : 'info',
    output: {
      format,
      dir: buildOutputPathResolved,
      entryFileNames,
      chunkFileNames,
      sourcemap,
      sourcemapExcludeSources: sourcemapExcludeSources,
      sourcemapPathTransform: (relativeSourcePath, sourceMapPath) => {
        if (sourcemapPathTransform === SourcemapPathTransform.relative) {
          return relativeSourcePath;
        }

        const absoluteSourcePath = resolve(
          dirname(sourceMapPath),
          relativeSourcePath
        );

        if (sourcemapPathTransform === SourcemapPathTransform.absolute) {
          return absoluteSourcePath;
        }

        const relativeFromContextRootSourcePath = relative(
          contextRootResolved,
          absoluteSourcePath
        );

        return relativeFromContextRootSourcePath;
      },
    },
    plugins: [
      copy({
        targets: assetCopyTargets,
      }),
      json(),
      nodeResolve({
        preferBuiltins: true,
      }),
      commonjs(),
      typescript({
        tsconfig: tsConfigResolved,
        compilerOptions: {
          outDir: buildOutputPathResolved,
          // The following source map options are ignored by rollup.
          // The corresponding rollup options are used to define how source maps should be generated.
          sourceMap: Boolean(sourcemap),
          inlineSourceMap: false,
          mapRoot: undefined,
          sourceRoot: undefined,
          inlineSources: undefined,
        },
      }),
      terserPlugin,
    ],
  };

  if (sourcemapBaseUrl) {
    (rollupOptions.output as OutputOptions).sourcemapBaseUrl = sourcemapBaseUrl;
  }

  return rollupOptions;
};
