// TODO try to implement a solution with yargs
export const filterUnparsed = (unparsed: string[], optionNames: string[]) => {
  const filteredUnparsed: string[] = [];

  for (let i = 0; i < unparsed.length; i++) {
    const arg = unparsed[i] ?? '';
    let isOption = false;

    for (const optionName of optionNames) {
      if (arg === `--${optionName}`) {
        i++;
        isOption = true;
        break;
      } else if (arg.startsWith(`--${optionName}=`)) {
        isOption = true;
        break;
      }
    }

    if (!isOption) {
      filteredUnparsed.push(arg);
    }
  }

  return filteredUnparsed;
};
