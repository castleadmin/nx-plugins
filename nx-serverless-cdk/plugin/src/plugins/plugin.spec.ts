import { fs, vol } from 'memfs';
import { join, resolve } from 'node:path';
import { createTargets } from '../generators/cdk-app/create-project-configuration';

jest.mock('fs', () => fs);
jest.mock('node:fs', () => fs);
jest.mock('fs/promises', () => fs.promises);
jest.mock('node:fs/promises', () => fs.promises);

jest.mock('../generators/cdk-app/create-project-configuration');

describe('plugin', () => {
  let pluginModule: typeof import('./plugin');

  beforeEach(async () => {
    vol.reset();

    await jest.isolateModulesAsync(async () => {
      pluginModule = await import('./plugin');
    });

    const createProjectConfigurationModule = jest.requireActual<
      typeof import('../generators/cdk-app/create-project-configuration')
    >('../generators/cdk-app/create-project-configuration');
    (
      createTargets as jest.MockedFunction<typeof createTargets>
    ).mockImplementation(createProjectConfigurationModule.createTargets);
  });

  describe('createDependencies', () => {
    test('Given an in-memory cache of calculated targets, should write the cache to disk.', () => {
      const cache = {
        h1: {
          t1: {},
          t2: {},
        },
        h2: {
          t3: {},
        },
      };
      jest.replaceProperty(pluginModule, 'calculatedTargets', cache);

      pluginModule.createDependencies(
        undefined,
        undefined as unknown as Parameters<
          typeof pluginModule.createDependencies
        >[1],
      );

      expect(
        JSON.parse(
          fs.readFileSync('.nx/cache/nx-serverless-cdk.hash').toString(),
        ),
      ).toEqual(cache);
    });
  });

  describe('createNodes', () => {
    test('Given a filter for configuration files, the filter should point to the cdk.json files of the projects.', () => {
      expect(pluginModule.createNodes[0]).toBe('**/cdk.json');
    });

    describe("Given a project with a cdk.json file that doesn't contain the nx-serverless-cdk properties,", () => {
      let projectResolved: string;
      let configFilePath: string;
      let context: Parameters<(typeof pluginModule.createNodes)[1]>[2];
      let createTargetsMocked: jest.MockedFunction<typeof createTargets>;

      beforeEach(async () => {
        const workspaceRoot = '/workspace';
        const projectName = 'project';
        projectResolved = resolve(workspaceRoot, projectName);

        configFilePath = join(projectResolved, 'cdk.json');
        context = {
          workspaceRoot,
        } as Parameters<(typeof pluginModule.createNodes)[1]>[2];
        createTargetsMocked = createTargets as jest.MockedFunction<
          typeof createTargets
        >;

        await fs.promises.mkdir(projectResolved, {
          recursive: true,
        });

        fs.writeFileSync(
          join(projectResolved, 'project.json'),
          JSON.stringify({}),
        );

        fs.writeFileSync(
          configFilePath,
          JSON.stringify({
            context: {},
          }),
        );
      });

      describe('and undefined options as input parameter,', () => {
        test('should return the default project configuration.', async () => {
          const result = await pluginModule.createNodes[1](
            configFilePath,
            undefined,
            context,
          );

          expect(createTargetsMocked).toHaveBeenCalledTimes(1);
          expect(createTargetsMocked).toHaveBeenCalledWith({
            defaultEnvironment: 'Dev',
            environments: [],
            type: 'generic',
            customTargetNames: {},
          });
          expect(result).toMatchObject({
            projects: {
              '/workspace/project': {
                root: '/workspace/project',
                targets: {
                  cdk: {
                    executor: 'nx-serverless-cdk:cdk',
                    options: {},
                  },
                },
              },
            },
          });
        });
      });
    });

    describe('Given a project with a cdk.json file that contains the nx-serverless-cdk properties,', () => {
      let projectResolved: string;
      let configFilePath: string;
      let context: Parameters<(typeof pluginModule.createNodes)[1]>[2];
      let createTargetsMocked: jest.MockedFunction<typeof createTargets>;

      beforeEach(async () => {
        const workspaceRoot = '/workspace';
        const projectName = 'project';
        projectResolved = resolve(workspaceRoot, projectName);

        configFilePath = join(projectResolved, 'cdk.json');
        context = {
          workspaceRoot,
        } as Parameters<(typeof pluginModule.createNodes)[1]>[2];
        createTargetsMocked = createTargets as jest.MockedFunction<
          typeof createTargets
        >;

        await fs.promises.mkdir(projectResolved, {
          recursive: true,
        });

        fs.writeFileSync(
          join(projectResolved, 'project.json'),
          JSON.stringify({}),
        );

        fs.writeFileSync(
          configFilePath,
          JSON.stringify({
            context: {
              'nx-serverless-cdk/defaultEnvironment': 'Test',
              'nx-serverless-cdk/environments': ['Test', 'Live'],
              'nx-serverless-cdk/type': 'lambda',
            },
          }),
        );
      });

      test('should load the cache on module initialization.', async () => {
        const cache = {
          h1: {
            t1: {},
            t2: {},
          },
          h2: {
            t3: {},
          },
        };
        await fs.promises.mkdir('.nx/cache', { recursive: true });
        fs.writeFileSync(
          '.nx/cache/nx-serverless-cdk.hash',
          JSON.stringify(cache),
        );

        await jest.isolateModulesAsync(async () => {
          pluginModule = await import('./plugin');
        });

        expect(pluginModule.targetsCache).toEqual(cache);
      });

      describe('and undefined options as input parameter,', () => {
        test("should return an empty object if the project.json isn't defined.", async () => {
          fs.rmSync(join(projectResolved, 'project.json'));

          const result = await pluginModule.createNodes[1](
            configFilePath,
            undefined,
            context,
          );

          expect(createTargetsMocked).toHaveBeenCalledTimes(0);
          expect(result).toEqual({});
        });

        test('should return the default project configuration.', async () => {
          const result = await pluginModule.createNodes[1](
            configFilePath,
            undefined,
            context,
          );

          expect(createTargetsMocked).toHaveBeenCalledTimes(1);
          expect(createTargetsMocked).toHaveBeenCalledWith({
            defaultEnvironment: 'Test',
            environments: ['Test', 'Live'],
            type: 'lambda',
            customTargetNames: {},
          });
          expect(result).toMatchObject({
            projects: {
              '/workspace/project': {
                root: '/workspace/project',
                targets: {
                  cdk: {
                    executor: 'nx-serverless-cdk:cdk',
                    options: {},
                  },
                },
              },
            },
          });
        });

        test('and a cached project configuration, should read the project configuration from cache.', async () => {
          const cachedResult = await pluginModule.createNodes[1](
            configFilePath,
            undefined,
            context,
          );
          jest.replaceProperty(
            pluginModule,
            'targetsCache',
            pluginModule.calculatedTargets,
          );
          createTargetsMocked.mockClear();

          const result = await pluginModule.createNodes[1](
            configFilePath,
            undefined,
            context,
          );

          expect(createTargetsMocked).toHaveBeenCalledTimes(0);
          expect(result).toEqual(cachedResult);
          expect(result).toMatchObject({
            projects: {
              '/workspace/project': {
                root: '/workspace/project',
                targets: {
                  cdk: {
                    executor: 'nx-serverless-cdk:cdk',
                    options: {},
                  },
                },
              },
            },
          });
        });
      });

      describe('and empty options as input parameter,', () => {
        test('should return the default project configuration.', async () => {
          const result = await pluginModule.createNodes[1](
            configFilePath,
            {},
            context,
          );

          expect(createTargetsMocked).toHaveBeenCalledTimes(1);
          expect(createTargetsMocked).toHaveBeenCalledWith({
            defaultEnvironment: 'Test',
            environments: ['Test', 'Live'],
            type: 'lambda',
            customTargetNames: {},
          });
          expect(result).toMatchObject({
            projects: {
              '/workspace/project': {
                root: '/workspace/project',
                targets: {
                  cdk: {
                    executor: 'nx-serverless-cdk:cdk',
                    options: {},
                  },
                },
              },
            },
          });
        });
      });

      describe('and a cdk target overwrite as input parameter,', () => {
        test('should return the project configuration with an overridden cdk target name.', async () => {
          const result = await pluginModule.createNodes[1](
            configFilePath,
            {
              cdkTargetName: 'cdkTest',
            },
            context,
          );

          expect(createTargetsMocked).toHaveBeenCalledTimes(1);
          expect(createTargetsMocked).toHaveBeenCalledWith({
            defaultEnvironment: 'Test',
            environments: ['Test', 'Live'],
            type: 'lambda',
            customTargetNames: {
              cdkTargetName: 'cdkTest',
            },
          });
          expect(result).toMatchObject({
            projects: {
              '/workspace/project': {
                root: '/workspace/project',
                targets: {
                  cdkTest: {
                    executor: 'nx-serverless-cdk:cdk',
                    options: {},
                  },
                },
              },
            },
          });
        });
      });
    });
  });
});
