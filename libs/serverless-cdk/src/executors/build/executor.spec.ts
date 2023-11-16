import executor from './executor';
import { OutputType } from './output-type';
import { PackType } from './pack-type';
import { BuildExecutorSchema } from './schema';
import { SourceMapPathTransform } from './source-map-path-transform';

console.log('packtype', PackType);

const options: BuildExecutorSchema = {
  handlers: [],
  tsConfig: '',
  pack: PackType.separately,
  externalDependencies: 'none',
  excludeAwsSdk: true,
  outputPath: '',
  output: {
    type: OutputType.zip,
    zipFileNames: '[name].zip',
  },
  entryFileNames: '[name].mjs',
  chunkFileNames: 'chunks/[name].mjs',
  format: 'module',
  packageJsonType: 'commonjs',
  sourceMap: 'hidden',
  sourceMapExcludeSources: false,
  sourceMapPathTransform: SourceMapPathTransform.absolute,
  treeshake: 'smallest',
  minify: true,
  deleteOutputPath: false,
  verbose: false,
  watch: false,
};

describe('Build Executor', () => {
  it('can run', async () => {
    const context = {
      root: '',
      cwd: '',
      isVerbose: false,
    };
    //const output = await executor(options, context);
    //expect(output.success).toBe(true);
    console.log(context, options, executor);
  });
});
