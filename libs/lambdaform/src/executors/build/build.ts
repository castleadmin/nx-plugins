import {
  OutputOptions,
  rollup,
  RollupBuild,
  RollupOptions,
  TreeshakingOptions,
  TreeshakingPreset,
} from 'rollup';
import copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export const createInputOptions = ({
  handlerPath,
  outputPath,
  tsconfig,
  treeshake,
  copyTargets,
}: {
  handlerPath: string;
  outputPath: string;
  tsconfig: string;
  treeshake: boolean | TreeshakingPreset | TreeshakingOptions;
  copyTargets: { src: string; dest: string }[];
}): RollupOptions => ({
  input: handlerPath,
  treeshake,
  plugins: [
    copy({
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
): Promise<void> => {
  let bundle: RollupBuild | undefined = undefined;

  try {
    bundle = await rollup(inputOptions);
    await bundle.write(outputOptions);
  } catch (error) {
    throw error;
  } finally {
    if (bundle) {
      await bundle.close();
    }
  }
};
