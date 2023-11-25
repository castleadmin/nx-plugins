import { ProjectType } from '@nx/workspace';
import { createProjectConfiguration } from './create-project-configuration';

describe('create-project-configuration', () => {
  describe('createProjectConfiguration', () => {
    describe('Given a cdk-lib,', () => {
      let projectRoot: string;

      beforeEach(() => {
        projectRoot = 'apps/awesome';
      });

      test('should set the root property.', () => {
        const configuration = createProjectConfiguration(projectRoot);

        expect(configuration.root).toBe(projectRoot);
      });

      test('should set the sourceRoot property.', () => {
        const configuration = createProjectConfiguration(projectRoot);

        expect(configuration.sourceRoot).toBe(`${projectRoot}/cdk`);
      });

      test('should create a configuration of projectType library.', () => {
        const configuration = createProjectConfiguration(projectRoot);

        expect(configuration.projectType).toBe(ProjectType.Library);
      });

      test('should create a configuration with a cdk target.', () => {
        const configuration = createProjectConfiguration(projectRoot);

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

      test('should add a cdk-lib tag.', () => {
        const configuration = createProjectConfiguration(projectRoot);

        expect(configuration.tags).toEqual(['cdk-lib']);
      });
    });
  });
});
