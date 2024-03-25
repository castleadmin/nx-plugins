import { faker } from '@faker-js/faker';
import { ProjectType } from '@nx/workspace';
import { NormalizedProjectOptionsApplication } from '../../utils/normalize-project-options';
import { AppType } from './app-type';
import {
  createProjectConfiguration,
  createTargets,
  CustomTargetNames,
} from './create-project-configuration';
import { CdkAppSchema } from './schema';

describe('create-project-configuration', () => {
  describe('createTargets', () => {
    describe('Given a cdk-app of type lambda that uses custom target names,', () => {
      let defaultEnvironment: string;
      let environments: string[];
      let type: AppType;
      let customTargetNames: CustomTargetNames;

      beforeEach(() => {
        defaultEnvironment = 'Dev';
        environments = ['Dev', 'Stage', 'Prod'];
        type = AppType.lambda;
        customTargetNames = {
          cdkTargetName: 'sls-cdk',
          deployTargetName: 'sls-deploy',
          deployAllTargetName: 'sls-deploy-all',
          destroyTargetName: 'sls-destroy',
          diffTargetName: 'sls-diff',
          lsTargetName: 'sls-ls',
          synthTargetName: 'sls-synth',
          watchTargetName: 'sls-watch',
          generateEventTargetName: 'sls-generate-event',
          invokeTargetName: 'sls-invoke',
          startApiTargetName: 'sls-start-api',
          startLambdaTargetName: 'sls-start-lambda',
        };
      });

      test('should create targets with custom names.', () => {
        const targets = createTargets({
          defaultEnvironment,
          environments,
          type,
          customTargetNames,
        });

        expect(targets).toMatchObject({
          'sls-cdk': {
            executor: 'nx-serverless-cdk:cdk',
            options: {},
          },
          'sls-deploy': {
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
          'sls-deploy-all': {
            executor: 'nx-serverless-cdk:cdk',
            dependsOn: [
              {
                dependencies: true,
                params: 'forward',
                target: 'sls-deploy-all',
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
          'sls-destroy': {
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
          'sls-diff': {
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
          'sls-ls': {
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
          'sls-synth': {
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
          'sls-watch': {
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
          'sls-generate-event': {
            executor: 'nx-serverless-cdk:generate-event',
            options: {},
          },
          'sls-invoke': {
            executor: 'nx-serverless-cdk:invoke',
            options: {},
          },
          'sls-start-api': {
            executor: 'nx-serverless-cdk:start-api',
            options: {},
          },
          'sls-start-lambda': {
            executor: 'nx-serverless-cdk:start-lambda',
            options: {},
          },
        });
      });
    });
  });

  describe('createProjectConfiguration', () => {
    describe('Given a cdk-app of type generic that uses inference plugins,', () => {
      let projectRoot: string;
      let options: CdkAppSchema;
      let projectOptions: NormalizedProjectOptionsApplication;
      let useInferencePlugins: boolean;

      beforeEach(() => {
        useInferencePlugins = true;
        const projectName = faker.word.sample().toUpperCase();
        projectRoot = `apps/${projectName}`;
        options = {
          name: projectName,
          directory: `apps/${projectName}`,
          type: AppType.generic,
          defaultEnvironment: 'Dev',
          environments: ['Dev', 'Stage', 'Prod'],
          skipFormat: true,
        };
        projectOptions = {
          projectName,
          projectRoot,
          projectFileName: projectName,
        };
      });

      test('should create a project configuration.', () => {
        const configuration = createProjectConfiguration({
          options,
          projectOptions,
          useInferencePlugins,
        });

        expect(configuration).toMatchObject({
          root: projectRoot,
          sourceRoot: `${projectRoot}/cdk`,
          projectType: ProjectType.Application,
          implicitDependencies: [],
          tags: ['cdk-app'],
          targets: {},
        });
      });
    });

    describe("Given a cdk-app of type generic that doesn't use inference plugins,", () => {
      let projectRoot: string;
      let options: CdkAppSchema;
      let projectOptions: NormalizedProjectOptionsApplication;
      let useInferencePlugins: boolean;

      beforeEach(() => {
        useInferencePlugins = false;
        const projectName = faker.word.sample().toUpperCase();
        projectRoot = `apps/${projectName}`;
        options = {
          name: projectName,
          directory: `apps/${projectName}`,
          type: AppType.generic,
          defaultEnvironment: 'Dev',
          environments: ['Dev', 'Stage', 'Prod'],
          skipFormat: true,
        };
        projectOptions = {
          projectName,
          projectRoot,
          projectFileName: projectName,
        };
      });

      test('should create a project configuration.', () => {
        const configuration = createProjectConfiguration({
          options,
          projectOptions,
          useInferencePlugins,
        });

        expect(configuration).toMatchObject({
          root: projectRoot,
          sourceRoot: `${projectRoot}/cdk`,
          projectType: ProjectType.Application,
          implicitDependencies: [],
          tags: ['cdk-app'],
          targets: {
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
          },
        });
      });
    });

    describe('Given a cdk-app of type lambda that uses inference plugins,', () => {
      let projectRoot: string;
      let options: CdkAppSchema;
      let projectOptions: NormalizedProjectOptionsApplication;
      let useInferencePlugins: boolean;

      beforeEach(() => {
        useInferencePlugins = true;
        const projectName = faker.word.sample().toUpperCase();
        projectRoot = `apps/${projectName}`;
        options = {
          name: projectName,
          directory: `apps/${projectName}`,
          type: AppType.lambda,
          defaultEnvironment: 'Dev',
          environments: ['Dev', 'Stage', 'Prod'],
          skipFormat: true,
        };
        projectOptions = {
          projectName,
          projectRoot,
          projectFileName: projectName,
        };
      });

      test('should create a project configuration.', () => {
        const configuration = createProjectConfiguration({
          options,
          projectOptions,
          useInferencePlugins,
        });

        expect(configuration).toMatchObject({
          root: projectRoot,
          sourceRoot: `${projectRoot}/cdk`,
          projectType: ProjectType.Application,
          implicitDependencies: [],
          tags: ['cdk-app'],
          targets: {},
        });
      });
    });

    describe("Given a cdk-app of type lambda that doesn't use inference plugins,", () => {
      let projectRoot: string;
      let options: CdkAppSchema;
      let projectOptions: NormalizedProjectOptionsApplication;
      let useInferencePlugins: boolean;

      beforeEach(() => {
        useInferencePlugins = false;
        const projectName = faker.word.sample().toUpperCase();
        projectRoot = `apps/${projectName}`;
        options = {
          name: projectName,
          directory: `apps/${projectName}`,
          type: AppType.lambda,
          defaultEnvironment: 'Dev',
          environments: ['Dev', 'Stage', 'Prod'],
          skipFormat: true,
        };
        projectOptions = {
          projectName,
          projectRoot,
          projectFileName: projectName,
        };
      });

      test('should create a project configuration.', () => {
        const configuration = createProjectConfiguration({
          options,
          projectOptions,
          useInferencePlugins,
        });

        expect(configuration).toMatchObject({
          root: projectRoot,
          sourceRoot: `${projectRoot}/cdk`,
          projectType: ProjectType.Application,
          implicitDependencies: [],
          tags: ['cdk-app'],
          targets: {
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
          },
        });
      });
    });
  });
});
