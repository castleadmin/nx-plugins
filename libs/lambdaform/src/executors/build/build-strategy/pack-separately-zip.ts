import { join } from 'node:path';
import { RollupOutput } from 'rollup';
import { applyRollupConfig } from '../build-steps/apply-rollup-config';
import { AssetCopyTarget, assetCopyTargets } from '../build-steps/assets';
import { build, buildWatch } from '../build-steps/build';
import { buildPrerequisites } from '../build-steps/build-prerequisites';
import { createRollupOptions } from '../build-steps/create-rollup-options';
import { deleteOutput } from '../build-steps/delete-output';
import { externalRegularExpressions } from '../build-steps/external';
import { ExtendedHandler } from '../extended-handler';
import { zip } from '../zip';
import { BuildStrategy } from './build-strategy';

export const executeBuild: BuildStrategy = async (options, context) => {
  const {
    handlers,
    deleteOutputPath,
    externalDependencies,
    excludeAwsSdk,
    tsConfig,
    format,
    entryFileNames,
    chunkFileNames,
    sourcemap,
    treeshake,
    minify,
    verbose,
    rollupConfig,
    watch,
  } = options;

  const {
    contextRootResolved,
    projectSourceRootResolved,
    projectGraph,
    outputPathResolved,
  } = buildPrerequisites(options, context);

  const extendedHandlers: ExtendedHandler[] = handlers.map((handler) => ({
    ...handler,
    mainResolved: join(contextRootResolved, handler.main),
    handlerOutputPathResolved: join(outputPathResolved, handler.name),
  }));

  await deleteOutput(deleteOutputPath, outputPathResolved);

  const assets: AssetCopyTarget[] = await assetCopyTargets({
    extendedHandlers,
    contextRootResolved,
    projectSourceRootResolved,
  });

  const external = externalRegularExpressions(
    externalDependencies,
    excludeAwsSdk
  );

  const buildOutputPathResolved = join(outputPathResolved, '__build__');

  let rollupOptions = createRollupOptions({
    inputsResolved: extendedHandlers.map((handler) => handler.mainResolved),
    tsConfigResolved: join(contextRootResolved, tsConfig),
    format,
    buildOutputPathResolved,
    entryFileNames,
    chunkFileNames,
    sourcemap,
    treeshake,
    minify,
    external,
    assetCopyTargets: assets,
    verbose,
  });

  rollupOptions = await applyRollupConfig({
    rollupConfig,
    rollupOptions,
    contextRootResolved,
    options,
    context,
  });

  const postBuild = async (rollupOutput: RollupOutput): Promise<void> => {
    await Promise.all(
      extendedHandlers.map(async (handler): Promise<void> => {
        await createPackageJson({
          handlerName: handler.name,
          // TODO check
          outputFileName,
          packageJsonType,
          outputPathHandlerResolved: handler.outputPathResolved,
        });
        await copyNodeModules({
          rollupOutput,
          contextRootResolved,
          outputPathHandlerResolved: handler.outputPathResolved,
          excludeAwsSdk,
          projectGraph,
          verbose,
        });
        await zip({
          outputPathHandlerResolved: handler.outputPathResolved,
          zipFileResolved: handler.zipFileResolved,
          excludeZipRegExp,
        });
      })
    );
  };

  if (watch) {
    return await buildWatch(rollupOptions, postBuild);
  } else {
    return await build(rollupOptions, postBuild);
  }
};

export default executeBuild;
