import * as AdmZip from 'adm-zip';

export const zip = async ({
  outputPath,
  zipFile,
  zipFilterRegExp,
}: {
  outputPath: string;
  zipFile: string;
  zipFilterRegExp: string | undefined;
}): Promise<void> => {
  const zip = new AdmZip();

  const addLocalFolderProps: Parameters<typeof zip.addLocalFolderPromise>[1] =
    zipFilterRegExp
      ? {
          filter: new RegExp(zipFilterRegExp),
        }
      : {};

  await zip.addLocalFolderPromise(outputPath, addLocalFolderProps);
  await zip.writeZipPromise(zipFile);
};
