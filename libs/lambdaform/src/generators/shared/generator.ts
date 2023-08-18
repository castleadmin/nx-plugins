import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  Tree,
} from '@nx/devkit';
import { resolve } from 'node:path';
import { toTerraformName } from '../../utils/to-terraform-name';
import { createProjectConfiguration } from './create-project-configuration';
import { SharedGeneratorSchema } from './schema';

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
