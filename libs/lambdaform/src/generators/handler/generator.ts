import {
  convertNxGenerator,
  formatFiles,
  generateFiles, getWorkspaceLayout, joinPathFragments, names,
  Tree,
} from '@nx/devkit';
import { HandlerGeneratorSchema } from './schema';
import {getVersions, Versions} from "./versions";
import {render} from "ejs";

const appendFragment = (tree: Tree, options: HandlerGeneratorSchema, versions: Versions, paths: {
                        fragmentPath: string;
                        appendFilePath: string;}
                        ): void => {
  const fragmentTemplate = tree.read(paths.fragmentPath)?.toString('utf8');
  if (!fragmentTemplate) {
    throw new Error(`Fragment '${paths.fragmentPath}' couldn't be found`);
  }
  const fragment = render(fragmentTemplate, {...options, ...versions});

  tree.write(paths.appendFilePath, fragment, {
    mode: 'O_APPEND'
  })
}


export async function handlerGenerator(
  tree: Tree,
  options: HandlerGeneratorSchema
) {
  const appsDir = getWorkspaceLayout(tree).appsDir;
  const versions = await getVersions();
  const projectName = names(options.project).fileName;
  const projectRoot = joinPathFragments(appsDir, projectName);

  generateFiles(tree, joinPathFragments(__dirname, 'baseFiles'), projectRoot, {
    ...options, ...versions
  });

  if (options.s3Upload) {
    if (!tree.exists(joinPathFragments(projectRoot, 'terraform', 'modules', 's3Upload'))) {
      generateFiles(tree, joinPathFragments(__dirname, 's3UploadFiles'), projectRoot, {
        ...options, ...versions
      });

      appendFragment(tree, options, versions, {
        fragmentPath: joinPathFragments(__dirname, 'appendFragments', 'terraform', 'main.s3Upload.tf'),
        appendFilePath: joinPathFragments(projectRoot, 'terraform', 'main.tf')
      });
    }
  }

  appendFragment(tree, options, versions, {
    fragmentPath: joinPathFragments(__dirname, 'appendFragments', 'terraform', 'main.handler.tf'),
    appendFilePath: joinPathFragments(projectRoot, 'terraform', 'main.tf')
  });

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

export default handlerGenerator;
export const handlerSchematic = convertNxGenerator(handlerGenerator);
