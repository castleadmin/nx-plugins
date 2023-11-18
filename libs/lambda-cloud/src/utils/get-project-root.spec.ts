import { faker } from '@faker-js/faker';
import { ExecutorContext } from '@nx/devkit';
import { getProjectRoot } from './get-project-root';

describe('getProjectRoot', () => {
  let context: ExecutorContext;
  let path: string;

  describe('Given an executor context and an application path,', () => {
    beforeEach(() => {
      const projectName = faker.word.sample();
      path = faker.system.filePath();

      context = {
        projectName,
        projectsConfigurations: {
          version: 1,
          projects: {
            [projectName]: {
              root: path,
            },
          },
        },
      } as ExecutorContext;
    });

    test('should retrieve the project root.', () => {
      expect(getProjectRoot(context)).toBe(path);
    });

    test("should throw an error, if the project name isn't defined.", () => {
      delete context.projectName;
      expect(() => getProjectRoot(context)).toThrow(Error);
    });

    test('should throw an error, if there is no project configurations array.', () => {
      delete context.projectsConfigurations;
      expect(() => getProjectRoot(context)).toThrow(Error);
    });

    test('should throw an error, if there is no project configuration for the project name.', () => {
      context.projectName = context.projectName + 'abc';
      expect(() => getProjectRoot(context)).toThrow(Error);
    });
  });
});
