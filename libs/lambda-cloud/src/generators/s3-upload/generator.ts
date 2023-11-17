import {
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  Tree,
} from '@nx/devkit';
import { resolve } from 'node:path';
import { appendFragment } from '../../utils/append-fragment';
import { toTerraformName } from '../../utils/to-terraform-name';
import { getVersions } from '../../utils/versions';
import { S3UploadGeneratorSchema } from './schema';

export async function s3UploadGenerator(
  tree: Tree,
  options: S3UploadGeneratorSchema,
): Promise<void> {
  const appsDir = getWorkspaceLayout(tree).appsDir;
  const versions = getVersions();
  const projectName = names(options.project).fileName;
  const projectRoot = joinPathFragments(appsDir, projectName);

  const terraformOptions = {
    bucketNameTf: toTerraformName(options.bucketName),
    projectTf: toTerraformName(projectName),
  };

  generateFiles(tree, resolve(__dirname, 'files'), projectRoot, {
    ...options,
    ...terraformOptions,
    ...versions,
  });

  await appendFragment(tree, options, terraformOptions, versions, {
    fragmentPathResolved: resolve(
      __dirname,
      'append-fragments',
      'terraform',
      'main.tf',
    ),
    appendFilePath: joinPathFragments(projectRoot, 'terraform', 'main.tf'),
  });

  await appendFragment(tree, options, terraformOptions, versions, {
    fragmentPathResolved: resolve(
      __dirname,
      'append-fragments',
      'terraform',
      'outputs.tf',
    ),
    appendFilePath: joinPathFragments(projectRoot, 'terraform', 'outputs.tf'),
  });

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

export default s3UploadGenerator;
