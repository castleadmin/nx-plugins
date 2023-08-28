export const addSuffixToEntryFileNames = (entryFileNames: string): string => {
  return `${entryFileNames}__[name]__`;
};

export const isHandlerBuildOutput = (
  outputFilePath: string,
  handlerName: string
): boolean => {
  return outputFilePath.endsWith(`__${handlerName}__`);
};

export const isHandlerSourceMapBuildOutput = (
  outputFilePath: string,
  handlerName: string
): boolean => {
  return outputFilePath.endsWith(`__${handlerName}__.map`);
};

export const removeSuffixFromOutput = (
  outputFilePath: string,
  handlerName: string
) => {
  return outputFilePath.replace(`__${handlerName}__`, '');
};
