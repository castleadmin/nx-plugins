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
  handlerPath,
  outputPath,
  external,
  tsconfig,
  treeshake,
  copyTargets,
}: {
  handlerPath: string;
  outputPath: string;
  external: ExternalOption;
  tsconfig: string;
  treeshake: boolean | TreeshakingPreset | TreeshakingOptions;
  copyTargets: { src: string; dest: string }[];
}): RollupOptions => ({
  input: handlerPath,
  external,
  treeshake,
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (copy as any)({
      targets: copyTargets,
    }),
    json(),
    typescript({
      tsconfig,
      compilerOptions: {
        outDir: outputPath,
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
  outputPath,
  outputFileName,
}: {
  handlerName: string;
  outputPath: string;
  outputFileName: string;
}): OutputOptions => ({
  format: 'esm',
  dir: outputPath,
  name: handlerName,
  entryFileNames: outputFileName,
  chunkFileNames: 'lib/[name].mjs',
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
