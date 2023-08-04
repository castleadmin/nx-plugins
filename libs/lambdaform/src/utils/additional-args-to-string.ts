export const additionalArgsToString = (
  positionalArgs: string[] | undefined,
  additionalArgs: { [key: string]: unknown }
) => {
  const positionalArgsString = positionalArgs ? positionalArgs.join(' ') : '';
  const additionalArgsString = Object.keys(additionalArgs)
    .map((key) => argToString(key, additionalArgs))
    .join(' ');

  return `${positionalArgsString} ${additionalArgsString}`;
};

const argToString = (
  key: string,
  additionalArgs: { [key: string]: unknown }
): string => {
  const argNameString = key.length === 1 ? `-${key}` : `--${key}`;
  const argValue = additionalArgs[key];
  let argValueString = `=${argValue?.toString()}`;

  if (argValue === true) {
    argValueString = '';
  }

  return `${argNameString}${argValueString}`;
};
