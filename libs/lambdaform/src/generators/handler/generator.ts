import {
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  Tree,
} from '@nx/devkit';
import { HandlerGeneratorSchema } from './schema';
import { appendFragment } from '../../utils/append-fragment';
import { getVersions } from '../../utils/versions';
import { toTerraformName } from '../../utils/to-terraform-name';

export async function handlerGenerator(
  tree: Tree,
  options: HandlerGeneratorSchema
): Promise<void> {
  const appsDir = getWorkspaceLayout(tree).appsDir;
  const versions = await getVersions();
  const projectName = names(options.project).fileName;
  const projectRoot = joinPathFragments(appsDir, projectName);

  const terraformOptions = {
    handlerNameTf: toTerraformName(options.handlerName),
    projectTf: toTerraformName(options.project),
  };

  generateFiles(tree, joinPathFragments(__dirname, 'files'), projectRoot, {
    ...options,
    ...terraformOptions,
    ...versions,
    appsDir,
  });

  await appendFragment(tree, options, terraformOptions, versions, {
    fragmentPath: joinPathFragments(
      __dirname,
      'append-fragments',
      'terraform',
      'main.tf'
    ),
    appendFilePath: joinPathFragments(projectRoot, 'terraform', 'main.tf'),
  });

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

export default handlerGenerator;
