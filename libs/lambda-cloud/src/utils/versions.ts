export interface Versions {
  // TypeScript
  tslib: string;
  '@types/aws-lambda': string;
  '@types/node': string;
  // CDK
  'aws-cdk': string;
  'aws-cdk-lib': string;
  constructs: string;
  esbuild: string;
  // E2E
  axios: string;
}

export const getVersions = (): Versions => {
  // TypeScript
  const tslib = '^2.6.2';
  const typesAwsLambda = '^8.10.126';
  const typesNode = '^20.9.1';
  // CDK
  const awsCdk = '^2.110.0';
  const awsCdkLib = '^2.110.0';
  const constructs = '^10.3.0';
  const esbuild = '^0.19.5';
  // E2E
  const axios = '^1.6.2';

  return {
    // TypeScript
    tslib,
    '@types/aws-lambda': typesAwsLambda,
    '@types/node': typesNode,
    // CDK
    'aws-cdk': awsCdk,
    'aws-cdk-lib': awsCdkLib,
    constructs,
    esbuild,
    // E2E
    axios,
  };
};
