import { PlanExecutorSchema } from './schema';

export default async function runExecutor(options: PlanExecutorSchema) {
  console.log('Executor ran for Plan', options);
  return {
    success: true,
  };
}
