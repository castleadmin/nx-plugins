import { EventExecutorSchema } from './schema';
import executor from './executor';

const options: EventExecutorSchema = {
  __unparsed__: [],
};

describe('Event Executor', () => {
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
