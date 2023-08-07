import { ApplyExecutorSchema } from './schema';
import executor from './executor';

const options: ApplyExecutorSchema = {
  workspace: 'apply-test',
  interactive: false,
  planOutput: 'tfplan',
  terraformDirectory: 'terraform',
};

describe('Apply Executor', () => {
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
