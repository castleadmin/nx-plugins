import { ServeExecutorSchema } from './schema';
import executor from './executor';

const options: ServeExecutorSchema = {
  _: [],
  samConfiguration: '',
  terraformDirectory: '',
  api: false,
};

describe('Serve Executor', () => {
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
