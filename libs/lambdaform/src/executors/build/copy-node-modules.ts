import { OutputChunk, RollupOutput } from 'rollup';
import { copy } from 'fs-extra';
import { sep, join, isAbsolute, normalize } from 'node:path';
import { access } from 'node:fs/promises';
import { ProjectGraph } from '@nx/devkit';

interface NestedDependency {
  parent: string | NestedDependency;
  dependency: string;
}

export const copyNodeModules = async ({
  rollupOutput,
  contextRootResolved,
  outputPathHandlerResolved,
  projectGraph,
}: {
  rollupOutput: RollupOutput;
  contextRootResolved: string;
  outputPathHandlerResolved: string;
  projectGraph: ProjectGraph;
}): Promise<void> => {
  const uniqueImports = getUniqueImports(rollupOutput);
  const filteredUniqueImports = filterOutRelativeImports(uniqueImports);
  const nodeModuleNames = getNodeModuleNames(filteredUniqueImports);
  const { dependencies, nestedDependencies } = getAllDependencies(
    nodeModuleNames,
    projectGraph
  );

  await copyDependencies({
    dependencies,
    contextRootResolved,
    outputPathHandlerResolved,
  });

  // TODO provide verbose option
  const verbose = true;

  if (verbose) {
    console.log(
      `The following top-level node modules will be added to ${outputPathHandlerResolved}:`
    );
    console.log(JSON.stringify(dependencies, null, 2));
    console.log(
      'The top-level node modules include the following nested node modules:'
    );
    console.log(JSON.stringify(nestedDependencies, null, 2));
  }
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

const filterOutRelativeImports = (uniqueImports: string[]): string[] => {
  return uniqueImports.filter(
    (uniqueImport) =>
      !uniqueImport.startsWith('..') && !uniqueImport.startsWith('.')
  );
};

const getNodeModuleNames = (uniqueImports: string[]): string[] => {
  const nodeModules = 'node_modules';

  return uniqueImports.map((uniqueImport) => {
    let nodeModuleName: string;

    if (isAbsolute(uniqueImport)) {
      const pathParts = normalize(uniqueImport).split(sep);
      const indexParts = pathParts.lastIndexOf(nodeModules);

      if (indexParts === -1 || indexParts + 1 >= pathParts.length) {
        throw new Error(
          `Couldn't extract node module path from '${uniqueImport}'. The module isn't imported from '${nodeModules}'.`
        );
      }

      const nodeModulePath = join(...pathParts.slice(indexParts + 1));
      nodeModuleName = getNodeModuleName(nodeModulePath);
    } else {
      nodeModuleName = getNodeModuleName(uniqueImport);
    }

    return nodeModuleName;
  });
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

const getAllDependencies = (
  nodeModuleNames: string[],
  projectGraph: ProjectGraph
): {
  dependencies: string[];
  nestedDependencies: NestedDependency[];
} => {
  const dependencies: string[] = [];
  const nestedDependencies: NestedDependency[] = [];
  const stack: (string | NestedDependency)[] = nodeModuleNames.map(
    (name) => `npm:${name}`
  );

  const isNestedDependency = (name: string) => {
    // Check if name has version identifier (e.g. npm:uuid@8.3.2).
    // Exclude index === -1 and index === 4 (e.g. npm:@aws-sdk/client-lambda).
    return name.lastIndexOf('@') > 4;
  };

  const removeNpmPrefix = (name: string) => name.substring(4);

  while (stack.length > 0) {
    const item = stack.pop() as string | NestedDependency;
    let directDependencyEntries;

    if (typeof item === 'string') {
      if (dependencies.includes(item)) {
        continue;
      }

      dependencies.push(item);

      directDependencyEntries = projectGraph.dependencies[item];
    } else {
      if (
        nestedDependencies.find(
          (nested) => nested.dependency === item.dependency
        )
      ) {
        continue;
      }

      nestedDependencies.push(item);

      directDependencyEntries = projectGraph.dependencies[item.dependency];
    }

    if (directDependencyEntries) {
      directDependencyEntries.forEach((entry) => {
        if (isNestedDependency(entry.target)) {
          stack.push({ parent: item, dependency: entry.target });
        } else {
          stack.push(entry.target);
        }
      });
    }
  }

  return {
    dependencies: dependencies.map((dependency) => removeNpmPrefix(dependency)),
    nestedDependencies: nestedDependencies.map((nestedDependency) => ({
      parent:
        typeof nestedDependency.parent === 'string'
          ? removeNpmPrefix(nestedDependency.parent)
          : // All nested dependencies are contained in the nested dependencies array and are processed.
            // Therefore, nothing needs to be done.
            nestedDependency.parent,
      dependency: removeNpmPrefix(nestedDependency.dependency),
    })),
  };
};

const copyDependencies = async ({
  dependencies,
  contextRootResolved,
  outputPathHandlerResolved,
}: {
  dependencies: string[];
  contextRootResolved: string;
  outputPathHandlerResolved: string;
}): Promise<void> => {
  await Promise.all(
    dependencies.map(async (dependency: string): Promise<void> => {
      const { sourceResolved, destinationResolved } = getCopyPaths({
        dependency,
        contextRootResolved,
        outputPathHandlerResolved,
      });

      if (await pathExists(sourceResolved)) {
        await copy(sourceResolved, destinationResolved, {});
      } else {
        console.warn(`Ignoring import '${dependency}'`);
      }
    })
  );
};

const getCopyPaths = ({
  dependency,
  contextRootResolved,
  outputPathHandlerResolved,
}: {
  dependency: string;
  contextRootResolved: string;
  outputPathHandlerResolved: string;
}): {
  sourceResolved: string;
  destinationResolved: string;
} => {
  const nodeModules = 'node_modules';
  const sourceResolved = join(contextRootResolved, nodeModules, dependency);
  const destinationResolved = join(
    outputPathHandlerResolved,
    nodeModules,
    dependency
  );

  return { sourceResolved, destinationResolved };
};

const pathExists = (pathResolved: string): Promise<boolean> => {
  return access(pathResolved)
    .then(() => true)
    .catch(() => false);
};
