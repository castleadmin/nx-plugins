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
    posix.basename,
  );
  (dirname as jest.MockedFunction<typeof dirname>).mockImplementation(
    posix.dirname,
  );
  (join as jest.MockedFunction<typeof join>).mockImplementation(posix.join);
  (normalize as jest.MockedFunction<typeof normalize>).mockImplementation(
    posix.normalize,
  );
  (relative as jest.MockedFunction<typeof relative>).mockImplementation(
    posix.relative,
  );
  (resolve as jest.MockedFunction<typeof resolve>).mockImplementation(
    posix.resolve,
  );
  (
    Object.getOwnPropertyDescriptor(nodePath, 'sep')
      ?.get as jest.MockedFunction<() => string>
  )?.mockImplementation(() => posix.sep);
};
export const useWindowsPath = () => {
  (basename as jest.MockedFunction<typeof basename>).mockImplementation(
    win32.basename,
  );
  (dirname as jest.MockedFunction<typeof dirname>).mockImplementation(
    win32.dirname,
  );
  (join as jest.MockedFunction<typeof join>).mockImplementation(win32.join);
  (normalize as jest.MockedFunction<typeof normalize>).mockImplementation(
    win32.normalize,
  );
  (relative as jest.MockedFunction<typeof relative>).mockImplementation(
    win32.relative,
  );
  (resolve as jest.MockedFunction<typeof resolve>).mockImplementation(
    win32.resolve,
  );
  (
    Object.getOwnPropertyDescriptor(nodePath, 'sep')
      ?.get as jest.MockedFunction<() => string>
  )?.mockImplementation(() => win32.sep);
};

describe('path.mock', () => {
  describe('Given a node:path Unix mock,', () => {
    beforeEach(() => {
      useUnixPath();
    });

    test('basename should return the OS specific result.', () => {
      expect(basename(normalize('a/b/c/test.json'))).toBe('test.json');
    });

    test('dirname should return the OS specific result.', () => {
      expect(dirname(normalize('a/b/c/test.json'))).toBe('a/b/c');
    });

    test('join should return the OS specific result.', () => {
      expect(join('a/b/c', 'd/e')).toBe('a/b/c/d/e');
    });

    test('normalize should return the OS specific result.', () => {
      expect(normalize('a/b/c/./d/e')).toBe('a/b/c/d/e');
    });

    test('relative should return the OS specific result.', () => {
      expect(relative('/a/b/d/e', '/a/b/c')).toBe('../../c');
    });

    test('resolve should return the OS specific result.', () => {
      expect(resolve('/', 'a/b/c', 'd/e')).toBe('/a/b/c/d/e');
    });

    test('sep should return the OS specific result.', () => {
      expect(sep).toBe('/');
    });
  });

  describe('Given a node:path Windows mock,', () => {
    beforeEach(() => {
      useWindowsPath();
    });

    test('basename should return the OS specific result.', () => {
      expect(basename(normalize('a/b\\c/test.json'))).toBe('test.json');
    });

    test('dirname should return the OS specific result.', () => {
      expect(dirname(normalize('a/b\\c/test.json'))).toBe('a\\b\\c');
    });

    test('join should return the OS specific result.', () => {
      expect(join('a/b/c', 'd\\e')).toBe('a\\b\\c\\d\\e');
    });

    test('normalize should return the OS specific result.', () => {
      expect(normalize('a/b/c\\.\\d\\e')).toBe('a\\b\\c\\d\\e');
    });

    test('relative should return the OS specific result.', () => {
      expect(relative('C:\\a/b\\d/e', 'C:\\a\\b/c')).toBe('..\\..\\c');
    });

    test('resolve should return the OS specific result.', () => {
      expect(resolve('C:\\', 'a/b/c', 'd\\e')).toBe('C:\\a\\b\\c\\d\\e');
    });

    test('sep should return the OS specific result.', () => {
      expect(sep).toBe('\\');
    });
  });
});
