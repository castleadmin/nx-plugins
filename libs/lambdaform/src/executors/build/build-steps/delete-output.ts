import { rm } from 'node:fs/promises';

export const deleteOutput = async (
  deleteOutputPath: boolean,
  outputPathResolved: string
): Promise<void> => {
  if (deleteOutputPath) {
    await rm(outputPathResolved, {
      force: true,
      recursive: true,
      maxRetries: 3,
    });
  }
};
