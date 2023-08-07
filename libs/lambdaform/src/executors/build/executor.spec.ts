import { BuildExecutorSchema } from './schema';
import executor from './executor';

const options: BuildExecutorSchema = {
  handlers: [],
  tsConfig: '',
  outputPath: '',
  outputFileName: '',
  outputChunkNames: '',
  excludeZipRegExp: '',
  format: 'module',
  packageJsonType: 'commonjs',
  sourcemap: 'hidden',
  treeshake: 'smallest',
  minify: true,
  deleteOutputPath: false,
  maxWorkers: 10,
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
