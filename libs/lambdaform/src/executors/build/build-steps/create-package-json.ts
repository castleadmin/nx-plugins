import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const createPackageJson = async ({
  name,
  packageJsonType,
  bundleOutputPathResolved,
}: {
  name: string;
  packageJsonType: 'commonjs' | 'module';
  bundleOutputPathResolved: string;
}): Promise<void> => {
  const packageJson = {
    name,
    version: '0.0.0',
    scripts: {},
    private: true,
    type: packageJsonType,
  };

  await writeFile(
    join(bundleOutputPathResolved, 'package.json'),
    JSON.stringify(packageJson, null, 2),
    { encoding: 'utf8' }
  );
};
