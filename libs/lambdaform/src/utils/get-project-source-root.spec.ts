import { ExecutorContext, ProjectConfiguration } from '@nx/devkit';
import { faker } from '@faker-js/faker';
import { ProjectsConfigurations } from 'nx/src/config/workspace-json-project-json';
import { getProjectSourceRoot } from './get-project-source-root';

describe('getProjectSourceRoot', () => {
  let context: ExecutorContext;
  let projectName: string;
  let path: string;

  beforeEach(() => {
    projectName = faker.word.sample();
    path = faker.system.filePath();

    context = {
      projectName,
      projectsConfigurations: {
        version: 1,
        projects: {
          [projectName]: {
            sourceRoot: path,
          },
        },
      },
    } as ExecutorContext;
  });

  it('Should retrieve the project source root.', () => {
    expect(getProjectSourceRoot(context)).toBe(path);
  });

  it("Should throw an error if the project name isn't defined.", () => {
    delete context.projectName;
    expect(() => getProjectSourceRoot(context)).toThrow(Error);
  });

  it('Should throw an error if there is no project configurations array', () => {
    delete context.projectsConfigurations;
    expect(() => getProjectSourceRoot(context)).toThrow(Error);
  });

  it('Should throw an error if there is no project configuration for the project name.', () => {
    context.projectName = context.projectName + 'abc';
    expect(() => getProjectSourceRoot(context)).toThrow(Error);
  });

  it("Should throw an error if the project source root doesn't exist.", () => {
    delete (
      (context.projectsConfigurations as ProjectsConfigurations).projects[
        projectName
      ] as ProjectConfiguration
    ).sourceRoot;
    expect(() => getProjectSourceRoot(context)).toThrow(Error);
  });
});
