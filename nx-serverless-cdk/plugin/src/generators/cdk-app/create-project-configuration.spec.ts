import { faker } from '@faker-js/faker';
import { ProjectType } from '@nx/workspace';
import { NormalizedProjectOptionsApplication } from '../../utils/normalize-project-options';
import { AppType } from './app-type';
import { createProjectConfiguration } from './create-project-configuration';
import { CdkAppSchema } from './schema';

describe('create-project-configuration', () => {
  describe('createProjectConfiguration', () => {
    describe('Given a cdk-app of type generic,', () => {
      let options: CdkAppSchema;
      let projectOptions: NormalizedProjectOptionsApplication;
      let defaultEnvironment: string;
      let environments: string[];

      beforeEach(() => {
        const projectName = faker.word.sample().toUpperCase();
        const projectRoot = `apps/${projectName}`;
        options = {
          name: projectName,
          directory: `apps/${projectName}`,
          type: AppType.generic,
          skipFormat: true,
        };
        projectOptions = {
          projectName,
          projectRoot,
          projectFileName: projectName,
        };
        defaultEnvironment = 'Dev';
        environments = ['Dev', 'Stage', 'Prod'];
      });

      test('should set the root property.', () => {
        const configuration = createProjectConfiguration(
          options,
          projectOptions,
          defaultEnvironment,
          environments,
        );

        expect(configuration.root).toBe(projectOptions.projectRoot);
      });

      test('should set the sourceRoot property.', () => {
        const configuration = createProjectConfiguration(
          options,
          projectOptions,
          defaultEnvironment,
          environments,
        );

        expect(configuration.sourceRoot).toBe(
          `${projectOptions.projectRoot}/cdk`,
        );
      });

      test('should create a configuration of projectType application.', () => {
        const configuration = createProjectConfiguration(
          options,
          projectOptions,
          defaultEnvironment,
          environments,
        );

        expect(configuration.projectType).toBe(ProjectType.Application);
      });

      test('should create a configuration with a cdk target.', () => {
        const configuration = createProjectConfiguration(
          options,
          projectOptions,
          defaultEnvironment,
          environments,
        );

        expect(configuration.targets).toMatchObject({
          cdk: {
            executor: 'nx-serverless-cdk:cdk',
            options: {},
          },
          deploy: {
            executor: 'nx-serverless-cdk:cdk',
            defaultConfiguration: 'Dev',
            options: {
              predefinedArguments: ['deploy'],
            },
            configurations: {
              Dev: {
                predefinedArguments: ['deploy', 'Dev/*'],
              },
              Stage: {
                predefinedArguments: ['deploy', 'Stage/*'],
              },
              Prod: {
                predefinedArguments: ['deploy', 'Prod/*'],
              },
            },
          },
          'deploy-all': {
            executor: 'nx-serverless-cdk:cdk',
            dependsOn: [
              {
                dependencies: true,
                params: 'forward',
                target: 'deploy-all',
              },
            ],
            defaultConfiguration: 'Dev',
            options: {
              predefinedArguments: ['deploy'],
            },
            configurations: {
              Dev: {
                predefinedArguments: ['deploy', 'Dev/*'],
              },
              Stage: {
                predefinedArguments: ['deploy', 'Stage/*'],
              },
              Prod: {
                predefinedArguments: ['deploy', 'Prod/*'],
              },
            },
          },
          destroy: {
            executor: 'nx-serverless-cdk:cdk',
            defaultConfiguration: 'Dev',
            options: {
              predefinedArguments: ['destroy', '--force'],
            },
            configurations: {
              Dev: {
                predefinedArguments: ['destroy', 'Dev/*', '--force'],
              },
              Stage: {
                predefinedArguments: ['destroy', 'Stage/*', '--force'],
              },
              Prod: {
                predefinedArguments: ['destroy', 'Prod/*', '--force'],
              },
            },
          },
          diff: {
            executor: 'nx-serverless-cdk:cdk',
            defaultConfiguration: 'Dev',
            options: {
              predefinedArguments: ['diff'],
            },
            configurations: {
              Dev: {
                predefinedArguments: ['diff', 'Dev/*'],
              },
              Stage: {
                predefinedArguments: ['diff', 'Stage/*'],
              },
              Prod: {
                predefinedArguments: ['diff', 'Prod/*'],
              },
            },
          },
          ls: {
            executor: 'nx-serverless-cdk:cdk',
            defaultConfiguration: 'Dev',
            options: {
              predefinedArguments: ['ls'],
            },
            configurations: {
              Dev: {
                predefinedArguments: ['ls', 'Dev/*'],
              },
              Stage: {
                predefinedArguments: ['ls', 'Stage/*'],
              },
              Prod: {
                predefinedArguments: ['ls', 'Prod/*'],
              },
            },
          },
          synth: {
            executor: 'nx-serverless-cdk:cdk',
            defaultConfiguration: 'Dev',
            options: {
              predefinedArguments: ['synth'],
            },
            configurations: {
              Dev: {
                predefinedArguments: ['synth', 'Dev/*'],
              },
              Stage: {
                predefinedArguments: ['synth', 'Stage/*'],
              },
              Prod: {
                predefinedArguments: ['synth', 'Prod/*'],
              },
            },
          },
          watch: {
            executor: 'nx-serverless-cdk:cdk',
            defaultConfiguration: 'Dev',
            options: {
              predefinedArguments: ['watch'],
            },
            configurations: {
              Dev: {
                predefinedArguments: ['watch', 'Dev/*'],
              },
              Stage: {
                predefinedArguments: ['watch', 'Stage/*'],
              },
              Prod: {
                predefinedArguments: ['watch', 'Prod/*'],
              },
            },
          },
        });
      });

      test('should add a cdk-app tag.', () => {
        const configuration = createProjectConfiguration(
          options,
          projectOptions,
          defaultEnvironment,
          environments,
        );

        expect(configuration.tags).toEqual(['cdk-app']);
      });
    });

    describe('Given a cdk-app of type lambda,', () => {
      let options: CdkAppSchema;
      let projectOptions: NormalizedProjectOptionsApplication;
      let defaultEnvironment: string;
      let environments: string[];

      beforeEach(() => {
        const projectName = faker.word.sample().toUpperCase();
        const projectRoot = `apps/${projectName}`;
        options = {
          name: projectName,
          directory: `apps/${projectName}`,
          type: AppType.lambda,
          skipFormat: true,
        };
        projectOptions = {
          projectName,
          projectRoot,
          projectFileName: projectName,
        };
        defaultEnvironment = 'Dev';
        environments = ['Dev', 'Stage', 'Prod'];
      });

      test('should set the root property.', () => {
        const configuration = createProjectConfiguration(
          options,
          projectOptions,
          defaultEnvironment,
          environments,
        );

        expect(configuration.root).toBe(projectOptions.projectRoot);
      });

      test('should set the sourceRoot property.', () => {
        const configuration = createProjectConfiguration(
          options,
          projectOptions,
          defaultEnvironment,
          environments,
        );

        expect(configuration.sourceRoot).toBe(
          `${projectOptions.projectRoot}/cdk`,
        );
      });

      test('should create a configuration of projectType application.', () => {
        const configuration = createProjectConfiguration(
          options,
          projectOptions,
          defaultEnvironment,
          environments,
        );

        expect(configuration.projectType).toBe(ProjectType.Application);
      });

      test('should create a configuration with a cdk target and all sam targets.', () => {
        const configuration = createProjectConfiguration(
          options,
          projectOptions,
          defaultEnvironment,
          environments,
        );

        expect(configuration.targets).toMatchObject({
          cdk: {
            executor: 'nx-serverless-cdk:cdk',
            options: {},
          },
          deploy: {
            executor: 'nx-serverless-cdk:cdk',
            defaultConfiguration: 'Dev',
            options: {
              predefinedArguments: ['deploy'],
            },
            configurations: {
              Dev: {
                predefinedArguments: ['deploy', 'Dev/*'],
              },
              Stage: {
                predefinedArguments: ['deploy', 'Stage/*'],
              },
              Prod: {
                predefinedArguments: ['deploy', 'Prod/*'],
              },
            },
          },
          'deploy-all': {
            executor: 'nx-serverless-cdk:cdk',
            dependsOn: [
              {
                dependencies: true,
                params: 'forward',
                target: 'deploy-all',
              },
            ],
            defaultConfiguration: 'Dev',
            options: {
              predefinedArguments: ['deploy'],
            },
            configurations: {
              Dev: {
                predefinedArguments: ['deploy', 'Dev/*'],
              },
              Stage: {
                predefinedArguments: ['deploy', 'Stage/*'],
              },
              Prod: {
                predefinedArguments: ['deploy', 'Prod/*'],
              },
            },
          },
          destroy: {
            executor: 'nx-serverless-cdk:cdk',
            defaultConfiguration: 'Dev',
            options: {
              predefinedArguments: ['destroy', '--force'],
            },
            configurations: {
              Dev: {
                predefinedArguments: ['destroy', 'Dev/*', '--force'],
              },
              Stage: {
                predefinedArguments: ['destroy', 'Stage/*', '--force'],
              },
              Prod: {
                predefinedArguments: ['destroy', 'Prod/*', '--force'],
              },
            },
          },
          diff: {
            executor: 'nx-serverless-cdk:cdk',
            defaultConfiguration: 'Dev',
            options: {
              predefinedArguments: ['diff'],
            },
            configurations: {
              Dev: {
                predefinedArguments: ['diff', 'Dev/*'],
              },
              Stage: {
                predefinedArguments: ['diff', 'Stage/*'],
              },
              Prod: {
                predefinedArguments: ['diff', 'Prod/*'],
              },
            },
          },
          ls: {
            executor: 'nx-serverless-cdk:cdk',
            defaultConfiguration: 'Dev',
            options: {
              predefinedArguments: ['ls'],
            },
            configurations: {
              Dev: {
                predefinedArguments: ['ls', 'Dev/*'],
              },
              Stage: {
                predefinedArguments: ['ls', 'Stage/*'],
              },
              Prod: {
                predefinedArguments: ['ls', 'Prod/*'],
              },
            },
          },
          synth: {
            executor: 'nx-serverless-cdk:cdk',
            defaultConfiguration: 'Dev',
            options: {
              predefinedArguments: ['synth'],
            },
            configurations: {
              Dev: {
                predefinedArguments: ['synth', 'Dev/*'],
              },
              Stage: {
                predefinedArguments: ['synth', 'Stage/*'],
              },
              Prod: {
                predefinedArguments: ['synth', 'Prod/*'],
              },
            },
          },
          watch: {
            executor: 'nx-serverless-cdk:cdk',
            defaultConfiguration: 'Dev',
            options: {
              predefinedArguments: ['watch'],
            },
            configurations: {
              Dev: {
                predefinedArguments: ['watch', 'Dev/*'],
              },
              Stage: {
                predefinedArguments: ['watch', 'Stage/*'],
              },
              Prod: {
                predefinedArguments: ['watch', 'Prod/*'],
              },
            },
          },
          'generate-event': {
            executor: 'nx-serverless-cdk:generate-event',
            options: {},
          },
          invoke: {
            executor: 'nx-serverless-cdk:invoke',
            options: {},
          },
          'start-api': {
            executor: 'nx-serverless-cdk:start-api',
            options: {},
          },
          'start-lambda': {
            executor: 'nx-serverless-cdk:start-lambda',
            options: {},
          },
        });
      });

      test('should add a cdk-app tag.', () => {
        const configuration = createProjectConfiguration(
          options,
          projectOptions,
          defaultEnvironment,
          environments,
        );

        expect(configuration.tags).toEqual(['cdk-app']);
      });
    });
  });
});
