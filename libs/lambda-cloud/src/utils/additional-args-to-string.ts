export const additionalArgsToString = (
  positionalArgs: string[] | undefined,
  additionalArgs: { [key: string]: unknown },
) => {
  const positionalArgsString = positionalArgs ? positionalArgs.join(' ') : '';
  const additionalArgsString = Object.keys(additionalArgs)
    .map((key) => argToString(key, additionalArgs))
    .join(' ');

  if (positionalArgsString && additionalArgsString) {
    return `${positionalArgsString} ${additionalArgsString}`;
  }

  if (positionalArgsString) {
    return positionalArgsString;
  }

  return additionalArgsString;
};

const argToString = (
  key: string,
  additionalArgs: { [key: string]: unknown },
): string => {
  let argNameString = key.length === 1 ? `-${key}` : `--${key}`;
  const argValue = additionalArgs[key];
  let argValueString = ` "${argValue?.toString()}"`;

  if (argValue === true) {
    argValueString = '';
  }

  if (argValue === false && key.length === 1) {
    argValueString = ' false';
  }

  if (argValue === false && key.length !== 1) {
    argNameString = `--no-${key}`;
    argValueString = '';
  }

  if (typeof argValue === 'string') {
    argValueString = ` "${argValue}"`;
  }

  if (typeof argValue === 'number') {
    argValueString = ` ${argValue}`;
  }

  return `${argNameString}${argValueString}`;
};
