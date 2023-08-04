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

  addProjectConfiguration(tree, options.sharedResourcesName, {
    root: projectRoot,
    sourceRoot: joinPathFragments(projectRoot, 'terraform'),
    projectType: 'application',
    // TODO add project configuration
    targets: {},
    tags: [`app:${options.sharedResourcesName}`, 'lambdaform:shared'],
  });

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
};

export default sharedGenerator;
