import * as nodePath from 'node:path';
import {
  basename,
  dirname,
  join,
  normalize,
  posix,
  relative,
  resolve,
  sep,
  win32,
} from 'node:path';

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

export const useUnixPath = () => {
  (basename as jest.MockedFunction<typeof basename>).mockImplementation(
    posix.basename
  );
  (dirname as jest.MockedFunction<typeof dirname>).mockImplementation(
    posix.dirname
  );
  (join as jest.MockedFunction<typeof join>).mockImplementation(posix.join);
  (normalize as jest.MockedFunction<typeof normalize>).mockImplementation(
    posix.normalize
  );
  (relative as jest.MockedFunction<typeof relative>).mockImplementation(
    posix.relative
  );
  (resolve as jest.MockedFunction<typeof resolve>).mockImplementation(
    posix.resolve
  );
  (
    Object.getOwnPropertyDescriptor(nodePath, 'sep')
      ?.get as jest.MockedFunction<() => string>
  )?.mockImplementation(() => posix.sep);
};
export const useWindowsPath = () => {
  (basename as jest.MockedFunction<typeof basename>).mockImplementation(
    win32.basename
  );
  (dirname as jest.MockedFunction<typeof dirname>).mockImplementation(
    win32.dirname
  );
  (join as jest.MockedFunction<typeof join>).mockImplementation(win32.join);
  (normalize as jest.MockedFunction<typeof normalize>).mockImplementation(
    win32.normalize
  );
  (relative as jest.MockedFunction<typeof relative>).mockImplementation(
    win32.relative
  );
  (resolve as jest.MockedFunction<typeof resolve>).mockImplementation(
    win32.resolve
  );
  (
    Object.getOwnPropertyDescriptor(nodePath, 'sep')
      ?.get as jest.MockedFunction<() => string>
  )?.mockImplementation(() => win32.sep);
};

describe('path.mock', () => {
  describe('useUnixPath', () => {
    beforeEach(() => {
      useUnixPath();
    });

    test('basename', () => {
      expect(basename(normalize('a/b/c/test.json'))).toBe('test.json');
    });

    test('dirname', () => {
      expect(dirname(normalize('a/b/c/test.json'))).toBe('a/b/c');
    });

    test('join', () => {
      expect(join('a/b/c', 'd/e')).toBe('a/b/c/d/e');
    });

    test('normalize', () => {
      expect(normalize('a/b/c/./d/e')).toBe('a/b/c/d/e');
    });

    test('relative', () => {
      expect(relative('/a/b/d/e', '/a/b/c')).toBe('../../c');
    });

    test('resolve', () => {
      expect(resolve('/', 'a/b/c', 'd/e')).toBe('/a/b/c/d/e');
    });

    test('sep', () => {
      expect(sep).toBe('/');
    });
  });

  describe('useWindowsPath', () => {
    beforeEach(() => {
      useWindowsPath();
    });

    test('basename', () => {
      expect(basename(normalize('a/b\\c/test.json'))).toBe('test.json');
    });

    test('dirname', () => {
      expect(dirname(normalize('a/b\\c/test.json'))).toBe('a\\b\\c');
    });

    test('join', () => {
      expect(join('a/b/c', 'd\\e')).toBe('a\\b\\c\\d\\e');
    });

    test('normalize', () => {
      expect(normalize('a/b/c\\.\\d\\e')).toBe('a\\b\\c\\d\\e');
    });

    test('relative', () => {
      expect(relative('C:\\a/b\\d/e', 'C:\\a\\b/c')).toBe('..\\..\\c');
    });

    test('resolve', () => {
      expect(resolve('C:\\', 'a/b/c', 'd\\e')).toBe('C:\\a\\b\\c\\d\\e');
    });

    test('sep', () => {
      expect(sep).toBe('\\');
    });
  });
});
