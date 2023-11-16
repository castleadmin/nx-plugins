import { toTerraformName } from './to-terraform-name';

describe('toTerraformName', () => {
  it('Should convert dashes to underscores.', () => {
    expect(toTerraformName('abc-def-a12-Ghi')).toBe('abc_def_a12_ghi');
  });

  it('Should separate camel case parts with underscores and convert the name to lowercase.', () => {
    expect(toTerraformName('abcDef_a12Ghi')).toBe('abc_def_a12_ghi');
  });
});
