import {Tree} from "@nx/devkit";
import {Versions} from "../generators/handler/versions";
import {render} from "ejs";
import {readFile} from "node:fs/promises";

export const appendFragment = async <T> (tree: Tree, options: T, versions: Versions, paths: {
  fragmentPath: string;
  appendFilePath: string;}
): Promise<void> => {
  const fragmentTemplate = await readFile(paths.fragmentPath, {encoding: 'utf8'});
  const fragment = render(fragmentTemplate, {...options, ...versions});

  if (!tree.exists(paths.appendFilePath)) {
    throw new Error(`Append file '${paths.appendFilePath}' couldn't be found`);
  }
  const appendFileContent = tree.read(paths.appendFilePath, 'utf8');
  tree.write(paths.appendFilePath, appendFileContent ? `${appendFileContent}\n${fragment}` : fragment);
}
