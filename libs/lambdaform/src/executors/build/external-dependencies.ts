import { Handler } from './schema';
import { ExternalOption } from 'rollup';

export const externalDependenciesToRollupOption = (
  handler: Handler
): ExternalOption => {
  const external: (string | RegExp)[] = [];

  if (handler.externalDependencies === 'all') {
    external.push(/node_modules/);
  } else if (Array.isArray(handler.externalDependencies)) {
    handler.externalDependencies.forEach((dependency) => {
      external.push(dependency);
      external.push(new RegExp(`^${dependency}/`));
    });
  }

  if (handler.excludeAwsSdk) {
    excludeAwsSdk.forEach((dependency) => external.push(dependency));
  }

  return external;
};

const excludeAwsSdk: RegExp[] = [/^@aws-sdk\//, /^aws-sdk$/, /^aws-sdk\//];
