import executor from './executor';
import { DestroyExecutorSchema } from './schema';

const options: DestroyExecutorSchema = {
  workspace: 'destroy-test',
  interactive: false,
  terraformDirectory: 'terraform',
};

describe('Destroy Executor', () => {
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
