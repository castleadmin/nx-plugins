import { EventExecutorSchema } from './schema';

export default async function runExecutor(options: EventExecutorSchema) {
  console.log('Executor ran for Event', options);
  return {
    success: true,
  };
}
