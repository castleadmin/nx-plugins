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

const deleteOutput = async (outputPathResolved: string): Promise<void> =>
  rm(outputPathResolved, {
    force: true,
    recursive: true,
    maxRetries: 3,
  });

export const runExecutor = async (
  options: BuildExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const contextRootResolved = resolve(context.root);
  const projectSourceRoot = getProjectSourceRoot(context);
  const projectSourceRootResolved = join(
    contextRootResolved,
    projectSourceRoot
  );
  const {
    handlers,
    tsConfig,
    outputPath,
    outputFileName,
    excludeZipRegExp,
    treeshake,
    deleteOutputPath,
  } = options;

  if (deleteOutputPath) {
    await deleteOutput(join(contextRootResolved, outputPath));
  }

  await Promise.all(
    handlers.map(async (handler): Promise<void> => {
      const outputPathHandlerResolved = join(
        contextRootResolved,
        outputPath,
        handler.name
      );
      const zipFileResolved = join(
        contextRootResolved,
        outputPath,
        `${handler.name}.zip`
      );

      const external = externalDependenciesToRollupOption(handler);

      const normalizedAssets = await normalizeAssets(
        handler.assets ?? [],
        contextRootResolved,
        projectSourceRootResolved
      );
      const copyTargets = normalizedAssetsToCopyTargets(
        normalizedAssets,
        outputPathHandlerResolved
      );

      const inputOptions = createInputOptions({
        handlerSrcPathResolved: join(contextRootResolved, handler.path),
        outputPathHandlerResolved,
        external,
        tsconfigResolved: join(contextRootResolved, tsConfig),
        treeshake,
        copyTargets,
      });

      const outputOptions = createOutputOptions({
        handlerName: handler.name,
        outputPathHandlerResolved,
        outputFileName,
      });

      const rollupOutput = await build(inputOptions, outputOptions);
      await copyNodeModules(rollupOutput);
      await zip({
        outputPathHandlerResolved,
        zipFileResolved,
        excludeZipRegExp,
      });
    })
  );

  return {
    success: true,
  };
};

export default runExecutor;
