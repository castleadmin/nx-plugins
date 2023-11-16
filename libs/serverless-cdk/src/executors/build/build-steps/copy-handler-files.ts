import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export const copyHandlerFiles = async ({
  handlerFileNames,
  buildOutputPathResolved,
  bundleOutputPathResolved,
}: {
  handlerFileNames: string[];
  buildOutputPathResolved: string;
  bundleOutputPathResolved: string;
}): Promise<void> => {
  await Promise.all(
    handlerFileNames.map(async (buildFileName) => {
      const bundleFileResolved = join(bundleOutputPathResolved, buildFileName);

      await mkdir(dirname(bundleFileResolved), { recursive: true });
      return await copyFile(
        join(buildOutputPathResolved, buildFileName),
        bundleFileResolved
      );
    })
  );
};
