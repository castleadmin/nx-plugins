import { ExecutorContext } from '@nx/devkit';
import { BuildStrategy } from './build-strategy/build-strategy';
import packSeparatelyZip from './build-strategy/pack-separately-zip';
import packTogetherZip from './build-strategy/pack-together-zip';
import { OutputType } from './output-type';
import { PackType } from './pack-type';
import { BuildExecutorSchema, Output } from './schema';

export const runExecutor = async (
  options: BuildExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  const { handlers, output, pack } = options;

  if (handlers.length === 0) {
    return {
      success: true,
    };
  }

  const executeBuild: BuildStrategy = getBuildStrategy(output, pack);
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

const getBuildStrategy = (output: Output, pack: PackType): BuildStrategy => {
  switch (output.type) {
    case OutputType.zip:
      if (pack === PackType.separately) {
        return packSeparatelyZip;
      } else {
        return packTogetherZip;
      }
    default:
      throw new Error(`Unknown output type '${output.type}'.`);
  }
};

export default runExecutor;
