import { ExecutorContext } from '@nx/devkit';
import { RollupWatcher } from 'rollup';
import { BuildExecutorSchema } from '../schema';

export type BuildStrategy = (
  options: BuildExecutorSchema,
  context: ExecutorContext
) => Promise<void | RollupWatcher>;
