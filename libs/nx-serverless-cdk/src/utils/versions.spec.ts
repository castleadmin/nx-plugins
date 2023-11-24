import { getVersions } from './versions';

describe('versions', () => {
  describe('getVersions', () => {
    test('Each dependency should be defined and should have the correct update identifier.', () => {
      const minorUpdate = /^\^\d+\.\d+\.\d+$/;

      expect(getVersions()).toEqual({
        // TypeScript
        '@aws-lambda-powertools/logger': expect.stringMatching(minorUpdate),
        tslib: expect.stringMatching(minorUpdate),
        '@types/aws-lambda': expect.stringMatching(minorUpdate),
        '@types/node': expect.stringMatching(minorUpdate),
        // CDK
        'aws-cdk': expect.stringMatching(minorUpdate),
        'aws-cdk-lib': expect.stringMatching(minorUpdate),
        constructs: expect.stringMatching(minorUpdate),
        esbuild: expect.stringMatching(minorUpdate),
      });
    });
  });
});
