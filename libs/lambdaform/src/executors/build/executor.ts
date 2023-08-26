import {ExecutorContext} from '@nx/devkit';
import {BuildExecutorSchema, Output, OutputType, PackType} from './schema';
import {BuildStrategy} from "./build-strategy/build-strategy";
import packSeparatelyZip from "./build-strategy/pack-separately-zip";
import packTogetherZip from "./build-strategy/pack-together-zip";

export const runExecutor = async (
  options: BuildExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const { handlers, outputType, pack } = options;

  if (handlers.length === 0) {
    return {
      success: true,
    };
  }

  const executeBuild: BuildStrategy = getBuildStrategy(outputType, pack);
  const watcher = await executeBuild(options, context);

  if (watcher) {
    await new Promise((resolve) => {
      watcher.on('close', () => {
        resolve(undefined);
      });
    });
  }

  return {
    success: true,
  };
};

const getBuildStrategy = (outputType: OutputType, pack: PackType): BuildStrategy => {
  switch (outputType.type) {
    case Output.zip:
      if (pack === PackType.separately) {
        return packSeparatelyZip;
      } else {
        return packTogetherZip;
      }
    default:
      throw new Error(`Unknown output type ${outputType.type}.`);
  }
}

export default runExecutor;
