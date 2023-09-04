import AdmZip from 'adm-zip';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export const zip = async ({
  name,
  zipFileNames,
  outputPathResolved,
  bundleOutputPathResolved,
  excludeZipRegExp,
}: {
  name: string;
  zipFileNames: string;
  outputPathResolved: string;
  bundleOutputPathResolved: string;
  excludeZipRegExp: string | undefined;
}): Promise<void> => {
  const zip = new AdmZip();
  const exclude = excludeZipRegExp ? new RegExp(excludeZipRegExp) : undefined;

  const addLocalFolderProps: Parameters<typeof zip.addLocalFolderPromise>[1] =
    exclude
      ? {
          filter: (filename) => !exclude.test(filename),
        }
      : {};

  await zip.addLocalFolderPromise(
    bundleOutputPathResolved,
    addLocalFolderProps
  );

  const zipPath = zipFileNames.replaceAll('[name]', name);
  const zipPathResolved = join(outputPathResolved, zipPath);

  await mkdir(dirname(zipPathResolved), { recursive: true });
  await zip.writeZipPromise(zipPathResolved);
};
