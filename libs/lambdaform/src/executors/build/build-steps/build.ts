import {
  OutputOptions,
  RollupBuild,
  RollupOptions,
  RollupOutput,
  RollupWatchOptions,
  RollupWatcher,
  rollup,
  watch,
} from 'rollup';

export const build = async (
  rollupOptions: RollupOptions,
  postBuild: (rollupOutput: RollupOutput) => Promise<void>
): Promise<void> => {
  let bundle: RollupBuild | undefined = undefined;
  let rollupOutput: RollupOutput | undefined = undefined;

  console.log(`Building...`);

  try {
    bundle = await rollup(rollupOptions);
    rollupOutput = await bundle.write(rollupOptions.output as OutputOptions);
  } finally {
    if (bundle) {
      await bundle.close();
    }
  }

  if (rollupOutput) {
    await postBuild(rollupOutput);

    console.log(`The build has been completed successfully!`);
  }
};

export const buildWatch = async (
  rollupOptions: RollupOptions,
  postBuild: (rollupOutput: RollupOutput) => Promise<void>
): Promise<RollupWatcher> => {
  const watchOptions: RollupWatchOptions = rollupOptions;
  watchOptions.watch = { skipWrite: true };

  const watcher = watch(watchOptions);

  return new Promise((resolve) => {
    let firstSuccessfulBuild = false;

    watcher.on('event', async (event): Promise<void> => {
      const bundle = (event as { result: RollupBuild | undefined }).result;
      let rollupOutput: RollupOutput | undefined = undefined;

      if (event.code === 'BUNDLE_START') {
        console.log(`Building...`);
      }

      try {
        if (event.code === 'BUNDLE_END' && bundle) {
          rollupOutput = await bundle.write(
            watchOptions.output as OutputOptions
          );
        }
      } finally {
        if (bundle) {
          await bundle.close();
        }
      }

      if (rollupOutput) {
        await postBuild(rollupOutput);

        console.log(`The build has been completed successfully!`);

        if (!firstSuccessfulBuild) {
          firstSuccessfulBuild = true;
          resolve(watcher);
        }
      }
    });
  });
};
