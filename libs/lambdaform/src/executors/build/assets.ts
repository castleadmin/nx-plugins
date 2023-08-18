import { stat } from 'node:fs/promises';
import { basename, dirname, join, relative } from 'node:path';
import { AssetGlobPattern } from './schema';

export const normalizedAssetsToCopyTargets = (
  assets: AssetGlobPattern[],
  outputPathHandlerResolved: string
): {
  src: string;
  dest: string;
}[] => {
  return assets.map((asset) => ({
    // replace backslashes with slashes (https://github.com/sindresorhus/globby/issues/179)
    src: join(asset.input, asset.glob).replace(/\\/g, '/'),
    dest: join(outputPathHandlerResolved, asset.output).replace(/\\/g, '/'),
  }));
};

export const normalizeAssets = async (
  assets: (AssetGlobPattern | string)[],
  contextRootResolved: string,
  projectSourceRootResolved: string
): Promise<AssetGlobPattern[]> => {
  const normalizedAssets: AssetGlobPattern[] = [];

  for (const asset of assets) {
    if (typeof asset === 'string') {
      normalizedAssets.push(
        await normalizeStringAsset(
          asset,
          contextRootResolved,
          projectSourceRootResolved
        )
      );
    } else {
      normalizedAssets.push(
        normalizeGlobAsset(
          asset,
          contextRootResolved,
          projectSourceRootResolved
        )
      );
    }
  }

  return normalizedAssets;
};

export const normalizeStringAsset = async (
  asset: string,
  contextRootResolved: string,
  projectSourceRootResolved: string
): Promise<AssetGlobPattern> => {
  const assetResolved = join(contextRootResolved, asset);

  if (!assetResolved.startsWith(projectSourceRootResolved)) {
    throw new Error(
      `The asset path '${assetResolved}' must start with the project source root '${projectSourceRootResolved}'`
    );
  }

  const isAssetDirectory = (await stat(assetResolved)).isDirectory();

  const glob = isAssetDirectory ? '**/*' : basename(assetResolved);
  const inputResolved = isAssetDirectory
    ? assetResolved
    : dirname(assetResolved);
  const outputRelative = relative(projectSourceRootResolved, inputResolved);

  return {
    glob,
    input: inputResolved,
    output: outputRelative,
  };
};

export const normalizeGlobAsset = (
  asset: AssetGlobPattern,
  contextRootResolved: string,
  projectSourceRootResolved: string
): AssetGlobPattern => {
  const inputResolved = join(contextRootResolved, asset.input);

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
