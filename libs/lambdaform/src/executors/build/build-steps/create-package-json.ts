import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const createPackageJson = async ({
  handlerName,
  outputFileName,
  packageJsonType,
  outputPathHandlerResolved,
}: {
  handlerName: string;
  outputFileName: string;
  packageJsonType: 'commonjs' | 'module';
  outputPathHandlerResolved: string;
}): Promise<void> => {
  const packageJson = {
    name: handlerName,
    version: '0.0.0',
    scripts: {},
    private: true,
    main: outputFileName,
    type: packageJsonType,
  };

  await writeFile(
    join(outputPathHandlerResolved, 'package.json'),
    JSON.stringify(packageJson, null, 2),
    { encoding: 'utf8' }
  );
};
