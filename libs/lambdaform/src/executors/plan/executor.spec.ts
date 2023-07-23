import { PlanExecutorSchema } from './schema';
import executor from './executor';

const options: PlanExecutorSchema = {};

describe('Plan Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});
