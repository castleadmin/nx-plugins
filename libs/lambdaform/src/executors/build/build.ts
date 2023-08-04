import {
  ExternalOption,
  OutputOptions,
  RollupBuild,
  RollupOptions,
  RollupOutput,
  TreeshakingOptions,
  TreeshakingPreset,
  rollup,
  Plugin,
} from 'rollup';
import * as copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { isAbsolute } from 'node:path';

export const createRollupOptions = ({
  handlerName,
  handlerSrcPathResolved,
  outputFileName,
  outputChunkNames,
  outputPathHandlerResolved,
  external,
  tsconfigResolved,
  format,
  sourcemap,
  treeshake,
  minify,
  copyTargets,
}: {
  handlerName: string;
  handlerSrcPathResolved: string;
  outputFileName: string;
  outputChunkNames: string;
  outputPathHandlerResolved: string;
  external: ExternalOption;
  tsconfigResolved: string;
  format: 'commonjs' | 'module';
  sourcemap: boolean | 'inline' | 'hidden';
  treeshake: boolean | TreeshakingPreset | TreeshakingOptions;
  minify: boolean | object;
  copyTargets: { src: string; dest: string }[];
}): RollupOptions => {
  let terserPlugin: Plugin | undefined = undefined;

  if (minify) {
    terserPlugin = typeof minify === 'boolean' ? terser() : terser(minify);
  }

  return {
    input: handlerSrcPathResolved,
    external,
    treeshake,
    plugins: [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (copy as any)({
        targets: copyTargets,
      }),
      json(),
      typescript({
        tsconfig: tsconfigResolved,
        compilerOptions: {
          outDir: outputPathHandlerResolved,
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
      dir: outputPathHandlerResolved,
      name: handlerName,
      entryFileNames: outputFileName,
      chunkFileNames: outputChunkNames,
      sourcemap,
      paths: paths,
    },
  };
};

const paths = (id: string): string => {
  if (isAbsolute(id)) {
    const nodeModules = 'node_modules';
    const index = id.indexOf(nodeModules);

    if (index !== -1) {
      return id.substring(index + nodeModules.length + 1);
    }
  }

  return id;
};

export const build = async (
  rollupOptions: RollupOptions
): Promise<RollupOutput> => {
  let bundle: RollupBuild | undefined = undefined;

  try {
    bundle = await rollup(rollupOptions);
    return await bundle.write(rollupOptions.output as OutputOptions);
  } finally {
    if (bundle) {
      await bundle.close();
    }
  }
};
