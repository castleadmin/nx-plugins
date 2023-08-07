import { BuildExecutorSchema, Handler } from './schema';
import { ExecutorContext } from '@nx/devkit';
import { build, buildWatch, createRollupOptions } from './build';
import { join, resolve } from 'node:path';
import { rm } from 'node:fs/promises';
import { zip } from './zip';
import { normalizeAssets, normalizedAssetsToCopyTargets } from './assets';
import { getProjectSourceRoot } from '../../utils/get-project-source-root';
import { externalDependenciesToRollupOption } from './external-dependencies';
import { copyNodeModules } from './copy-node-modules';
import { createPackageJson } from './create-package-json';
import { RollupOutput, RollupWatcher } from 'rollup';
import type PLimit from 'p-limit';

const deleteOutput = async (outputPathResolved: string): Promise<void> =>
  rm(outputPathResolved, {
    force: true,
    recursive: true,
    maxRetries: 3,
  });

const buildHandler = async (
  handler: Handler,
  options: BuildExecutorSchema,
  context: ExecutorContext
): Promise<void | RollupWatcher> => {
  const contextRootResolved = resolve(context.root);
  const projectSourceRoot = getProjectSourceRoot(context);
  const projectSourceRootResolved = join(
    contextRootResolved,
    projectSourceRoot
  );
  const projectGraph = context.projectGraph;
  if (!projectGraph) {
    throw new Error("The project graph isn't defined");
  }

  const {
    tsConfig,
    outputPath,
    outputFileName,
    outputChunkNames,
    excludeZipRegExp,
    format,
    packageJsonType,
    sourcemap,
    treeshake,
    minify,
    rollupConfig,
    verbose,
    watch,
  } = options;

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

  let rollupOptions = createRollupOptions({
    handlerName: handler.name,
    handlerSrcPathResolved: join(contextRootResolved, handler.path),
    outputFileName,
    outputChunkNames,
    outputPathHandlerResolved,
    external,
    tsconfigResolved: join(contextRootResolved, tsConfig),
    format,
    sourcemap,
    treeshake,
    minify,
    copyTargets,
    verbose,
  });

  if (rollupConfig) {
    const customRollupConfig = (
      await import(join(contextRootResolved, rollupConfig))
    ).default;
    rollupOptions = await customRollupConfig(rollupOptions, options, context);
  }

  const postBuild = async (rollupOutput: RollupOutput): Promise<void> => {
    await createPackageJson({
      handlerName: handler.name,
      outputFileName,
      packageJsonType,
      outputPathHandlerResolved,
    });
    await copyNodeModules({
      rollupOutput,
      contextRootResolved,
      outputPathHandlerResolved,
      excludeAwsSdk: handler.excludeAwsSdk,
      projectGraph,
      verbose,
    });
    await zip({
      outputPathHandlerResolved,
      zipFileResolved,
      excludeZipRegExp,
    });
  };

  if (watch) {
    return await buildWatch(handler.name, rollupOptions, postBuild);
  } else {
    return await build(handler.name, rollupOptions, postBuild);
  }
};

export const runExecutor = async (
  options: BuildExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  // TypeScript workaround (Option 4) https://github.com/TypeStrong/ts-node/discussions/1290
  const dynamicImport = new Function('module', 'return import(module)');
  const pLimit = (await dynamicImport('p-limit')).default as typeof PLimit;

  const contextRootResolved = resolve(context.root);
  const { handlers, outputPath, deleteOutputPath, maxWorkers, watch } = options;

  if (deleteOutputPath) {
    await deleteOutput(join(contextRootResolved, outputPath));
  }

  const limit = pLimit(maxWorkers);
  const watchers = await Promise.all(
    handlers.map(
      (handler): Promise<void | RollupWatcher> =>
        limit(buildHandler, handler, options, context)
    )
  );

  if (watch) {
    await Promise.all(
      (watchers as RollupWatcher[]).map(
        (watcher): Promise<void> =>
          new Promise((resolve) => {
            watcher.on('close', () => {
              resolve();
            });
          })
      )
    );
  }

  return {
    success: true,
  };
};

export default runExecutor;
