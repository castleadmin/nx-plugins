import { ExecutorContext } from '@nx/devkit';
import { join } from 'node:path';
import { RollupOptions } from 'rollup';
import { BuildExecutorSchema } from '../schema';

export const applyRollupConfig = async ({
  rollupConfig,
  rollupOptions,
  contextRootResolved,
  options,
  context,
}: {
  rollupConfig: string | undefined;
  rollupOptions: RollupOptions;
  contextRootResolved: string;
  options: BuildExecutorSchema;
  context: ExecutorContext;
}): Promise<RollupOptions> => {
  let result = rollupOptions;

  if (rollupConfig) {
    const customRollupConfig = (
      await import(join(contextRootResolved, rollupConfig))
    ).default;
    result = await customRollupConfig(rollupOptions, options, context);
  }

  return result;
};
