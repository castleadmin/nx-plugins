import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  Tree,
} from '@nx/devkit';
import { SharedGeneratorSchema } from './schema';
import { toTerraformName } from '../../utils/to-terraform-name';
import { resolve } from 'node:path';
import { createProjectConfiguration } from './create-project-configuration';

export const sharedGenerator = async (
  tree: Tree,
  options: SharedGeneratorSchema
): Promise<void> => {
  const appsDir = getWorkspaceLayout(tree).appsDir;
  const projectName = names(options.sharedResourcesName).fileName;
  const projectRoot = joinPathFragments(appsDir, projectName);

  const terraformOptions = {
    sharedResourcesNameTf: toTerraformName(options.sharedResourcesName),
  };

  generateFiles(tree, resolve(__dirname, 'files'), projectRoot, {
    ...options,
    ...terraformOptions,
  });

  addProjectConfiguration(
    tree,
    options.sharedResourcesName,
    createProjectConfiguration(projectRoot, options)
  );

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
};

export default sharedGenerator;
