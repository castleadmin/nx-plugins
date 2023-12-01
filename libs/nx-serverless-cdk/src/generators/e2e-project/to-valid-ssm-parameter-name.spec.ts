import { toValidSsmParameterName } from './to-valid-ssm-parameter-name';

describe('toValidSsmParameterName', () => {
  it('Given a parameter name with valid characters, should return the parameter name.', () => {
    const parameterName = 'Abc/Def.1-2_3';

    const result = toValidSsmParameterName(parameterName);

    expect(result).toBe(parameterName);
  });

  it('Given a parameter name with invalid characters, should return the parameter name without the invalid characters.', () => {
    const parameterName = '@Abc$/Def%.1-2_&3';

    const result = toValidSsmParameterName(parameterName);

    expect(result).toBe('Abc/Def.1-2_3');
  });

  it('Given a parameter name that only consists of invalid characters, should throw an error.', () => {
    const parameterName = '&@%$(){}';

    expect(() => toValidSsmParameterName(parameterName)).toThrow(Error);
  });
});
