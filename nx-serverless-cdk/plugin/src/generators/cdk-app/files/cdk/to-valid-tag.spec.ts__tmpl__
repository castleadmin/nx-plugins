import { toValidTag } from './to-valid-tag';

describe('toValidTag', () => {
  it('Given a tag with valid characters, should return the tag.', () => {
    const tag = 'Abc/Def.1-2_3:/=+@4 5';

    const result = toValidTag(tag);

    expect(result).toBe(tag);
  });

  it('Given a tag with invalid characters, should return the tag without the invalid characters.', () => {
    const tag = 'Abc$/Def%.1-2_3:/=+@4 5&';

    const result = toValidTag(tag);

    expect(result).toBe('Abc/Def.1-2_3:/=+@4 5');
  });

  it('Given a tag that only consists of invalid characters, should throw an error.', () => {
    const tag = '&%$(){}';

    expect(() => toValidTag(tag)).toThrow(Error);
  });
});
