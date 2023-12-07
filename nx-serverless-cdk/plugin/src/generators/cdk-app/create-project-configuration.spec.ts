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
      });

      test('should set the root property.', () => {
        const configuration = createProjectConfiguration(
          options,
          projectOptions,
        );

        expect(configuration.root).toBe(projectOptions.projectRoot);
      });

      test('should set the sourceRoot property.', () => {
        const configuration = createProjectConfiguration(
          options,
          projectOptions,
        );

        expect(configuration.sourceRoot).toBe(
          `${projectOptions.projectRoot}/cdk`,
        );
      });

      test('should create a configuration of projectType application.', () => {
        const configuration = createProjectConfiguration(
          options,
          projectOptions,
        );

        expect(configuration.projectType).toBe(ProjectType.Application);
      });

      test('should create a configuration with a cdk target.', () => {
        const configuration = createProjectConfiguration(
          options,
          projectOptions,
        );

        expect(configuration.targets).toMatchObject({
          cdk: {
            executor: 'nx-serverless-cdk:cdk',
          },
          deploy: {
            executor: 'nx-serverless-cdk:cdk',
          },
          deployAll: {
            executor: 'nx-serverless-cdk:cdk',
            dependsOn: [
              {
                dependencies: true,
                params: 'forward',
                target: 'deployAll',
              },
            ],
          },
          destroy: {
            executor: 'nx-serverless-cdk:cdk',
          },
          diff: {
            executor: 'nx-serverless-cdk:cdk',
          },
          ls: {
            executor: 'nx-serverless-cdk:cdk',
          },
          synth: {
            executor: 'nx-serverless-cdk:cdk',
          },
          watch: {
            executor: 'nx-serverless-cdk:cdk',
          },
        });
      });

      test('should add a cdk-app tag.', () => {
        const configuration = createProjectConfiguration(
          options,
          projectOptions,
        );

        expect(configuration.tags).toEqual(['cdk-app']);
      });
    });

    describe('Given a cdk-app of type lambda,', () => {
      let options: CdkAppSchema;
      let projectOptions: NormalizedProjectOptionsApplication;

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
      });

      test('should set the root property.', () => {
        const configuration = createProjectConfiguration(
          options,
          projectOptions,
        );

        expect(configuration.root).toBe(projectOptions.projectRoot);
      });

      test('should set the sourceRoot property.', () => {
        const configuration = createProjectConfiguration(
          options,
          projectOptions,
        );

        expect(configuration.sourceRoot).toBe(
          `${projectOptions.projectRoot}/cdk`,
        );
      });

      test('should create a configuration of projectType application.', () => {
        const configuration = createProjectConfiguration(
          options,
          projectOptions,
        );

        expect(configuration.projectType).toBe(ProjectType.Application);
      });

      test('should create a configuration with a cdk target and all sam targets.', () => {
        const configuration = createProjectConfiguration(
          options,
          projectOptions,
        );

        expect(configuration.targets).toMatchObject({
          cdk: {
            executor: 'nx-serverless-cdk:cdk',
          },
          deploy: {
            executor: 'nx-serverless-cdk:cdk',
          },
          deployAll: {
            executor: 'nx-serverless-cdk:cdk',
            dependsOn: [
              {
                dependencies: true,
                params: 'forward',
                target: 'deployAll',
              },
            ],
          },
          destroy: {
            executor: 'nx-serverless-cdk:cdk',
          },
          diff: {
            executor: 'nx-serverless-cdk:cdk',
          },
          ls: {
            executor: 'nx-serverless-cdk:cdk',
          },
          synth: {
            executor: 'nx-serverless-cdk:cdk',
          },
          watch: {
            executor: 'nx-serverless-cdk:cdk',
          },
          'generate-event': {
            executor: 'nx-serverless-cdk:generate-event',
          },
          invoke: {
            executor: 'nx-serverless-cdk:invoke',
          },
          'start-api': {
            executor: 'nx-serverless-cdk:start-api',
          },
          'start-lambda': {
            executor: 'nx-serverless-cdk:start-lambda',
          },
        });
      });

      test('should add a cdk-app tag.', () => {
        const configuration = createProjectConfiguration(
          options,
          projectOptions,
        );

        expect(configuration.tags).toEqual(['cdk-app']);
      });
    });
  });
});
