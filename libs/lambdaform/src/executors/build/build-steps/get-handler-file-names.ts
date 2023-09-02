import * as console from 'console';
import { OutputAsset, OutputChunk, RollupOutput } from 'rollup';

export const getHandlerFileNames = ({
  handlerName,
  inputsResolved,
  rollupOutput,
}: {
  handlerName: string;
  inputsResolved: { [handlerName: string]: string };
  rollupOutput: RollupOutput;
}): string[] => {
  const handlerChunk = findHandler(handlerName, inputsResolved, rollupOutput);

  if (!handlerChunk) {
    throw new Error(
      `Couldn't find handler chunk for handler '${handlerName}'.`
    );
  }

  const dependencies = getDependencies(handlerChunk, rollupOutput);
  const sourceMapAssets = getSourceMapAssets(dependencies, rollupOutput);

  const dependencyPaths = new Set<string>([
    ...dependencies.map((dependency) => dependency.fileName),
    ...sourceMapAssets.map((asset) => asset.fileName),
  ]);

  return Array.from(dependencyPaths);
};

const findHandler = (
  handlerName: string,
  inputsResolved: { [handlerName: string]: string },
  rollupOutput: RollupOutput
): OutputChunk | OutputAsset | undefined => {
  const handlerInputResolved = inputsResolved[handlerName];

  if (!handlerInputResolved) {
    throw new Error(
      `Couldn't find the entry file for the handler '${handlerName}' in '${JSON.stringify(
        inputsResolved,
        null,
        2
      )}'.`
    );
  }

  return rollupOutput.output.find((output) =>
    isHandlerBuildOutput(output, handlerInputResolved)
  );
};

const isHandlerBuildOutput = (
  output: OutputChunk | OutputAsset,
  handlerInputResolved: string
): boolean => {
  return (output as OutputChunk)?.facadeModuleId === handlerInputResolved;
};

const getDependencies = (
  handlerChunk: OutputChunk | OutputAsset,
  rollupOutput: RollupOutput
): (OutputChunk | OutputAsset)[] => {
  const dependencies: (OutputChunk | OutputAsset)[] = [];
  const fileNames = getFileNames(rollupOutput);
  const fileNameMap = getFileNameMap(rollupOutput);
  const stack: (OutputChunk | OutputAsset)[] = [handlerChunk];

  while (stack.length > 0) {
    const output = stack.pop() as OutputChunk | OutputAsset;

    if (dependencies.includes(output)) {
      continue;
    }

    dependencies.push(output);

    const importedOutputs = getRelativeImports(output, fileNames, fileNameMap);
    stack.push(...importedOutputs);
  }

  return dependencies;
};

const getFileNames = (rollupOutput: RollupOutput): string[] => {
  return rollupOutput.output.map((output) => output.fileName);
};

const getFileNameMap = (
  rollupOutput: RollupOutput
): Map<string, OutputChunk | OutputAsset> => {
  return new Map<string, OutputChunk | OutputAsset>(
    rollupOutput.output.map((output) => [output.fileName, output])
  );
};

const getRelativeImports = (
  output: OutputChunk | OutputAsset,
  fileNames: string[],
  fileNameMap: Map<string, OutputChunk | OutputAsset>
): (OutputChunk | OutputAsset)[] => {
  const uniqueImports = getUniqueImports(output);
  const filteredUniqueImports = filterOutNodeImports({
    uniqueImports,
    fileNames,
  });

  return filteredUniqueImports.map((uniqueImport) => {
    const importedOutput = fileNameMap.get(uniqueImport);

    if (!importedOutput) {
      throw new Error(`Couldn't map import '${uniqueImport}' to output.`);
    }

    return importedOutput;
  });
};

const getUniqueImports = (output: OutputChunk | OutputAsset): string[] => {
  const imports = (output as OutputChunk)?.imports ?? [];
  const dynamicImports = (output as OutputChunk)?.dynamicImports ?? [];

  return Array.from(new Set([...imports, ...dynamicImports]));
};

const filterOutNodeImports = ({
  uniqueImports,
  fileNames,
}: {
  uniqueImports: string[];
  fileNames: string[];
}): string[] => {
  return uniqueImports.filter((uniqueImport) =>
    fileNames.includes(uniqueImport)
  );
};

const getSourceMapAssets = (
  dependencies: (OutputChunk | OutputAsset)[],
  rollupOutput: RollupOutput
): OutputAsset[] => {
  const assets = rollupOutput.output.filter(
    (output) => output.type === 'asset'
  ) as OutputAsset[];
  const assetMap = new Map<string, OutputAsset>(
    assets.map((asset) => [asset.fileName, asset])
  );

  const sourceMapAssets: OutputAsset[] = [];
  dependencies.forEach((dependency) => {
    const sourceMapAsset = assetMap.get(`${dependency.fileName}.map`);

    if (!sourceMapAsset) {
      console.warn(`Couldn't find source map for '${dependency.fileName}'.`);

      return;
    }

    sourceMapAssets.push(sourceMapAsset);
  });

  return sourceMapAssets;
};
