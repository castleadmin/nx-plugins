import { AssetGlobPattern } from './schema';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { stat } from 'node:fs/promises';

export const normalizedAssetsToCopyTargets = (
  assets: AssetGlobPattern[],
  outputPath: string
): {
  src: string;
  dest: string;
}[] => {
  return assets.map((asset) => ({
    // replace backslashes with slashes
    src: join(asset.input, asset.glob).replace(/\\/g, '/'),
    dest: join(outputPath, asset.output).replace(/\\/g, '/'),
  }));
};

export const normalizeAssets = async (
  assets: (AssetGlobPattern | string)[],
  contextRoot: string,
  projectSourceRoot: string
): Promise<AssetGlobPattern[]> => {
  const normalizedAssets: AssetGlobPattern[] = [];

  for (const asset of assets) {
    if (typeof asset === 'string') {
      normalizedAssets.push(
        await normalizeStringAsset(asset, contextRoot, projectSourceRoot)
      );
    } else {
      normalizedAssets.push(
        normalizeGlobAsset(asset, contextRoot, projectSourceRoot)
      );
    }
  }

  return normalizedAssets;
};

export const normalizeStringAsset = async (
  asset: string,
  contextRoot: string,
  projectSourceRoot: string
): Promise<AssetGlobPattern> => {
  const assetResolved = resolve(contextRoot, asset);
  const projectSourceRootResolved = resolve(contextRoot, projectSourceRoot);

  if (!assetResolved.startsWith(projectSourceRootResolved)) {
    throw new Error(
      `The asset path '${assetResolved}' must start with the project source root '${projectSourceRootResolved}'`
    );
  }

  const isAssetDirectory = (await stat(assetResolved)).isDirectory();

  const glob = isAssetDirectory ? '**/*' : basename(assetResolved);
  const input = isAssetDirectory ? assetResolved : dirname(assetResolved);
  const output = relative(projectSourceRootResolved, input);

  return {
    glob,
    input,
    output,
  };
};

export const normalizeGlobAsset = (
  asset: AssetGlobPattern,
  contextRoot: string,
  projectSourceRoot: string
): AssetGlobPattern => {
  const inputResolved = resolve(contextRoot, asset.input);
  const projectSourceRootResolved = resolve(contextRoot, projectSourceRoot);

  if (!inputResolved.startsWith(projectSourceRootResolved)) {
    throw new Error(
      `The asset path '${inputResolved}' must start with the project source root '${projectSourceRootResolved}'`
    );
  }

  return {
    glob: asset.glob,
    input: inputResolved,
    output: asset.output,
  };
};
