import { names } from '@nx/devkit';

export const toTerraformName = (name: string) =>
  names(name).constantName.toLowerCase();
