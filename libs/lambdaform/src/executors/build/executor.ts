import { BuildExecutorSchema } from './schema';
import { ExecutorContext } from '@nx/devkit';
import { build, createInputOptions, createOutputOptions } from './build';
import { join, resolve } from 'node:path';
import { rm } from 'node:fs/promises';
import { zip } from './zip';
import { normalizeAssets, normalizedAssetsToCopyTargets } from './assets';
import { getProjectSourceRoot } from '../../utils/get-project-source-root';
import { externalDependenciesToRollupOption } from './external-dependencies';
import { copyNodeModules } from './copy-node-modules';

const deleteOutput = async (
  context: ExecutorContext,
  outputPath: string
): Promise<void> =>
  rm(resolve(context.root, outputPath), {
    force: true,
    recursive: true,
    maxRetries: 3,
  });

export const runExecutor = async (
  options: BuildExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const projectSourceRoot = getProjectSourceRoot(context);

  const {
    handlers,
    tsConfig,
    outputPath,
    outputFileName,
    zipFilterRegExp,
    treeshake,
    deleteOutputPath,
  } = options;

  if (deleteOutputPath) {
    await deleteOutput(context, outputPath);
  }

  await Promise.all(
    handlers.map(async (handler): Promise<void> => {
      const outputPathHandlerResolved = resolve(
        context.root,
        join(outputPath, handler.name)
      );
      const zipFile = resolve(
        context.root,
        join(outputPath, `${handler.name}.zip`)
      );

      const external = externalDependenciesToRollupOption(handler);

      const normalizedAssets = await normalizeAssets(
        handler.assets ?? [],
        context.root,
        projectSourceRoot
      );
      const copyTargets = normalizedAssetsToCopyTargets(
        normalizedAssets,
        outputPathHandlerResolved
      );

      const inputOptions = createInputOptions({
        handlerPath: resolve(context.root, handler.path),
        outputPath: outputPathHandlerResolved,
        external,
        tsconfig: resolve(context.root, tsConfig),
        treeshake,
        copyTargets,
      });

      const outputOptions = createOutputOptions({
        handlerName: handler.name,
        outputPath: outputPathHandlerResolved,
        outputFileName,
      });

      const rollupOutput = await build(inputOptions, outputOptions);
      await copyNodeModules(rollupOutput);
      await zip({
        outputPath: outputPathHandlerResolved,
        zipFile,
        zipFilterRegExp,
      });
    })
  );

  return {
    success: true,
  };
};

export default runExecutor;
