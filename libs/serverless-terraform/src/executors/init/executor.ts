import { InitExecutorSchema } from './schema';

export default async function runExecutor(options: InitExecutorSchema) {
  console.log('Executor ran for Init', options);
  return {
    success: true,
  };
}
