import { InvokeExecutorSchema } from './schema';

export default async function runExecutor(options: InvokeExecutorSchema) {
  console.log('Executor ran for Invoke', options);
  return {
    success: true,
  };
}
