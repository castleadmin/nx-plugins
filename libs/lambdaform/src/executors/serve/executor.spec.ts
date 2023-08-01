import { ServeExecutorSchema } from './schema';
import executor from './executor';

const options: ServeExecutorSchema = {
  samConfiguration: '',
  terraformDirectory: '',
  api: false,
  __unparsed__: [],
};

describe('Serve Executor', () => {
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
