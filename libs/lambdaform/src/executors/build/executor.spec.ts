import { BuildExecutorSchema } from './schema';
import executor from './executor';

const options: BuildExecutorSchema = {
  handlers: [],
  tsConfig: '',
  outputPath: '',
  outputFileName: '',
  treeshake: 'smallest',
  deleteOutputPath: true,
  watch: false,
};

describe('Build Executor', () => {
  it('can run', async () => {
    const context = {
      root: '',
      cwd: '',
      isVerbose: false,
    };
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
