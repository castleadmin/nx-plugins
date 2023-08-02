import * as AdmZip from 'adm-zip';

export const zip = async ({
  outputPathHandlerResolved,
  zipFileResolved,
  excludeZipRegExp,
}: {
  outputPathHandlerResolved: string;
  zipFileResolved: string;
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
    outputPathHandlerResolved,
    addLocalFolderProps
  );
  await zip.writeZipPromise(zipFileResolved);
};
