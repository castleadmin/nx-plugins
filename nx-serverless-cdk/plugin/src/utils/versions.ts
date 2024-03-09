export interface Versions {
  // CDK dependencies
  'aws-cdk-lib': string;
  constructs: string;
  'source-map-support': string;
  // CDK development dependencies
  'aws-cdk': string;
  'tsconfig-paths': string;
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
  // E2E common
  '@aws-sdk/credential-providers': string;
  '@aws-sdk/client-ssm': string;
  // E2E generic dependencies
  '@aws-sdk/client-sqs': string;
  // E2E lambda dependencies
  '@aws-sdk/client-lambda': string;
}

export const getVersions = (): Versions => {
  // CDK dependencies
  const awsCdkLib = '^2.132.0';
  const constructs = '^10.3.0';
  const sourceMapSupport = '^0.5.21';
  // CDK development dependencies
  const awsCdk = '^2.132.0';
  const tsconfigPaths = '^4.2.0';
  const tsNode = '^10.9.2';
  // Lambda dependencies
  const powertoolsLogger = '^2.0.2';
  // Lambda development dependencies
  const typesAwsLambda = '^8.10.136';
  const esbuild = '^0.19.12';
  // TypeScript dependencies
  const tslib = '^2.6.2';
  // TypeScript development dependencies
  const typesNode = '^20.11.25';
  // E2E common
  const awsSdkCredentialProviders = '^3.529.1';
  const awsSdkClientSsm = '^3.529.1';
  // E2E generic dependencies
  const awsSdkClientSqs = '^3.529.1';
  // E2E lambda dependencies
  const awsSdkClientLambda = '^3.529.1';

  return {
    // CDK dependencies
    'aws-cdk-lib': awsCdkLib,
    constructs,
    'source-map-support': sourceMapSupport,
    // CDK development dependencies
    'aws-cdk': awsCdk,
    'tsconfig-paths': tsconfigPaths,
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
    // E2E common
    '@aws-sdk/credential-providers': awsSdkCredentialProviders,
    '@aws-sdk/client-ssm': awsSdkClientSsm,
    // E2E generic dependencies
    '@aws-sdk/client-sqs': awsSdkClientSqs,
    // E2E lambda dependencies
    '@aws-sdk/client-lambda': awsSdkClientLambda,
  };
};
