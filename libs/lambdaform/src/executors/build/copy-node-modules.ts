import { OutputChunk, RollupOutput } from 'rollup';
import { copy } from 'fs-extra';
import { sep, join, isAbsolute, resolve, normalize } from 'node:path';
import { access } from 'node:fs/promises';

export const copyNodeModules = async ({
  rollupOutput,
  contextRootResolved,
  outputPathHandlerResolved,
}: {
  rollupOutput: RollupOutput;
  contextRootResolved: string;
  outputPathHandlerResolved: string;
}): Promise<void> => {
  const modules = getUniqueImports(rollupOutput);
  await copyModule({ modules, contextRootResolved, outputPathHandlerResolved });

  console.log(modules);
};

const getUniqueImports = (rollupOutput: RollupOutput): string[] => {
  const imports = rollupOutput.output.flatMap(
    (output) => (output as OutputChunk)?.imports ?? []
  );
  const dynamicImports = rollupOutput.output.flatMap(
    (output) => (output as OutputChunk)?.dynamicImports ?? []
  );

  return Array.from(new Set([...imports, ...dynamicImports]));
};

const copyModule = async ({
  modules,
  contextRootResolved,
  outputPathHandlerResolved,
}: {
  modules: string[];
  contextRootResolved: string;
  outputPathHandlerResolved: string;
}): Promise<void> => {
  await Promise.all(
    modules.map(async (module: string): Promise<void> => {
      const { sourceResolved, destinationResolved } = getCopyPaths({
        module,
        contextRootResolved,
        outputPathHandlerResolved,
      });

      if (await pathExists(sourceResolved)) {
        await copy(sourceResolved, destinationResolved, {});
      } else {
        console.warn(`Ignoring import '${module}'`);
      }
    })
  );
};

const getCopyPaths = ({
  module,
  contextRootResolved,
  outputPathHandlerResolved,
}: {
  module: string;
  contextRootResolved: string;
  outputPathHandlerResolved: string;
}): {
  sourceResolved: string;
  destinationResolved: string;
} => {
  const nodeModules = 'node_modules';
  let sourceResolved: string;
  let destinationResolved: string;

  if (isAbsolute(module)) {
    const moduleResolved = resolve(module);
    const pathParts = moduleResolved.split(sep);
    const indexParts = pathParts.lastIndexOf(nodeModules);
    const indexModule = moduleResolved.lastIndexOf(nodeModules);

    if (
      indexParts === -1 ||
      indexParts + 1 >= pathParts.length ||
      indexModule === -1
    ) {
      throw new Error(
        `Couldn't add import ${module} to ZIP file. The module isn't imported from '${nodeModules}'.`
      );
    }

    const nodeModulePath = join(...pathParts.slice(indexParts + 1));
    const nodeModuleName = getNodeModuleName(nodeModulePath);

    sourceResolved = join(
      moduleResolved.substring(0, indexModule),
      nodeModules,
      nodeModuleName
    );
    destinationResolved = join(
      outputPathHandlerResolved,
      nodeModules,
      nodeModuleName
    );
  } else {
    const nodeModuleName = getNodeModuleName(module);

    sourceResolved = join(contextRootResolved, nodeModules, nodeModuleName);
    destinationResolved = join(
      outputPathHandlerResolved,
      nodeModules,
      nodeModuleName
    );
  }

  return { sourceResolved, destinationResolved };
};

const getNodeModuleName = (nodeModulesPath: string): string => {
  const parts = normalize(nodeModulesPath).split(sep);

  if (!parts[0]) {
    throw new Error(
      `Couldn't extract node module name from '${nodeModulesPath}'`
    );
  }

  if (parts[0].startsWith('@')) {
    return Boolean(parts[1]) ? `${parts[0]}/${parts[1]}` : parts[0];
  }

  return parts[0];
};

const pathExists = (pathResolved: string): Promise<boolean> => {
  return access(pathResolved)
    .then(() => true)
    .catch(() => false);
};
