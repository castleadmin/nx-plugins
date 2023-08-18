import executor from './executor';
import { InitExecutorSchema } from './schema';

const options: InitExecutorSchema = {
  workspace: 'init-test',
  createWorkspace: true,
  interactive: false,
  upgrade: false,
  terraformDirectory: 'terraform',
};

describe('Init Executor', () => {
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
