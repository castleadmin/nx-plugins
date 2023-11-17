import { additionalArgsToString } from './additional-args-to-string';

describe('additionalArgsToString', () => {
  test('Should join positional arguments', () => {
    expect(additionalArgsToString(['ab', 'c12', '34-Bv'], {})).toBe(
      'ab c12 34-Bv'
    );
  });

  test('Should join additional arguments', () => {
    expect(
      additionalArgsToString(undefined, {
        ab: 'de5456',
        L45: 34,
        c: true,
      })
    ).toBe('--ab "de5456" --L45 34 -c');
  });

  test('Should join positional and additional arguments', () => {
    expect(
      additionalArgsToString(['ab', 'c12', '34-Bv'], {
        ab: 'de5456',
        L45: 34,
        c: true,
      })
    ).toBe('ab c12 34-Bv --ab "de5456" --L45 34 -c');
  });

  test('Should return the empty string if there are no arguments', () => {
    expect(additionalArgsToString(undefined, {})).toBe('');
  });

  test('Should convert single-character additional arguments to alias options', () => {
    expect(
      additionalArgsToString(undefined, {
        t: 'test',
        L: 34,
        c: true,
      })
    ).toBe('-t "test" -L 34 -c');
  });

  test('Should convert multi-character additional arguments to options', () => {
    expect(
      additionalArgsToString(undefined, {
        tea: 'test',
        Long: 34,
        channel: true,
      })
    ).toBe('--tea "test" --Long 34 --channel');
  });

  test('Should convert boolean options', () => {
    expect(
      additionalArgsToString(undefined, {
        a: true,
        b: false,
        cake: true,
        direction: false,
      })
    ).toBe('-a -b false --cake --no-direction');
  });

  test('Should convert string options', () => {
    expect(
      additionalArgsToString(undefined, {
        a: 'a34',
        cake: 'cake 45',
      })
    ).toBe('-a "a34" --cake "cake 45"');
  });

  test('Should convert number options', () => {
    expect(
      additionalArgsToString(undefined, {
        a: 3,
        cake: 56046,
      })
    ).toBe('-a 3 --cake 56046');
  });
});
