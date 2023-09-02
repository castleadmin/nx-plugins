import { join } from 'node:path';
import { RollupOutput } from 'rollup';
import { applyRollupConfig } from '../build-steps/apply-rollup-config';
import { AssetCopyTarget, assetCopyTargets } from '../build-steps/assets';
import { build, buildWatch } from '../build-steps/build';
import { buildPrerequisites } from '../build-steps/build-prerequisites';
import { copyHandlerFiles } from '../build-steps/copy-handler-files';
import { copyNodeModules } from '../build-steps/copy-node-modules';
import { createPackageJson } from '../build-steps/create-package-json';
import { createRollupOptions } from '../build-steps/create-rollup-options';
import { deleteOutput } from '../build-steps/delete-output';
import { externalRegularExpressions } from '../build-steps/external';
import { getHandlerFileNames } from '../build-steps/get-handler-file-names';
import { zip } from '../build-steps/zip';
import { ExtendedHandler } from '../extended-handler';
import { OutputType } from '../output-type';
import { BuildStrategy } from './build-strategy';

export const executeBuild: BuildStrategy = async (options, context) => {
  const {
    output,
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
    packageJsonType,
    watch,
  } = options;

  if (output.type !== OutputType.zip) {
    throw new Error(`Invalid output type '${output.type}'.`);
  }

  const {
    contextRootResolved,
    projectSourceRootResolved,
    projectGraph,
    outputPathResolved,
    buildOutputPathResolved,
  } = buildPrerequisites(options, context);

  const extendedHandlers: ExtendedHandler[] = handlers.map((handler) => ({
    ...handler,
    mainResolved: join(contextRootResolved, handler.main),
    bundleOutputPathResolved: join(outputPathResolved, handler.name),
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

  const inputsResolved: { [handlerName: string]: string } = {};
  extendedHandlers.forEach((handler) => {
    inputsResolved[handler.name] = handler.mainResolved;
  });

  let rollupOptions = createRollupOptions({
    inputsResolved,
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
          name: handler.name,
          packageJsonType,
          bundleOutputPathResolved: handler.bundleOutputPathResolved,
        });
        const handlerFileNames = getHandlerFileNames({
          handlerName: handler.name,
          inputsResolved,
          rollupOutput,
        });
        await copyHandlerFiles({
          handlerFileNames,
          buildOutputPathResolved,
          bundleOutputPathResolved: handler.bundleOutputPathResolved,
        });
        await copyNodeModules({
          handlerFileNames,
          rollupOutput,
          contextRootResolved,
          bundleOutputPathResolved: handler.bundleOutputPathResolved,
          excludeAwsSdk,
          projectGraph,
          verbose,
        });
        await zip({
          name: handler.name,
          zipFileNames: output.zipFileNames,
          outputPathResolved,
          bundleOutputPathResolved: handler.bundleOutputPathResolved,
          excludeZipRegExp: output.excludeZipRegExp,
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
