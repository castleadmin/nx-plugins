import { stat } from 'node:fs/promises';
import { basename, dirname, join, relative } from 'node:path';
import { ExtendedHandler } from '../extended-handler';
import { AssetGlobPattern } from '../schema';

export interface AssetCopyTarget {
  src: string;
  dest: string;
}

export const assetCopyTargets = async ({
  extendedHandlers,
  contextRootResolved,
  projectSourceRootResolved,
}: {
  extendedHandlers: ExtendedHandler[];
  contextRootResolved: string;
  projectSourceRootResolved: string;
}): Promise<AssetCopyTarget[]> => {
  const assetCopyTargets: AssetCopyTarget[] = [];

  await Promise.all(
    extendedHandlers.map(async (handler): Promise<void> => {
      const normalizedAssets = await normalizeAssets({
        assets: handler.assets,
        contextRootResolved,
        projectSourceRootResolved,
      });
      assetCopyTargets.push(
        ...normalizedAssetsToAssetCopyTargets(
          normalizedAssets,
          handler.handlerOutputPathResolved
        )
      );
    })
  );

  return assetCopyTargets;
};

const normalizeAssets = async ({
  assets,
  contextRootResolved,
  projectSourceRootResolved,
}: {
  assets: (AssetGlobPattern | string)[];
  contextRootResolved: string;
  projectSourceRootResolved: string;
}): Promise<AssetGlobPattern[]> => {
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

const normalizeStringAsset = async (
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

const normalizeGlobAsset = (
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

const normalizedAssetsToAssetCopyTargets = (
  assets: AssetGlobPattern[],
  assetOutputPathResolved: string
): AssetCopyTarget[] => {
  return assets.map((asset) => ({
    // replace backslashes with slashes (https://github.com/sindresorhus/globby/issues/179)
    src: join(asset.input, asset.glob).replace(/\\/g, '/'),
    dest: join(assetOutputPathResolved, asset.output).replace(/\\/g, '/'),
  }));
};
