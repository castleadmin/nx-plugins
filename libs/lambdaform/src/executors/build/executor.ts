import { BuildExecutorSchema } from './schema';
import { ExecutorContext } from '@nx/devkit';
import { build, createInputOptions, createOutputOptions } from './build';
import { join, resolve } from 'node:path';
import { zip } from './zip';
import { normalizeAssets, normalizedAssetsToCopyTargets } from './assets';
import { getProjectSourceRoot } from '../../utils/get-project-source-root';

export const runExecutor = async (
  options: BuildExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const projectSourceRoot = getProjectSourceRoot(context);

  const { handlers, tsConfig, outputPath, outputFileName, zipFilterRegExp } =
    options;

  await Promise.all(
    handlers.map(async (handler): Promise<void> => {
      const outputPathResolved = resolve(
        context.root,
        join(outputPath, handler.name)
      );
      const zipFile = resolve(
        context.root,
        join(outputPath, `${handler.name}.zip`)
      );
      const normalizedAssets = await normalizeAssets(
        handler.assets ?? [],
        context.root,
        projectSourceRoot
      );
      const copyTargets = normalizedAssetsToCopyTargets(
        normalizedAssets,
        outputPathResolved
      );

      const inputOptions = createInputOptions({
        handlerPath: resolve(context.root, handler.path),
        outputPath: outputPathResolved,
        tsconfig: resolve(context.root, tsConfig),
        treeshake: 'smallest',
        copyTargets,
      });

      const outputOptions = createOutputOptions({
        handlerName: handler.name,
        outputPath: outputPathResolved,
        outputFileName,
      });

      await build(inputOptions, outputOptions);
      await zip({ outputPath: outputPathResolved, zipFile, zipFilterRegExp });
    })
  );

  return {
    success: true,
  };
};

export default runExecutor;
