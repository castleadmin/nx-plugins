/**
 * Filters out invalid SSM parameter name characters (https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-paramstore-su-create.html).
 * Throws an error if the resulting name has zero length.
 */
export const toValidSsmParameterName = (parameterName: string): string => {
  const validName = parameterName.replace(/[^a-zA-Z0-9_./-]/g, '');

  if (!validName) {
    throw new Error(
      `The valid SSM parameter name for '${parameterName}' is an empty string.`,
    );
  }

  return validName;
};
