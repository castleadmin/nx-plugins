import { getVersions } from './versions';

describe('versions', () => {
  describe('getVersions', () => {
    test('Each dependency should be defined and should have the correct update identifier.', () => {
      const minorUpdate = /^\^\d+\.\d+\.\d+$/;

      expect(getVersions()).toEqual({
        // CDK dependencies
        'aws-cdk-lib': expect.stringMatching(minorUpdate),
        constructs: expect.stringMatching(minorUpdate),
        'source-map-support': expect.stringMatching(minorUpdate),
        // CDK development dependencies
        'aws-cdk': expect.stringMatching(minorUpdate),
        'tsconfig-paths': expect.stringMatching(minorUpdate),
        'ts-node': expect.stringMatching(minorUpdate),
        // Lambda dependencies
        '@aws-lambda-powertools/logger': expect.stringMatching(minorUpdate),
        // Lambda development dependencies
        '@types/aws-lambda': expect.stringMatching(minorUpdate),
        esbuild: expect.stringMatching(minorUpdate),
        // TypeScript dependencies
        tslib: expect.stringMatching(minorUpdate),
        // TypeScript development dependencies
        '@types/node': expect.stringMatching(minorUpdate),
        // E2E generic dependencies
        '@aws-sdk/client-sqs': expect.stringMatching(minorUpdate),
        // E2E lambda dependencies
        '@aws-sdk/client-lambda': expect.stringMatching(minorUpdate),
      });
    });
  });
});
