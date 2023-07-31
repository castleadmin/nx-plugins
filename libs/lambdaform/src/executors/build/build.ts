import {
  OutputOptions,
  rollup,
  RollupBuild,
  RollupOptions,
  TreeshakingOptions,
  TreeshakingPreset,
} from 'rollup';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export const createInputOptions = ({
  handlerPath,
  outputPath,
  tsconfig,
  treeshake,
}: {
  handlerPath: string;
  outputPath: string;
  tsconfig: string;
  treeshake: boolean | TreeshakingPreset | TreeshakingOptions;
}): RollupOptions => ({
  input: handlerPath,
  treeshake,
  plugins: [
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
}: {
  handlerName: string;
  outputPath: string;
}): OutputOptions => ({
  format: 'esm',
  dir: outputPath,
  name: handlerName,
  entryFileNames: 'index.mjs',
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
    if (bundle) {
      await bundle.close();
    }

    throw error;
  }
};
