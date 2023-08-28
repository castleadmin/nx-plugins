import { OutputAsset, OutputChunk, RollupOutput } from 'rollup';
import { isHandlerBuildOutput } from '../handler-file-names';

export const getHandlerFileNames = (
  handlerName: string,
  rollupOutput: RollupOutput
): string[] => {
  const handlerChunk = findHandler(handlerName, rollupOutput);

  if (!handlerChunk) {
    throw new Error(
      `Couldn't find handler chunk for handler '${handlerName}'.`
    );
  }

  const dependencies = getDependencies(handlerChunk, rollupOutput);

  return dependencies.map((dependency) => dependency.fileName);
};

const findHandler = (
  handlerName: string,
  rollupOutput: RollupOutput
): OutputChunk | OutputAsset | undefined => {
  return rollupOutput.output.find((output) =>
    isHandlerBuildOutput(output.fileName, handlerName)
  );
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
  const map = new Map<string, OutputChunk | OutputAsset>();

  rollupOutput.output.forEach((output) => map.set(output.fileName, output));

  return map;
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
