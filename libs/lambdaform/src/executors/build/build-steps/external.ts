export const externalRegularExpressions = (
  externalDependencies: 'all' | 'none' | string[],
  excludeAwsSdk: boolean
): RegExp[] => {
  const external: RegExp[] = [];

  if (externalDependencies === 'all') {
    external.push(new RegExp('/node_modules/'));
  } else if (Array.isArray(externalDependencies)) {
    externalDependencies.forEach((dependency) => {
      external.push(new RegExp(`/node_modules/${dependency}`));
    });
  }

  if (excludeAwsSdk) {
    excludeAwsSdkModules.forEach((dependency) =>
      external.push(new RegExp(`/node_modules/${dependency}`))
    );
  }

  return external;
};

export const excludeAwsSdkModules: string[] = ['@aws-sdk/', 'aws-sdk'];
