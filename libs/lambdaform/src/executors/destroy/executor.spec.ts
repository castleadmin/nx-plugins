import { DestroyExecutorSchema } from './schema';
import executor from './executor';

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
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
