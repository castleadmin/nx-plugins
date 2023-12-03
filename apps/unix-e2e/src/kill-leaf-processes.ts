import { ProcessDescriptor } from 'ps-list';

export const killLeafProcesses = async (pid?: number): Promise<void> => {
  if (!pid) {
    return;
  }

  const psList = await getPsList();
  const processList: ProcessDescriptor[] = await psList();
  const pidStack: number[] = [pid];
  const leafProcessPids: number[] = [];

  while (pidStack.length > 0) {
    const currentPid = pidStack.pop() as number;
    const childProcessPids = processList
      .filter((p) => p.ppid === currentPid)
      .map((p) => p.pid);

    if (childProcessPids.length > 0) {
      pidStack.push(...childProcessPids);
    } else {
      leafProcessPids.push(currentPid);
    }
  }

  leafProcessPids.forEach((leafProcessPid) => {
    kill(leafProcessPid);
  });
};

// Ensure that the dynamic import isn't transformed to a require call by TypeScript.
export const getPsList = async (): Promise<
  () => Promise<ProcessDescriptor[]>
> => (await eval(`import('ps-list')`)).default;

export const kill = (pid: number): true => process.kill(pid);
