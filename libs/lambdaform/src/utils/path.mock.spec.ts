import { join, normalize, posix, relative, resolve, win32 } from 'node:path';

jest.mock('node:path', () => {
  const originalModule = jest.requireActual('node:path');

  return {
    __esModule: true,
    ...originalModule,
    join: jest.fn(),
    normalize: jest.fn(),
    relative: jest.fn(),
    resolve: jest.fn(),
  };
});

export const useUnixPath = () => {
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
};
export const useWindowsPath = () => {
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
};

describe('path.mock', () => {
  describe('useUnixPath', () => {
    beforeEach(() => {
      useUnixPath();
    });

    it('join', () => {
      expect(join('a/b/c', 'd/e')).toBe('a/b/c/d/e');
    });

    it('normalize', () => {
      expect(normalize('a/b/c/./d/e')).toBe('a/b/c/d/e');
    });

    it('relative', () => {
      expect(relative('/a/b/d/e', '/a/b/c')).toBe('../../c');
    });

    it('resolve', () => {
      expect(resolve('/', 'a/b/c', 'd/e')).toBe('/a/b/c/d/e');
    });
  });

  describe('useWindowsPath', () => {
    beforeEach(() => {
      useWindowsPath();
    });

    it('join', () => {
      expect(join('a/b/c', 'd\\e')).toBe('a\\b\\c\\d\\e');
    });

    it('normalize', () => {
      expect(normalize('a/b/c\\.\\d\\e')).toBe('a\\b\\c\\d\\e');
    });

    it('relative', () => {
      expect(relative('C:\\a/b\\d/e', 'C:\\a\\b/c')).toBe('..\\..\\c');
    });

    it('resolve', () => {
      expect(resolve('C:\\', 'a/b/c', 'd\\e')).toBe('C:\\a\\b\\c\\d\\e');
    });
  });
});
