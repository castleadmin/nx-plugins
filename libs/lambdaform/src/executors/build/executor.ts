import { BuildExecutorSchema } from './schema';
import { ExecutorContext } from '@nx/devkit';
import { build, createInputOptions, createOutputOptions } from './build';
import { join, resolve } from 'node:path';
import { zip } from './zip';

export const runExecutor = async (
  options: BuildExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  await Promise.all(
    options.handlers.map(async (handler): Promise<void> => {
      const outputPath = resolve(
        context.root,
        join(options.outputPath, handler.name)
      );
      const zipFile = resolve(
        context.root,
        join(options.outputPath, `${handler.name}.zip`)
      );

      const inputOptions = createInputOptions({
        handlerPath: resolve(context.root, handler.path),
        outputPath,
        tsconfig: resolve(context.root, options.tsConfig),
        treeshake: 'smallest',
      });

      const outputOptions = createOutputOptions({
        handlerName: handler.name,
        outputPath,
      });

      await build(inputOptions, outputOptions);

      await zip({ outputPath, zipFile });
    })
  );

  return {
    success: true,
  };
};

export default runExecutor;
