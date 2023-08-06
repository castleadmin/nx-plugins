import {
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { Handler } from '../executors/build/schema';

export const addHandlerToConfiguration = ({
  name,
  path,
  projectName,
  tree,
}: {
  name: string;
  path: string;
  projectName: string;
  tree: Tree;
}): void => {
  const projectConfiguration = readProjectConfiguration(tree, projectName);
  const buildTarget = projectConfiguration.targets?.['build'];

  if (!buildTarget) {
    console.error(
      "Target build isn't defined inside the project configuration. The handler couldn't be added to the target."
    );

    return;
  }

  const handlerDeclarations: Handler[][] = [];

  if (buildTarget.options?.['handlers']) {
    handlerDeclarations.push(buildTarget.options?.['handlers']);
  }

  if (buildTarget.configurations) {
    Object.keys(buildTarget.configurations).forEach((key) => {
      if (buildTarget.configurations?.[key]['handlers']) {
        handlerDeclarations.push(buildTarget.configurations?.[key]['handlers']);
      }
    });
  }

  const handler: Handler = {
    name,
    path,
    assets: [],
    externalDependencies: 'none',
    excludeAwsSdk: true,
  };

  handlerDeclarations.forEach((declaration) => {
    declaration.push(handler);
  });

  updateProjectConfiguration(tree, projectName, projectConfiguration);
};
