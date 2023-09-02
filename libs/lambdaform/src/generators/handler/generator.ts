import {
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  Tree,
} from '@nx/devkit';
import { resolve } from 'node:path';
import { addHandlerToConfiguration } from '../../utils/add-handler-to-configuration';
import { appendFragment } from '../../utils/append-fragment';
import { toTerraformName } from '../../utils/to-terraform-name';
import { getVersions } from '../../utils/versions';
import { HandlerGeneratorSchema } from './schema';

export async function handlerGenerator(
  tree: Tree,
  options: HandlerGeneratorSchema
): Promise<void> {
  const appsDir = getWorkspaceLayout(tree).appsDir;
  const versions = getVersions();
  const projectName = names(options.project).fileName;
  const projectRoot = joinPathFragments(appsDir, projectName);

  const terraformOptions = {
    handlerNameTf: toTerraformName(options.handlerName),
    projectTf: toTerraformName(projectName),
  };

  generateFiles(tree, resolve(__dirname, 'files'), projectRoot, {
    ...options,
    ...terraformOptions,
    ...versions,
    appsDir,
  });

  await appendFragment(tree, options, terraformOptions, versions, {
    fragmentPathResolved: resolve(
      __dirname,
      'append-fragments',
      'terraform',
      'main.tf'
    ),
    appendFilePath: joinPathFragments(projectRoot, 'terraform', 'main.tf'),
  });

  addHandlerToConfiguration({
    name: options.handlerName,
    main: joinPathFragments(projectRoot, 'src', `${options.handlerName}.ts`),
    projectName,
    tree,
  });

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

export default handlerGenerator;
