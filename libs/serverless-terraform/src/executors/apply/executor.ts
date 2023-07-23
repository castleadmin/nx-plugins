import { ApplyExecutorSchema } from './schema';

export default async function runExecutor(options: ApplyExecutorSchema) {
  console.log('Executor ran for Apply', options);
  return {
    success: true,
  };
}
