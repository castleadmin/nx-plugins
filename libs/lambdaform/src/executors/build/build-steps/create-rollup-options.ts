import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import {
  ExternalOption,
  Plugin,
  RollupOptions,
  TreeshakingOptions,
  TreeshakingPreset,
} from 'rollup';
import * as copy from 'rollup-plugin-copy';
import { AssetCopyTarget } from './assets';

export const createRollupOptions = ({
  inputsResolved,
  tsConfigResolved,
  format,
  buildOutputPathResolved,
  entryFileNames,
  chunkFileNames,
  sourcemap,
  treeshake,
  minify,
  external,
  assetCopyTargets,
  verbose,
}: {
  inputsResolved: { [handlerName: string]: string };
  tsConfigResolved: string;
  format: 'commonjs' | 'module';
  buildOutputPathResolved: string;
  entryFileNames: string;
  chunkFileNames: string;
  sourcemap: boolean | 'inline' | 'hidden';
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

  return {
    input: inputsResolved,
    treeshake,
    external,
    logLevel: verbose ? 'debug' : 'info',
    plugins: [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (copy as any)({
        targets: assetCopyTargets,
      }),
      json(),
      typescript({
        tsconfig: tsConfigResolved,
        compilerOptions: {
          outDir: buildOutputPathResolved,
        },
      }),
      nodeResolve({
        preferBuiltins: true,
      }),
      commonjs(),
      terserPlugin,
    ],
    output: {
      format,
      dir: buildOutputPathResolved,
      entryFileNames,
      chunkFileNames,
      sourcemap,
    },
  };
};
