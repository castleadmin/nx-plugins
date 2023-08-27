import { copyFile } from 'node:fs/promises';
import { join } from 'node:path';

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

      if (buildFileName.endsWith(`__${handlerName}__`)) {
        bundleFileName = buildFileName.replaceAll(`__${handlerName}__`, '');
      }

      return await copyFile(
        join(buildOutputPathResolved, buildFileName),
        join(bundleOutputPathResolved, bundleFileName)
      );
    })
  );
};
