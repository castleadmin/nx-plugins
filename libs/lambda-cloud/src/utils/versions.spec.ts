import { getVersions } from './versions';

describe('getVersions', () => {
  it('All versions should be defined', () => {
    const semanticVersion = /^\d+\.\d+\.\d+$/;
    const semanticVersionMinorUpgrade = /^\^\d+\.\d+\.\d+$/;

    expect(getVersions()).toEqual({
      // TypeScript
      tslib: expect.stringMatching(semanticVersionMinorUpgrade),
      '@types/aws-lambda': expect.stringMatching(semanticVersionMinorUpgrade),
      '@types/node': expect.stringMatching(semanticVersionMinorUpgrade),
      // Build
      rollup: expect.stringMatching(semanticVersionMinorUpgrade),
      'rollup-plugin-copy': expect.stringMatching(semanticVersionMinorUpgrade),
      '@rollup/plugin-json': expect.stringMatching(semanticVersionMinorUpgrade),
      '@rollup/plugin-node-resolve': expect.stringMatching(
        semanticVersionMinorUpgrade
      ),
      '@rollup/plugin-commonjs': expect.stringMatching(
        semanticVersionMinorUpgrade
      ),
      '@rollup/plugin-typescript': expect.stringMatching(
        semanticVersionMinorUpgrade
      ),
      '@rollup/plugin-terser': expect.stringMatching(
        semanticVersionMinorUpgrade
      ),
      '@types/adm-zip': expect.stringMatching(semanticVersionMinorUpgrade),
      'adm-zip': expect.stringMatching(semanticVersionMinorUpgrade),
      '@types/fs-extra': expect.stringMatching(semanticVersionMinorUpgrade),
      'fs-extra': expect.stringMatching(semanticVersionMinorUpgrade),
      // Terraform
      awsTerraformProvider: expect.stringMatching(semanticVersion),
    });
  });
});
