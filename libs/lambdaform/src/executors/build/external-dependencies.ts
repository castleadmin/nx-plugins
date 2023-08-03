import { Handler } from './schema';

export const externalDependenciesToRollupOption = (
  handler: Handler
): RegExp[] => {
  const external: RegExp[] = [];

  if (handler.externalDependencies === 'all') {
    external.push(new RegExp('/node_modules/'));
  } else if (Array.isArray(handler.externalDependencies)) {
    handler.externalDependencies.forEach((dependency) => {
      external.push(new RegExp(`/node_modules/${dependency}`));
    });
  }

  if (handler.excludeAwsSdk) {
    excludeAwsSdk.forEach((dependency) =>
      external.push(new RegExp(`/node_modules/${dependency}`))
    );
  }

  return external;
};

export const excludeAwsSdk: string[] = ['@aws-sdk/', 'aws-sdk'];
