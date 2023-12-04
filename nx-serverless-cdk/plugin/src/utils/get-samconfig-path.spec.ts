import { getSamconfigPath } from './get-samconfig-path';
import { useUnixPath, useWindowsPath } from './path.mock.spec';

jest.mock('node:path', () => {
  const originalModule = jest.requireActual('node:path');

  const module = {
    __esModule: true,
    ...originalModule,
    basename: jest.fn(),
    dirname: jest.fn(),
    join: jest.fn(),
    normalize: jest.fn(),
    relative: jest.fn(),
    resolve: jest.fn(),
  };
  Object.defineProperty(module, 'sep', { get: jest.fn() });

  return module;
});

describe('getSamconfigPath', () => {
  describe('unix', () => {
    const projectRootResolved = '/home/castleadmin/projects/test/apps/awesome';

    beforeEach(() => {
      useUnixPath();
    });

    test('Given a --template= argument, should return the relative path from the template to the samconfig.toml.', () => {
      const argv = [
        '--debug',
        '--template=cdk.out/abc123DEF.template.json',
        '--port=8009',
      ];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe('../samconfig.toml');
    });

    test('Given a --template= argument where the value contains spaces, should return the relative path from the template to the samconfig.toml.', () => {
      const argv = [
        '--debug',
        '--template=output/cdk out/abc123DEF.template.json',
        '--port=8009',
      ];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe('../../samconfig.toml');
    });

    test('Given a --template argument, should return the relative path from the template to the samconfig.toml.', () => {
      const argv = [
        '--debug',
        '--template',
        'cdk.out/abc123DEF.template.json',
        '--port=8009',
      ];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe('../samconfig.toml');
    });

    test('Given a --template argument where the value contains spaces, should return the relative path from the template to the samconfig.toml.', () => {
      const argv = [
        '--debug',
        '--template',
        'output/cdk out/abc123DEF.template.json',
        '--port=8009',
      ];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe('../../samconfig.toml');
    });

    test('Given a -t argument, should return the relative path from the template to the samconfig.toml.', () => {
      const argv = [
        '--debug',
        '-t',
        'cdk.out/abc123DEF.template.json',
        '--port=8009',
      ];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe('../samconfig.toml');
    });

    test('Given a -t argument where the value contains spaces, should return the relative path from the template to the samconfig.toml.', () => {
      const argv = [
        '--debug',
        '-t',
        'output/cdk out/abc123DEF.template.json',
        '--port=8009',
      ];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe('../../samconfig.toml');
    });

    test('Given a --template= argument without value followed by a -- arg, should return undefined.', () => {
      const argv = ['--debug', '--template=', '--port=8009'];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe(undefined);
    });

    test('Given a --template= argument without value followed by a - arg, should return undefined.', () => {
      const argv = ['--debug', '--template=', '-p=8009'];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe(undefined);
    });

    test('Given a --template= argument without value followed by nothing, should return undefined.', () => {
      const argv = ['--debug', '--template='];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe(undefined);
    });

    test('Given a --template argument without value followed by a -- arg, should return undefined.', () => {
      const argv = ['--debug', '--template', '--port=8009'];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe(undefined);
    });

    test('Given a --template argument without value followed by a - arg, should return undefined.', () => {
      const argv = ['--debug', '--template', '-p=8009'];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe(undefined);
    });

    test('Given a --template argument without value followed by nothing, should return undefined.', () => {
      const argv = ['--debug', '--template'];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe(undefined);
    });

    test('Given a -t argument without value followed by a -- arg, should return undefined.', () => {
      const argv = ['--debug', '-t', '--port=8009'];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe(undefined);
    });

    test('Given a -t argument without value followed by a - arg, should return undefined.', () => {
      const argv = ['--debug', '-t', '-p=8009'];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe(undefined);
    });

    test('Given a -t= argument without value followed by nothing, should return undefined.', () => {
      const argv = ['--debug', '-t'];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe(undefined);
    });

    test('Given args without a template argument, should return undefined.', () => {
      const argv = ['--debug', '--port=8009'];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe(undefined);
    });
  });

  describe('windows', () => {
    const projectRootResolved =
      'C:\\Users\\castleadmin\\projects\\test\\apps\\awesome';

    beforeEach(() => {
      useWindowsPath();
    });

    test('Given a --template= argument, should return the relative path from the template to the samconfig.toml.', () => {
      const argv = [
        '--debug',
        '--template=cdk.out\\abc123DEF.template.json',
        '--port=8009',
      ];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe('..\\samconfig.toml');
    });

    test('Given a --template= argument where the value contains spaces, should return the relative path from the template to the samconfig.toml.', () => {
      const argv = [
        '--debug',
        '--template=output\\cdk out\\abc123DEF.template.json',
        '--port=8009',
      ];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe('..\\..\\samconfig.toml');
    });

    test('Given a --template argument, should return the relative path from the template to the samconfig.toml.', () => {
      const argv = [
        '--debug',
        '--template',
        'cdk.out\\abc123DEF.template.json',
        '--port=8009',
      ];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe('..\\samconfig.toml');
    });

    test('Given a --template argument where the value contains spaces, should return the relative path from the template to the samconfig.toml.', () => {
      const argv = [
        '--debug',
        '--template',
        'output\\cdk out\\abc123DEF.template.json',
        '--port=8009',
      ];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe('..\\..\\samconfig.toml');
    });

    test('Given a -t argument, should return the relative path from the template to the samconfig.toml.', () => {
      const argv = [
        '--debug',
        '-t',
        'cdk.out\\abc123DEF.template.json',
        '--port=8009',
      ];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe('..\\samconfig.toml');
    });

    test('Given a -t argument where the value contains spaces, should return the relative path from the template to the samconfig.toml.', () => {
      const argv = [
        '--debug',
        '-t',
        'output\\cdk out\\abc123DEF.template.json',
        '--port=8009',
      ];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe('..\\..\\samconfig.toml');
    });

    test('Given a --template= argument without value followed by a -- arg, should return undefined.', () => {
      const argv = ['--debug', '--template=', '--port=8009'];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe(undefined);
    });

    test('Given a --template= argument without value followed by a - arg, should return undefined.', () => {
      const argv = ['--debug', '--template=', '-p=8009'];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe(undefined);
    });

    test('Given a --template= argument without value followed by nothing, should return undefined.', () => {
      const argv = ['--debug', '--template='];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe(undefined);
    });

    test('Given a --template argument without value followed by a -- arg, should return undefined.', () => {
      const argv = ['--debug', '--template', '--port=8009'];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe(undefined);
    });

    test('Given a --template argument without value followed by a - arg, should return undefined.', () => {
      const argv = ['--debug', '--template', '-p=8009'];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe(undefined);
    });

    test('Given a --template argument without value followed by nothing, should return undefined.', () => {
      const argv = ['--debug', '--template'];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe(undefined);
    });

    test('Given a -t argument without value followed by a -- arg, should return undefined.', () => {
      const argv = ['--debug', '-t', '--port=8009'];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe(undefined);
    });

    test('Given a -t argument without value followed by a - arg, should return undefined.', () => {
      const argv = ['--debug', '-t', '-p=8009'];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe(undefined);
    });

    test('Given a -t= argument without value followed by nothing, should return undefined.', () => {
      const argv = ['--debug', '-t'];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe(undefined);
    });

    test('Given args without a template argument, should return undefined.', () => {
      const argv = ['--debug', '--port=8009'];

      const result = getSamconfigPath(argv, projectRootResolved);

      expect(result).toBe(undefined);
    });
  });
});
