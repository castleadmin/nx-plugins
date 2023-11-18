import { getVersions } from './versions';

describe('getVersions', () => {
  test('All versions should be defined', () => {
    const semanticVersionMinorUpgrade = /^\^\d+\.\d+\.\d+$/;

    expect(getVersions()).toEqual({
      // TypeScript
      tslib: expect.stringMatching(semanticVersionMinorUpgrade),
      '@types/aws-lambda': expect.stringMatching(semanticVersionMinorUpgrade),
      '@types/node': expect.stringMatching(semanticVersionMinorUpgrade),
      // CDK
      'aws-cdk': expect.stringMatching(semanticVersionMinorUpgrade),
      'aws-cdk-lib': expect.stringMatching(semanticVersionMinorUpgrade),
      constructs: expect.stringMatching(semanticVersionMinorUpgrade),
      esbuild: expect.stringMatching(semanticVersionMinorUpgrade),
    });
  });
});
