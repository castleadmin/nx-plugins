import executor from './executor';
import { InvokeExecutorSchema } from './schema';

const options: InvokeExecutorSchema = {
  _: [],
  samConfiguration: '',
  terraformDirectory: '',
};

describe('Invoke Executor', () => {
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
