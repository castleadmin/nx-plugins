import {
  joinPathFragments,
  normalizePath,
  readJson,
  Tree,
  workspaceRoot,
} from '@nx/devkit';
import { ProjectType } from '@nx/workspace';
import { normalize, relative } from 'node:path';

export type ProjectOptions = ProjectOptionsApplication | ProjectOptionsLibrary;

export interface ProjectOptionsApplication {
  name: string;
  directory: string | undefined;
  projectType: ProjectType.Application;
}

export interface ProjectOptionsLibrary {
  name: string;
  directory: string | undefined;
  projectType: ProjectType.Library;
  importPath: string | undefined;
}

export type NormalizedProjectOptions<T extends ProjectOptions> =
  T extends ProjectOptionsLibrary
    ? NormalizedProjectOptionsLibrary
    : NormalizedProjectOptionsApplication;

export interface NormalizedProjectOptionsApplication {
  /**
   * Normalized full project name that can contain a npm scope (e.g '@org/example').
   */
  projectName: string;
  /**
   * Normalized project root that represents the path to the project from the workspace root.
   */
  projectRoot: string;
  /**
   * Normalized project name without scope. It's meant to be used when generating file names that contain the project name.
   */
  projectFileName: string;
}

export interface NormalizedProjectOptionsLibrary {
  /**
   * Normalized full project name that can contain a npm scope (e.g '@org/example').
   */
  projectName: string;
  /**
   * Normalized project root that represents the path to the project from the workspace root.
   */
  projectRoot: string;
  /**
   * Normalized project name without scope. It's meant to be used when generating file names that contain the project name.
   */
  projectFileName: string;
  /**
   * Normalized import path for the project. Defines the npm package name for publishable projects.
   */
  importPath: string;
}

export const normalizeProjectOptions = <T extends ProjectOptions>(
  tree: Tree,
  options: T,
): NormalizedProjectOptions<T> => {
  validateProjectName(options.name);
  return createNormalizedProjectOptions(tree, options);
};

const validateProjectName = (name: string): void => {
  /**
   * Matches two types of project names:
   *
   * 1. Valid npm package names (e.g., '@scope/name' or 'name').
   * 2. Names starting with a letter and can contain any character except whitespace and ':'.
   *
   * The second case is to support the legacy behavior (^[a-zA-Z].*$) with the difference
   * that it doesn't allow the ":" character. It was wrong to allow it because it would
   * conflict with the notation for tasks.
   */
  const pattern =
    '(?:^@[a-zA-Z0-9-*~][a-zA-Z0-9-*._~]*\\/[a-zA-Z0-9-~][a-zA-Z0-9-._~]*|^[a-zA-Z][^:]*)$';
  const validationRegExp = new RegExp(pattern);
  if (!validationRegExp.test(name)) {
    throw new Error(
      `The provided project name '${name}' is invalid. It must match the pattern '${pattern}'.`,
    );
  }
};

const createNormalizedProjectOptions = <T extends ProjectOptions>(
  tree: Tree,
  options: T,
): NormalizedProjectOptions<T> => {
  const projectName = options.name;
  const projectDirectory = getProjectDirectory(projectName, options);
  const projectFileName = getProjectFileName(projectName);

  const normalizedOptions:
    | NormalizedProjectOptionsApplication
    | NormalizedProjectOptionsLibrary = {
    projectName,
    projectFileName,
    projectRoot: projectDirectory,
  };

  if (options.projectType === ProjectType.Library) {
    (normalizedOptions as NormalizedProjectOptionsLibrary).importPath =
      getProjectImportPath(tree, projectName, options);
  }

  return normalizedOptions as NormalizedProjectOptions<T>;
};

const getProjectDirectory = (
  projectName: string,
  options: ProjectOptions,
): string => {
  let projectDirectory: string;

  const relativeDirectoryUnix = options.directory
    ? removeTrailingSlash(normalizePath(normalize(options.directory)))
    : undefined;
  const relativeCwdUnix = removeTrailingSlash(
    normalizePath(normalize(relative(workspaceRoot, getCwd()))),
  );

  if (relativeDirectoryUnix) {
    // If a directory has been given, it is used to determine the project directory.
    if (
      relativeDirectoryUnix === relativeCwdUnix ||
      relativeDirectoryUnix.startsWith(`${relativeCwdUnix}/`)
    ) {
      // If the relative CWD is part of the given directory, then use the directory as project directory.
      projectDirectory = relativeDirectoryUnix;
    } else {
      // Otherwise, append the given directory to the CWD and use the resulting path as project directory.
      projectDirectory = joinPathFragments(
        relativeCwdUnix,
        relativeDirectoryUnix,
      );
    }
  } else {
    // If no directory has been given, determine the project directory with the help of the CWD.
    if (relativeCwdUnix.endsWith(projectName)) {
      // If the CWD does end with the project name, then use the CWD as project directory.
      projectDirectory = relativeCwdUnix;
    } else {
      // If the CWD doesn't end with the project name, then append the project name to the CWD and use the resulting path as project directory.
      projectDirectory = joinPathFragments(relativeCwdUnix, projectName);
    }
  }

  return projectDirectory;
};

const getProjectFileName = (projectName: string): string => {
  let projectFileName = projectName;

  // If the project name contains a npm scope.
  if (projectName.startsWith('@')) {
    const projectNameWithoutScope = projectName.split('/')[1];

    projectFileName = projectNameWithoutScope as string;
  }

  return projectFileName;
};

const getProjectImportPath = (
  tree: Tree,
  projectName: string,
  options: ProjectOptionsLibrary,
): string => {
  let projectImportPath: string;

  // If the project name contains a npm scope.
  if (projectName.startsWith('@')) {
    // Use the project name as npm package name, if no import path has been defined.
    projectImportPath = options.importPath ?? projectName;
  } else {
    // If the project name doesn't contain a npm scope.
    if (options.importPath) {
      // Use the import path as package name, if it is defined.
      projectImportPath = options.importPath;
    } else {
      const workspacePackageJsonName = getWorkspacePackageJsonName(tree);
      const workspacePackageJsonScope = workspacePackageJsonName?.startsWith(
        '@',
      )
        ? workspacePackageJsonName?.split('/')[0]
        : undefined;

      // Append the project name to the workspace npm scope and use it as package name.
      // If the workspace npm scope isn't defined, then use the project name as package name.
      projectImportPath = workspacePackageJsonScope
        ? `${workspacePackageJsonScope}/${projectName}`
        : projectName;
    }
  }

  return projectImportPath;
};

const removeTrailingSlash = (pathUnix: string): string => {
  return pathUnix.replace(/\/$/, '');
};

const getWorkspacePackageJsonName = (tree: Tree): string | undefined => {
  if (tree.exists('package.json')) {
    return readJson<{ name?: string }>(tree, 'package.json').name;
  }

  return undefined;
};

/**
 * When running a script with the package manager (e.g. `npm run`), the package manager will
 * traverse the directory tree upwards until it finds a `package.json` and will set `process.cwd()`
 * to the folder where it found it. The actual working directory is stored in the INIT_CWD
 * environment variable (see here: https://docs.npmjs.com/cli/v9/commands/npm-run-script#description).
 */
const getCwd = (): string => {
  return process.env['INIT_CWD']?.startsWith(workspaceRoot)
    ? process.env['INIT_CWD']
    : process.cwd();
};

export default normalizeProjectOptions;
