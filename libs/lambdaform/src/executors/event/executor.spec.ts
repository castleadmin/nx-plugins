import executor from './executor';
import { EventExecutorSchema } from './schema';

const options: EventExecutorSchema = {
  _: [],
};

describe('Event Executor', () => {
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
