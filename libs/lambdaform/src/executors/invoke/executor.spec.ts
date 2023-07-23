import { InvokeExecutorSchema } from './schema';
import executor from './executor';

const options: InvokeExecutorSchema = {};

describe('Invoke Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});
