import {
  addProjectConfiguration,
  convertNxGenerator,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  Tree,
} from '@nx/devkit';
import { SharedGeneratorSchema } from './schema';
import { getVersions } from './versions';
import {appendFragment} from "../../utils/appendFragment";

export const sharedGenerator = async (
  tree: Tree,
  options: SharedGeneratorSchema
): Promise<void> => {
  const appsDir = getWorkspaceLayout(tree).appsDir;
  const versions = await getVersions();
  const projectName = names(options.sharedResourcesName).fileName;
  const projectRoot = joinPathFragments(appsDir, projectName);

  generateFiles(tree, joinPathFragments(__dirname, 'baseFiles'), projectRoot, {
    ...options, ...versions
  });

  if (options.s3Upload) {
    generateFiles(tree, joinPathFragments(__dirname, 's3UploadFiles'), projectRoot, {
      ...options, ...versions
    });

    await appendFragment(tree, options, versions, {
      fragmentPath: joinPathFragments(__dirname, 'appendFragments', 'terraform', 'main.s3Upload.tf'),
      appendFilePath: joinPathFragments(projectRoot, 'terraform', 'main.tf')
    });

    await appendFragment(tree, options, versions, {
      fragmentPath: joinPathFragments(__dirname, 'appendFragments', 'terraform', 'outputs.s3Upload.tf'),
      appendFilePath: joinPathFragments(projectRoot, 'terraform', 'outputs.tf')
    });
  }

  addProjectConfiguration(tree, options.sharedResourcesName, {
    root: projectRoot,
    sourceRoot: joinPathFragments(projectRoot, 'terraform'),
    projectType: 'application',
    // TODO
    targets: {},
    // TODO
    tags: [`app:${options.sharedResourcesName}`, 'lambdaform:shared'],
  });

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
};

export default sharedGenerator;
export const sharedSchematic = convertNxGenerator(sharedGenerator);
