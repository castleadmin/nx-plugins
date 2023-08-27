import { ProjectGraph, ProjectGraphDependency } from '@nx/devkit';
import { copy } from 'fs-extra';
import { access } from 'node:fs/promises';
import { join, normalize, sep } from 'node:path';
import { OutputChunk, RollupOutput } from 'rollup';
import { excludeAwsSdkModules } from './external';

interface NestedDependency {
  parent: string | NestedDependency;
  dependency: string;
}

//TODO only copy handle imports
export const copyNodeModules = async ({
  rollupOutput,
  contextRootResolved,
  bundleOutputPathResolved,
  excludeAwsSdk,
  projectGraph,
  verbose,
}: {
  rollupOutput: RollupOutput;
  contextRootResolved: string;
  bundleOutputPathResolved: string;
  excludeAwsSdk: boolean;
  projectGraph: ProjectGraph;
  verbose: boolean;
}): Promise<void> => {
  const uniqueImports = getUniqueImports(rollupOutput);

  if (verbose) {
    console.log('The following import declarations exists:');
    console.log(JSON.stringify(uniqueImports, null, 2));
  }

  const chunkNames = getChunkNames(rollupOutput);
  let filteredUniqueImports = filterOutRelativeImports({
    uniqueImports,
    chunkNames,
  });

  filteredUniqueImports = filterOutAwsSdk(excludeAwsSdk, filteredUniqueImports);

  if (verbose) {
    console.log('The following external import declarations exists:');
    console.log(JSON.stringify(filteredUniqueImports, null, 2));
  }

  const nodeModuleNames = getNodeModuleNames(filteredUniqueImports);
  const { dependencies, nestedDependencies } = getAllDependencies(
    nodeModuleNames,
    projectGraph
  );

  if (verbose) {
    console.log(
      `The following top-level node modules will be added to ${bundleOutputPathResolved}:`
    );
    console.log(JSON.stringify(dependencies, null, 2));
    console.log(
      'The top-level node modules include the following nested node modules:'
    );
    console.log(JSON.stringify(nestedDependencies, null, 2));
  }

  await copyDependencies({
    dependencies,
    contextRootResolved,
    bundleOutputPathResolved,
  });
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

const getChunkNames = (rollupOutput: RollupOutput): string[] => {
  return rollupOutput.output.map((output) => output.fileName);
};

const filterOutRelativeImports = ({
  uniqueImports,
  chunkNames,
}: {
  uniqueImports: string[];
  chunkNames: string[];
}): string[] => {
  return uniqueImports.filter(
    (uniqueImport) => !chunkNames.includes(uniqueImport)
  );
};

const filterOutAwsSdk = (
  excludeAwsSdk: boolean,
  filteredUniqueImports: string[]
): string[] => {
  if (excludeAwsSdk) {
    const awsSdks = excludeAwsSdkModules.map((sdk) => new RegExp(`^${sdk}`));

    return filteredUniqueImports.filter((uniqueImport) =>
      awsSdks.reduce((acc, awsSdk) => acc && !awsSdk.test(uniqueImport), true)
    );
  }

  return filteredUniqueImports;
};

const getNodeModuleNames = (uniqueImports: string[]): string[] => {
  return uniqueImports.map((uniqueImport) => {
    const parts = normalize(uniqueImport).split(sep);

    if (!parts[0]) {
      throw new Error(
        `Couldn't extract node module name from '${uniqueImport}'`
      );
    }

    if (parts[0].startsWith('@')) {
      return parts[1] ? `${parts[0]}/${parts[1]}` : parts[0];
    }

    return parts[0];
  });
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
    let directDependencyEntries: ProjectGraphDependency[] | undefined =
      undefined;

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

    if (directDependencyEntries && directDependencyEntries.length > 0) {
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
          : removeNpmPrefix(nestedDependency.parent.dependency),
      dependency: removeNpmPrefix(nestedDependency.dependency),
    })),
  };
};

const copyDependencies = async ({
  dependencies,
  contextRootResolved,
  bundleOutputPathResolved,
}: {
  dependencies: string[];
  contextRootResolved: string;
  bundleOutputPathResolved: string;
}): Promise<void> => {
  await Promise.all(
    dependencies.map(async (dependency: string): Promise<void> => {
      const { sourceResolved, destinationResolved } = getCopyPaths({
        dependency,
        contextRootResolved,
        bundleOutputPathResolved,
      });

      if (await pathExists(sourceResolved)) {
        await copy(sourceResolved, destinationResolved, { overwrite: true });
      } else {
        console.warn(`Ignoring node module '${dependency}'`);
      }
    })
  );
};

const getCopyPaths = ({
  dependency,
  contextRootResolved,
  bundleOutputPathResolved,
}: {
  dependency: string;
  contextRootResolved: string;
  bundleOutputPathResolved: string;
}): {
  sourceResolved: string;
  destinationResolved: string;
} => {
  const nodeModules = 'node_modules';
  const sourceResolved = join(contextRootResolved, nodeModules, dependency);
  const destinationResolved = join(
    bundleOutputPathResolved,
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
