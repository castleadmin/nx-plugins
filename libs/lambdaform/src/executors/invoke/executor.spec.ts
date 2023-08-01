import { InvokeExecutorSchema } from './schema';
import executor from './executor';

const options: InvokeExecutorSchema = {
  samConfiguration: '',
  terraformDirectory: '',
  __unparsed__: [],
};

describe('Invoke Executor', () => {
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
