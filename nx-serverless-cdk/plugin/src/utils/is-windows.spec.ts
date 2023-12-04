import { isWindows } from './is-windows';

describe('isWindows', () => {
  test('Given a Node.js environment, should use the process.platform property to determine the OS.', () => {
    expect(isWindows()).toBe(process.platform === 'win32');
  });
});
