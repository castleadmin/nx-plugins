import {
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  Tree,
} from '@nx/devkit';
import { HandlerGeneratorSchema } from './schema';
import { appendFragment } from '../../utils/appendFragment';
import { getVersions } from '../../utils/versions';

export async function handlerGenerator(
  tree: Tree,
  options: HandlerGeneratorSchema
): Promise<void> {
  const appsDir = getWorkspaceLayout(tree).appsDir;
  const versions = await getVersions(tree);
  const projectName = names(options.project).fileName;
  const projectRoot = joinPathFragments(appsDir, projectName);

  const terraformOptions = {
    handlerNameTf: names(options.handlerName).constantName.toLowerCase(),
    projectTf: names(options.project).constantName.toLowerCase(),
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
      'appendFragments',
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
