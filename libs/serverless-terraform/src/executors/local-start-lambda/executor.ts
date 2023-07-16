import { LocalStartLambdaExecutorSchema } from './schema';

export default async function runExecutor(
  options: LocalStartLambdaExecutorSchema
) {
  console.log('Executor ran for LocalStartLambda', options);
  return {
    success: true,
  };
}
