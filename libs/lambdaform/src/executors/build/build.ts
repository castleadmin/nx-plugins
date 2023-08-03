import {
  ExternalOption,
  OutputOptions,
  RollupBuild,
  RollupOptions,
  RollupOutput,
  TreeshakingOptions,
  TreeshakingPreset,
  rollup,
} from 'rollup';
import * as copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export const createInputOptions = ({
  handlerSrcPathResolved,
  outputPathHandlerResolved,
  external,
  tsconfigResolved,
  treeshake,
  copyTargets,
}: {
  handlerSrcPathResolved: string;
  outputPathHandlerResolved: string;
  external: ExternalOption;
  tsconfigResolved: string;
  treeshake: boolean | TreeshakingPreset | TreeshakingOptions;
  copyTargets: { src: string; dest: string }[];
}): RollupOptions => ({
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
  ],
});

export const createOutputOptions = ({
  handlerName,
  outputPathHandlerResolved,
  outputFileName,
}: {
  handlerName: string;
  outputPathHandlerResolved: string;
  outputFileName: string;
}): OutputOptions => ({
  format: 'esm',
  dir: outputPathHandlerResolved,
  name: handlerName,
  entryFileNames: outputFileName,
  chunkFileNames: 'lib/[name].mjs',
  // TODO add option
  sourcemap: 'hidden',
});

export const build = async (
  inputOptions: RollupOptions,
  outputOptions: OutputOptions
): Promise<RollupOutput> => {
  let bundle: RollupBuild | undefined = undefined;

  try {
    bundle = await rollup(inputOptions);
    return await bundle.write(outputOptions);
  } finally {
    if (bundle) {
      await bundle.close();
    }
  }
};
