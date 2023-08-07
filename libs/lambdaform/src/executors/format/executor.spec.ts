import { FormatExecutorSchema } from './schema';
import executor from './executor';

const options: FormatExecutorSchema = {
  terraformDirectory: 'terraform',
};

describe('Format Executor', () => {
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
