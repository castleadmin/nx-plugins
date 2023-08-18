import { join, normalize, posix, resolve, win32 } from 'node:path';

jest.mock('node:path', () => {
  const originalModule = jest.requireActual('node:path');

  return {
    __esModule: true,
    ...originalModule,
    join: jest.fn(),
    normalize: jest.fn(),
    resolve: jest.fn(),
  };
});

export const useUnixPath = () => {
  (join as jest.MockedFunction<typeof join>).mockImplementation(posix.join);
  (resolve as jest.MockedFunction<typeof resolve>).mockImplementation(
    posix.resolve
  );
  (normalize as jest.MockedFunction<typeof normalize>).mockImplementation(
    posix.normalize
  );
};
export const useWindowsPath = () => {
  (join as jest.MockedFunction<typeof join>).mockImplementation(win32.join);
  (resolve as jest.MockedFunction<typeof resolve>).mockImplementation(
    win32.resolve
  );
  (normalize as jest.MockedFunction<typeof normalize>).mockImplementation(
    win32.normalize
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

    it('resolve', () => {
      expect(resolve('C:\\', 'a/b/c', 'd\\e')).toBe('C:\\a\\b\\c\\d\\e');
    });
  });
});
