import { LocalStartApiExecutorSchema } from './schema';

export default async function runExecutor(
  options: LocalStartApiExecutorSchema
) {
  console.log('Executor ran for LocalStartApi', options);
  return {
    success: true,
  };
}
