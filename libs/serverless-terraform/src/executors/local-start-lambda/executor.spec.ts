import { LocalStartLambdaExecutorSchema } from './schema';
import executor from './executor';

const options: LocalStartLambdaExecutorSchema = {};

describe('LocalStartLambda Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});
