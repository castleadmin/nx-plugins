import { ProcessDescriptor } from 'ps-list';
import * as spyObject from './kill-leaf-processes';
import { kill, killLeafProcesses } from './kill-leaf-processes';

describe('killLeafProcesses', () => {
  beforeEach(() => {
    jest.spyOn(spyObject, 'kill').mockImplementation(() => true);
  });

  test('Given an undefined PID parameter, should do nothing.', async () => {
    await killLeafProcesses(undefined);

    expect(kill).toHaveBeenCalledTimes(0);
  });

  describe('Given a list of processes,', () => {
    beforeEach(async () => {
      jest.spyOn(spyObject, 'getPsList').mockImplementation(() =>
        Promise.resolve(
          (): Promise<ProcessDescriptor[]> =>
            Promise.resolve([
              { pid: 10, ppid: 1, name: 'node' },
              { pid: 11, ppid: 10, name: 'node' },
              { pid: 12, ppid: 10, name: 'node' },
              { pid: 13, ppid: 12, name: 'node' },
              { pid: 14, ppid: 13, name: 'node' },
            ]),
        ),
      );
    });

    test('and the PID parameter 3, should kill PID 3.', async () => {
      await killLeafProcesses(3);

      expect(kill).toHaveBeenCalledTimes(1);
      expect(kill).toHaveBeenCalledWith(3);
    });

    test('and the PID parameter 10, should kill PID 11 and 14.', async () => {
      await killLeafProcesses(10);

      expect(kill).toHaveBeenCalledTimes(2);
      expect(kill).toHaveBeenNthCalledWith(1, 14);
      expect(kill).toHaveBeenNthCalledWith(2, 11);
    });
  });
});
