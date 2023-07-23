import { ApplyExecutorSchema } from './schema';
import executor from './executor';

const options: ApplyExecutorSchema = {};

describe('Apply Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});
