import {
  cacheDir,
  CreateDependencies,
  CreateNodes,
  hashArray,
  readJsonFile,
  TargetConfiguration,
  writeJsonFile,
} from '@nx/devkit';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { AppType } from '../generators/cdk-app/app-type';
import {
  createTargets,
  CustomTargetNames,
} from '../generators/cdk-app/create-project-configuration';

export type NxServerlessCdkPluginOptions = CustomTargetNames;

const cachePath = join(cacheDir, 'nx-serverless-cdk.hash');

const calculatedTargets: Record<
  string,
  Record<string, TargetConfiguration>
> = {};

const readTargetsCache = (): Record<
  string,
  Record<string, TargetConfiguration>
> => {
  return readJsonFile(cachePath);
};

const targetsCache = existsSync(cachePath) ? readTargetsCache() : {};

const writeTargetsToCache = (
  targets: Record<string, Record<string, TargetConfiguration>>,
): void => {
  writeJsonFile(cachePath, targets);
};

export const hashObject = (obj: Record<string, unknown>): string => {
  const parts: string[] = [];

  for (const key of Object.keys(obj).sort()) {
    parts.push(key);
    parts.push(JSON.stringify(obj[key]));
  }

  return hashArray(parts);
};

export const calculateHashForCreateNodes = ({
  defaultEnvironment,
  environments,
  type,
  options,
}: {
  defaultEnvironment: string;
  environments: string[];
  type: AppType;
  options: NxServerlessCdkPluginOptions;
}): string => {
  return hashArray([
    defaultEnvironment,
    hashArray(environments),
    type,
    hashObject(options as Record<string, unknown>),
  ]);
};

const buildNxServerlessCdkTargets = async ({
  defaultEnvironment,
  environments,
  type,
  options,
}: {
  defaultEnvironment: string;
  environments: string[];
  type: AppType;
  options: NxServerlessCdkPluginOptions;
}): Promise<Record<string, TargetConfiguration>> => {
  return createTargets({
    defaultEnvironment,
    environments,
    type,
    customTargetNames: options,
  });
};

export const createDependencies: CreateDependencies = () => {
  writeTargetsToCache(calculatedTargets);
  return [];
};

export const createNodes: CreateNodes<NxServerlessCdkPluginOptions> = [
  '**/cdk.json',
  async (configFilePath, options, context) => {
    const normalizedOptions = options ?? {};
    const projectRoot = dirname(configFilePath);
    const projectRootResolved = resolve(context.workspaceRoot, projectRoot);
    const cdkJsonResolved = resolve(context.workspaceRoot, configFilePath);

    // Do not create a project if package.json and project.json isn't there.
    const siblingFiles = readdirSync(projectRootResolved);
    if (
      !siblingFiles.includes('package.json') &&
      !siblingFiles.includes('project.json')
    ) {
      return {};
    }

    const cdkJson = readJsonFile(cdkJsonResolved);
    const defaultEnvironment =
      cdkJson.context['nx-serverless-cdk/defaultEnvironment'] ?? 'Dev';
    const environments: string[] =
      cdkJson.context['nx-serverless-cdk/environments'] ?? [];
    const type: AppType =
      cdkJson.context['nx-serverless-cdk/type'] ?? AppType.generic;

    const hash = calculateHashForCreateNodes({
      defaultEnvironment,
      environments,
      type,
      options: normalizedOptions,
    });
    const targets = targetsCache[hash]
      ? (targetsCache[hash] as Record<string, TargetConfiguration>)
      : await buildNxServerlessCdkTargets({
          defaultEnvironment,
          environments,
          type,
          options: normalizedOptions,
        });

    calculatedTargets[hash] = targets;

    return {
      projects: {
        [projectRoot]: {
          root: projectRoot,
          targets,
        },
      },
    };
  },
];
