import { LocalInvokeExecutorSchema } from './schema';
import executor from './executor';

const options: LocalInvokeExecutorSchema = {};

describe('LocalInvoke Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});
