import { faker } from '@faker-js/faker';
import {
  ProjectConfiguration,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { addHandlerToConfiguration } from './add-handler-to-configuration';

jest.mock('@nx/devkit', () => {
  const originalModule = jest.requireActual('@nx/devkit');

  return {
    __esModule: true,
    ...originalModule,
    readProjectConfiguration: jest.fn(),
    updateProjectConfiguration: jest.fn(),
  };
});

describe('addHandlerToConfiguration', () => {
  let name: string;
  let path: string;
  let projectName: string;
  let tree: Tree;

  beforeEach(() => {
    name = faker.word.sample();
    path = faker.system.filePath();
    projectName = faker.word.sample();
    tree = createTreeWithEmptyWorkspace();
    const projectConfiguration: ProjectConfiguration = {
      root: 'apps/test-project',
      targets: {
        build: {
          executor: 'lambdaform:build',
          options: {
            handlers: [],
            outputFileName: 'index.mjs',
            outputChunkNames: 'lib/[name].mjs',
          },
          configurations: {
            test: {
              handlers: [
                {
                  name: 'a',
                  path: 'b',
                },
                {
                  name: 'c',
                  path: 'd',
                },
              ],
              minify: false,
            },
            staging: {
              handlers: [],
              minify: true,
            },
            production: {
              handlers: [],
              minify: true,
            },
          },
        },
        serve: {
          executor: 'lambdaform:serve',
          options: {},
        },
      },
    };
    (
      readProjectConfiguration as jest.MockedFunction<
        typeof readProjectConfiguration
      >
    ).mockImplementation((): ProjectConfiguration => projectConfiguration);
  });

  it('Should add the handler to the build options and configurations', () => {
    addHandlerToConfiguration({
      name,
      path,
      projectName,
      tree,
    });

    expect(updateProjectConfiguration).toHaveBeenCalledTimes(1);
    expect(updateProjectConfiguration).toHaveBeenCalledWith(tree, projectName, {
      root: 'apps/test-project',
      targets: {
        build: {
          executor: 'lambdaform:build',
          options: {
            handlers: [
              {
                name,
                path,
                assets: [],
                externalDependencies: 'none',
                excludeAwsSdk: true,
              },
            ],
            outputFileName: 'index.mjs',
            outputChunkNames: 'lib/[name].mjs',
          },
          configurations: {
            test: {
              handlers: [
                {
                  name: 'a',
                  path: 'b',
                },
                {
                  name: 'c',
                  path: 'd',
                },
                {
                  name,
                  path,
                  assets: [],
                  externalDependencies: 'none',
                  excludeAwsSdk: true,
                },
              ],
              minify: false,
            },
            staging: {
              handlers: [
                {
                  name,
                  path,
                  assets: [],
                  externalDependencies: 'none',
                  excludeAwsSdk: true,
                },
              ],
              minify: true,
            },
            production: {
              handlers: [
                {
                  name,
                  path,
                  assets: [],
                  externalDependencies: 'none',
                  excludeAwsSdk: true,
                },
              ],
              minify: true,
            },
          },
        },
        serve: {
          executor: 'lambdaform:serve',
          options: {},
        },
      },
    });
  });

  it('Should add the handler to the build options', () => {
    const projectConfiguration = readProjectConfiguration(tree, projectName);
    delete projectConfiguration.targets?.['build']?.configurations;

    addHandlerToConfiguration({
      name,
      path,
      projectName,
      tree,
    });

    expect(updateProjectConfiguration).toHaveBeenCalledTimes(1);
    expect(updateProjectConfiguration).toHaveBeenCalledWith(tree, projectName, {
      root: 'apps/test-project',
      targets: {
        build: {
          executor: 'lambdaform:build',
          options: {
            handlers: [
              {
                name,
                path,
                assets: [],
                externalDependencies: 'none',
                excludeAwsSdk: true,
              },
            ],
            outputFileName: 'index.mjs',
            outputChunkNames: 'lib/[name].mjs',
          },
        },
        serve: {
          executor: 'lambdaform:serve',
          options: {},
        },
      },
    });
  });

  it(`Should do nothing if the build target doesn't exist.`, () => {
    const projectConfiguration = readProjectConfiguration(tree, projectName);
    delete projectConfiguration.targets?.['build'];

    addHandlerToConfiguration({
      name,
      path,
      projectName,
      tree,
    });

    expect(updateProjectConfiguration).toHaveBeenCalledTimes(0);
  });
});
