import { join } from 'node:path';
import { RollupOutput } from 'rollup';
import { applyRollupConfig } from '../build-steps/apply-rollup-config';
import { AssetCopyTarget, assetCopyTargets } from '../build-steps/assets';
import { build, buildWatch } from '../build-steps/build';
import { buildPrerequisites } from '../build-steps/build-prerequisites';
import { copyNodeModules } from '../build-steps/copy-node-modules';
import { createPackageJson } from '../build-steps/create-package-json';
import { createRollupOptions } from '../build-steps/create-rollup-options';
import { deleteOutput } from '../build-steps/delete-output';
import { externalRegularExpressions } from '../build-steps/external';
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

  const projectName = context.projectName;

  if (!projectName) {
    throw new Error("Project name isn't defined");
  }

  const extendedHandlers: ExtendedHandler[] = handlers.map((handler) => ({
    ...handler,
    mainResolved: join(contextRootResolved, handler.main),
    bundleOutputPathResolved: buildOutputPathResolved,
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
    await createPackageJson({
      name: projectName,
      packageJsonType,
      bundleOutputPathResolved: buildOutputPathResolved,
    });
    await copyNodeModules({
      rollupOutput,
      contextRootResolved,
      bundleOutputPathResolved: buildOutputPathResolved,
      excludeAwsSdk,
      projectGraph,
      verbose,
    });
    await zip({
      name: projectName,
      zipFileNames: output.zipFileNames,
      outputPathResolved,
      bundleOutputPathResolved: buildOutputPathResolved,
      excludeZipRegExp: output.excludeZipRegExp,
    });
  };

  if (watch) {
    return await buildWatch(rollupOptions, postBuild);
  } else {
    return await build(rollupOptions, postBuild);
  }
};

export default executeBuild;
