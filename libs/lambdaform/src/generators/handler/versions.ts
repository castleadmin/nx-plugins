export interface Versions {
  awsTerraformProvider: string;
}

export const getVersions = async (): Promise<Versions> => {
  const awsTerraformProvider = '5.8.0';

  return {
    awsTerraformProvider
  };
};
