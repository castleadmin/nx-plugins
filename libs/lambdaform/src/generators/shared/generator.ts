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
import {getVersions} from "../../utils/versions";

export const sharedGenerator = async (
  tree: Tree,
  options: SharedGeneratorSchema
): Promise<void> => {
  const appsDir = getWorkspaceLayout(tree).appsDir;
  const versions = await getVersions(tree);
  const projectName = names(options.sharedResourcesName).fileName;
  const projectRoot = joinPathFragments(appsDir, projectName);

  generateFiles(tree, joinPathFragments(__dirname, 'files'), projectRoot, {
    ...options, ...versions
  });

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
