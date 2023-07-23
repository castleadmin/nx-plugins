import {
  convertNxGenerator,
  formatFiles,
  generateFiles, getWorkspaceLayout, joinPathFragments, names,
  Tree,
} from '@nx/devkit';
import { S3UploadGeneratorSchema } from './schema';
import {appendFragment} from "../../utils/appendFragment";
import {getVersions} from "../../utils/versions";

export async function s3UploadGenerator(
  tree: Tree,
  options: S3UploadGeneratorSchema
): Promise<void> {
  const appsDir = getWorkspaceLayout(tree).appsDir;
  const versions = await getVersions(tree);
  const projectName = names(options.project).fileName;
  const projectRoot = joinPathFragments(appsDir, projectName);

  generateFiles(tree, joinPathFragments(__dirname, 'files'), projectRoot, {
    ...options, ...versions
  });

  await appendFragment(tree, options, versions, {
    fragmentPath: joinPathFragments(__dirname, 'appendFragments', 'terraform', 'main.tf'),
    appendFilePath: joinPathFragments(projectRoot, 'terraform', 'main.tf')
  });

  await appendFragment(tree, options, versions, {
    fragmentPath: joinPathFragments(__dirname, 'appendFragments', 'terraform', 'outputs.tf'),
    appendFilePath: joinPathFragments(projectRoot, 'terraform', 'outputs.tf')
  });

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

export default s3UploadGenerator;
export const s3UploadSchematic = convertNxGenerator(s3UploadGenerator);
