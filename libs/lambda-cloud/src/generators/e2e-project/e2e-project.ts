import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  GeneratorCallback,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  offsetFromRoot,
  runTasksInSerial,
  Tree,
} from '@nx/devkit';
import { Linter, lintProjectGenerator } from '@nx/eslint';
import { getRelativePathToRootTsConfig } from '@nx/js';
import { resolve } from 'node:path';
import { getVersions } from '../../utils/versions';
import { E2ESchema } from './schema';

const addEslint = async (
  tree: Tree,
  projectName: string,
  projectRoot: string,
): Promise<GeneratorCallback> => {
  return await lintProjectGenerator(tree, {
    project: projectName,
    linter: Linter.EsLint,
    skipFormat: true,
    tsConfigPaths: [joinPathFragments(projectRoot, 'tsconfig.json')],
    eslintFilePatterns: [`${projectRoot}/**/*.{js,ts}`],
    setParserOptionsProject: false,
    skipPackageJson: false,
    rootProject: false,
  });
};
export async function e2eProjectGenerator(
  tree: Tree,
  options: E2ESchema,
): Promise<GeneratorCallback> {
  const appsDir = getWorkspaceLayout(tree).appsDir;
  const versions = getVersions();
  const projectName = names(`${options.project}-e2e`).fileName;
  const projectRoot = joinPathFragments(appsDir, projectName);

  const tasks: GeneratorCallback[] = [];

  // axios is more than likely used in the application code, so install it as a regular dependency.
  const installTask = addDependenciesToPackageJson(
    tree,
    { axios: versions.axios },
    {},
  );
  tasks.push(installTask);

  addProjectConfiguration(tree, projectName, {
    root: projectRoot,
    implicitDependencies: [options.project],
    projectType: 'application',
    targets: {
      e2e: {
        executor: '@nx/jest:jest',
        outputs: [`{workspaceRoot}/coverage/${projectRoot}`],
        options: {
          jestConfig: `${projectRoot}/jest.config.ts`,
          passWithNoTests: true,
        },
      },
    },
  });

  generateFiles(tree, resolve(__dirname, 'files'), projectRoot, {
    ...options,
    ...names(options.project),
    projectName,
    offsetFromRoot: offsetFromRoot(projectRoot),
    rootTsConfigPath: getRelativePathToRootTsConfig(tree, projectRoot),
    tmpl: '',
  });

  tasks.push(await addEslint(tree, projectName, projectRoot));

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
}

export default e2eProjectGenerator;
