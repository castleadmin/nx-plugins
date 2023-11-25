import { ProjectType } from '@nx/workspace';
import { AppType } from './app-type';
import { createProjectConfiguration } from './create-project-configuration';
import { CdkAppSchema } from './schema';

describe('create-project-configuration', () => {
  describe('createProjectConfiguration', () => {
    describe('Given a cdk-app of type generic,', () => {
      let projectRoot: string;
      let options: CdkAppSchema;

      beforeEach(() => {
        projectRoot = 'apps/awesome';
        options = { appName: 'awesome', appType: AppType.generic };
      });

      test('should set the root property.', () => {
        const configuration = createProjectConfiguration(projectRoot, options);

        expect(configuration.root).toBe(projectRoot);
      });

      test('should set the sourceRoot property.', () => {
        const configuration = createProjectConfiguration(projectRoot, options);

        expect(configuration.sourceRoot).toBe(`${projectRoot}/cdk`);
      });

      test('should create a configuration of projectType application.', () => {
        const configuration = createProjectConfiguration(projectRoot, options);

        expect(configuration.projectType).toBe(ProjectType.Application);
      });

      test('should create a configuration with a cdk target.', () => {
        const configuration = createProjectConfiguration(projectRoot, options);

        expect(configuration.targets).toEqual({
          cdk: {
            executor: 'nx-serverless-cdk:cdk',
            options: {},
          },
          'cdk-ci': {
            executor: 'nx-serverless-cdk:cdk',
            options: {},
            dependsOn: [
              {
                dependencies: true,
                target: 'cdk-ci',
                params: 'forward',
              },
            ],
          },
        });
      });

      test('should add a cdk-app tag.', () => {
        const configuration = createProjectConfiguration(projectRoot, options);

        expect(configuration.tags).toEqual(['cdk-app']);
      });
    });

    describe('Given a cdk-app of type lambda,', () => {
      let projectRoot: string;
      let options: CdkAppSchema;

      beforeEach(() => {
        projectRoot = 'apps/awesome';
        options = { appName: 'awesome', appType: AppType.lambda };
      });

      test('should set the root property.', () => {
        const configuration = createProjectConfiguration(projectRoot, options);

        expect(configuration.root).toBe(projectRoot);
      });

      test('should set the sourceRoot property.', () => {
        const configuration = createProjectConfiguration(projectRoot, options);

        expect(configuration.sourceRoot).toBe(`${projectRoot}/cdk`);
      });

      test('should create a configuration of projectType application.', () => {
        const configuration = createProjectConfiguration(projectRoot, options);

        expect(configuration.projectType).toBe(ProjectType.Application);
      });

      test('should create a configuration with a cdk target and all sam targets.', () => {
        const configuration = createProjectConfiguration(projectRoot, options);

        expect(configuration.targets).toEqual({
          cdk: {
            executor: 'nx-serverless-cdk:cdk',
            options: {},
          },
          'cdk-ci': {
            executor: 'nx-serverless-cdk:cdk',
            options: {},
            dependsOn: [
              {
                dependencies: true,
                target: 'cdk-ci',
                params: 'forward',
              },
            ],
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
        const configuration = createProjectConfiguration(projectRoot, options);

        expect(configuration.tags).toEqual(['cdk-app']);
      });
    });
  });
});
