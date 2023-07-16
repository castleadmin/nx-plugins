import { LocalInvokeExecutorSchema } from './schema';

export default async function runExecutor(options: LocalInvokeExecutorSchema) {
  console.log('Executor ran for LocalInvoke', options);
  return {
    success: true,
  };
}
