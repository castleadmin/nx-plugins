import { dirname, join, relative, resolve } from 'node:path';

export const getSamconfigPath = (
  argv: string[],
  projectRootResolved: string,
): string | undefined => {
  let templateValue: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--template') {
      if (
        argv[i + 1] &&
        !argv[i + 1]?.startsWith('--') &&
        !argv[i + 1]?.startsWith('-')
      ) {
        templateValue = argv[i + 1];
      }
    } else if (arg?.startsWith('--template=')) {
      const value = arg?.slice('--template='.length);

      if (value) {
        templateValue = value;
      }
    } else if (arg === '-t') {
      if (
        argv[i + 1] &&
        !argv[i + 1]?.startsWith('--') &&
        !argv[i + 1]?.startsWith('-')
      ) {
        templateValue = argv[i + 1];
      }
    }
  }

  if (!templateValue) {
    return undefined;
  }

  const templatePathResolved = resolve(projectRootResolved, templateValue);

  return relative(
    dirname(templatePathResolved),
    join(projectRootResolved, 'samconfig.toml'),
  );
};
