import * as AdmZip from 'adm-zip';

export const zip = async ({
  outputPath,
  zipFile,
}: {
  outputPath: string;
  zipFile: string;
}): Promise<void> => {
  const zip = new AdmZip();

  await zip.addLocalFolderPromise(outputPath, {
    filter: (filename) => !filename.endsWith('.mjs.map'),
  });
  await zip.writeZipPromise(zipFile);
};
