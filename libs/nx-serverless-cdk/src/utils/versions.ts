export interface Versions {
  // CDK dependencies
  'aws-cdk-lib': string;
  constructs: string;
  'source-map-support': string;
  // CDK development dependencies
  'aws-cdk': string;
  'ts-node': string;
  // Lambda dependencies
  '@aws-lambda-powertools/logger': string;
  // Lambda development dependencies
  '@types/aws-lambda': string;
  esbuild: string;
  // TypeScript dependencies
  tslib: string;
  // TypeScript development dependencies
  '@types/node': string;
}

export const getVersions = (): Versions => {
  // CDK dependencies
  const awsCdkLib = '^2.110.0';
  const constructs = '^10.3.0';
  const sourceMapSupport = '^0.5.21';
  // CDK development dependencies
  const awsCdk = '^2.110.0';
  const tsNode = '^10.9.1';
  // Lambda dependencies
  const powertoolsLogger = '^1.16.0';
  // Lambda development dependencies
  const typesAwsLambda = '^8.10.126';
  const esbuild = '^0.19.5';
  // TypeScript dependencies
  const tslib = '^2.6.2';
  // TypeScript development dependencies
  const typesNode = '^20.9.1';

  return {
    // CDK dependencies
    'aws-cdk-lib': awsCdkLib,
    constructs,
    'source-map-support': sourceMapSupport,
    // CDK development dependencies
    'aws-cdk': awsCdk,
    'ts-node': tsNode,
    // Lambda dependencies
    '@aws-lambda-powertools/logger': powertoolsLogger,
    // Lambda development dependencies
    '@types/aws-lambda': typesAwsLambda,
    esbuild,
    // TypeScript dependencies
    tslib,
    // TypeScript development dependencies
    '@types/node': typesNode,
  };
};
