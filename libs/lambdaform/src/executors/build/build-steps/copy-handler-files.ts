import { copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  isHandlerBuildOutput,
  isHandlerSourceMapBuildOutput,
  removeSuffixFromOutput,
} from '../handler-file-names';

export const copyHandlerFiles = async ({
  handlerName,
  handlerFileNames,
  buildOutputPathResolved,
  bundleOutputPathResolved,
}: {
  handlerName: string;
  handlerFileNames: string[];
  buildOutputPathResolved: string;
  bundleOutputPathResolved: string;
}): Promise<void> => {
  await Promise.all(
    handlerFileNames.map(async (buildFileName) => {
      let bundleFileName = buildFileName;

      if (
        isHandlerBuildOutput(buildFileName, handlerName) ||
        isHandlerSourceMapBuildOutput(buildFileName, handlerName)
      ) {
        bundleFileName = removeSuffixFromOutput(buildFileName, handlerName);
      }

      return await copyFile(
        join(buildOutputPathResolved, buildFileName),
        join(bundleOutputPathResolved, bundleFileName)
      );
    })
  );
};
