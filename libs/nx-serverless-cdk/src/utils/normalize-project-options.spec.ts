import { readJson, Tree, workspaceRoot, writeJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { ProjectType } from '@nx/workspace';
import {
  normalizeProjectOptions,
  ProjectOptions,
  ProjectOptionsLibrary,
} from './normalize-project-options';

describe('normalize-project-options', () => {
  let tree: Tree;

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
  });

  describe('normalizeProjectOptions', () => {
    describe('Given an invalid name,', () => {
      let projectOptions: ProjectOptions;

      beforeEach(() => {
        projectOptions = {
          name: '123abc',
          directory: undefined,
          projectType: ProjectType.Application,
        };
      });

      test('should throw an error.', () => {
        expect(() => normalizeProjectOptions(tree, projectOptions)).toThrow(
          /^The provided project name '123abc' is invalid./,
        );
      });
    });

    describe('Given a CWD that is the workspace root,', () => {
      let projectOptions: ProjectOptions;

      beforeEach(() => {
        projectOptions = {
          name: 'AwesomeApp',
          directory: undefined,
          projectType: ProjectType.Application,
        };
        process.env['INIT_CWD'] = workspaceRoot;
      });

      test('should use the project name as path.', () => {
        const result = normalizeProjectOptions(tree, projectOptions);

        expect(result).toEqual({
          projectName: 'AwesomeApp',
          projectRoot: 'AwesomeApp',
          projectFileName: 'AwesomeApp',
        });
      });

      test('should use the defined directory path.', () => {
        projectOptions.directory = 'test/app';

        const result = normalizeProjectOptions(tree, projectOptions);

        expect(result).toEqual({
          projectName: 'AwesomeApp',
          projectRoot: 'test/app',
          projectFileName: 'AwesomeApp',
        });
      });

      test('should use the defined directory path with a trailing slash.', () => {
        projectOptions.directory = 'test/app/';

        const result = normalizeProjectOptions(tree, projectOptions);

        expect(result).toEqual({
          projectName: 'AwesomeApp',
          projectRoot: 'test/app',
          projectFileName: 'AwesomeApp',
        });
      });

      test('should use the defined directory path with a dot as first segment.', () => {
        projectOptions.directory = './test/app';

        const result = normalizeProjectOptions(tree, projectOptions);

        expect(result).toEqual({
          projectName: 'AwesomeApp',
          projectRoot: 'test/app',
          projectFileName: 'AwesomeApp',
        });
      });
    });

    describe('Given a CWD inside the workspace,', () => {
      let projectOptions: ProjectOptions;

      beforeEach(() => {
        projectOptions = {
          name: 'AwesomeApp',
          directory: undefined,
          projectType: ProjectType.Application,
        };
        process.env['INIT_CWD'] = `${workspaceRoot}/test`;
      });

      test('should use the directory path if it is equal to the CWD.', () => {
        projectOptions.directory = 'test';

        const result = normalizeProjectOptions(tree, projectOptions);

        expect(result).toEqual({
          projectName: 'AwesomeApp',
          projectRoot: 'test',
          projectFileName: 'AwesomeApp',
        });
      });

      test('should use the directory path if it includes the CWD.', () => {
        projectOptions.directory = 'test/app';

        const result = normalizeProjectOptions(tree, projectOptions);

        expect(result).toEqual({
          projectName: 'AwesomeApp',
          projectRoot: 'test/app',
          projectFileName: 'AwesomeApp',
        });
      });

      test('should append the directory path to the CWD if both are distinct.', () => {
        projectOptions.directory = 'projects/app';

        const result = normalizeProjectOptions(tree, projectOptions);

        expect(result).toEqual({
          projectName: 'AwesomeApp',
          projectRoot: 'test/projects/app',
          projectFileName: 'AwesomeApp',
        });
      });

      test("if the directory path isn't defined and the CWD doesn't end with the project name, then the project name should be appended to the CWD.", () => {
        const result = normalizeProjectOptions(tree, projectOptions);

        expect(result).toEqual({
          projectName: 'AwesomeApp',
          projectRoot: 'test/AwesomeApp',
          projectFileName: 'AwesomeApp',
        });
      });

      test("if the directory path isn't defined and the CWD does end with the project name, then the CWD should be used.", () => {
        process.env['INIT_CWD'] = `${workspaceRoot}/test/app/AwesomeApp`;

        const result = normalizeProjectOptions(tree, projectOptions);

        expect(result).toEqual({
          projectName: 'AwesomeApp',
          projectRoot: 'test/app/AwesomeApp',
          projectFileName: 'AwesomeApp',
        });
      });
    });

    describe('Given an INIT_CWD that is undefined,', () => {
      let projectOptions: ProjectOptions;

      beforeEach(() => {
        projectOptions = {
          name: 'AwesomeApp',
          directory: undefined,
          projectType: ProjectType.Application,
        };
        delete process.env['INIT_CWD'];
        jest.spyOn(process, 'cwd').mockImplementation(() => workspaceRoot);
      });

      test('should use the project name as path from the process.cwd() directory.', () => {
        const result = normalizeProjectOptions(tree, projectOptions);

        expect(result).toEqual({
          projectName: 'AwesomeApp',
          projectRoot: 'AwesomeApp',
          projectFileName: 'AwesomeApp',
        });
      });
    });

    describe('Given an INIT_CWD that is outside the workspace,', () => {
      let projectOptions: ProjectOptions;

      beforeEach(() => {
        projectOptions = {
          name: 'AwesomeApp',
          directory: undefined,
          projectType: ProjectType.Application,
        };
        process.env['INIT_CWD'] = '/dev/null';
        jest.spyOn(process, 'cwd').mockImplementation(() => workspaceRoot);
      });

      test('should use the project name as path from the process.cwd() directory.', () => {
        const result = normalizeProjectOptions(tree, projectOptions);

        expect(result).toEqual({
          projectName: 'AwesomeApp',
          projectRoot: 'AwesomeApp',
          projectFileName: 'AwesomeApp',
        });
      });
    });

    describe('Given a project name that contains a npm scope,', () => {
      let projectOptions: ProjectOptions;

      beforeEach(() => {
        projectOptions = {
          name: '@org/awesome',
          directory: undefined,
          projectType: ProjectType.Library,
          importPath: undefined,
        };
        process.env['INIT_CWD'] = workspaceRoot;
      });

      test('the scope should be removed from the project file name.', () => {
        projectOptions.projectType = ProjectType.Application;

        const result = normalizeProjectOptions(tree, projectOptions);

        expect(result).toEqual({
          projectName: '@org/awesome',
          projectRoot: '@org/awesome',
          projectFileName: 'awesome',
        });
      });

      test("should throw an error, if the project name isn't a valid npm package name.", () => {
        projectOptions.projectType = ProjectType.Application;
        projectOptions.name = '@org-awesome';

        expect(() => normalizeProjectOptions(tree, projectOptions)).toThrow(
          /^The provided project name '@org-awesome' is invalid./,
        );
      });

      test('should use the given import path as package name.', () => {
        (projectOptions as ProjectOptionsLibrary).importPath = 'awesome-app';

        const result = normalizeProjectOptions(tree, projectOptions);

        expect(result).toEqual({
          projectName: '@org/awesome',
          projectRoot: '@org/awesome',
          projectFileName: 'awesome',
          importPath: 'awesome-app',
        });
      });

      test('should use the project name as package name if no import path has been defined.', () => {
        const result = normalizeProjectOptions(tree, projectOptions);

        expect(result).toEqual({
          projectName: '@org/awesome',
          projectRoot: '@org/awesome',
          projectFileName: 'awesome',
          importPath: '@org/awesome',
        });
      });
    });

    describe("Given a project name that doesn't contain a npm scope,", () => {
      let projectOptions: ProjectOptionsLibrary;

      beforeEach(() => {
        projectOptions = {
          name: 'awesomeLib',
          directory: undefined,
          projectType: ProjectType.Library,
          importPath: undefined,
        };
        process.env['INIT_CWD'] = workspaceRoot;
      });

      test('should use the given import path as package name.', () => {
        projectOptions.importPath = 'easy-app';

        const result = normalizeProjectOptions(tree, projectOptions);

        expect(result).toEqual({
          projectName: 'awesomeLib',
          projectRoot: 'awesomeLib',
          projectFileName: 'awesomeLib',
          importPath: 'easy-app',
        });
      });

      test('should append the project name to the workspace package json scope and use the result as package name.', () => {
        const workspacePackageJson = readJson(tree, 'package.json');
        workspacePackageJson.name = '@test/source';
        writeJson(tree, 'package.json', workspacePackageJson);

        const result = normalizeProjectOptions(tree, projectOptions);

        expect(result).toEqual({
          projectName: 'awesomeLib',
          projectRoot: 'awesomeLib',
          projectFileName: 'awesomeLib',
          importPath: '@test/awesomeLib',
        });
      });

      test("should use the project name as package name, if the workspace package json scope isn't defined.", () => {
        const workspacePackageJson = readJson(tree, 'package.json');
        workspacePackageJson.name = 'test-source';
        writeJson(tree, 'package.json', workspacePackageJson);

        const result = normalizeProjectOptions(tree, projectOptions);

        expect(result).toEqual({
          projectName: 'awesomeLib',
          projectRoot: 'awesomeLib',
          projectFileName: 'awesomeLib',
          importPath: 'awesomeLib',
        });
      });

      test("should use the project name as package name, if the workspace package json name isn't defined.", () => {
        const workspacePackageJson = readJson(tree, 'package.json');
        delete workspacePackageJson.name;
        writeJson(tree, 'package.json', workspacePackageJson);

        const result = normalizeProjectOptions(tree, projectOptions);

        expect(result).toEqual({
          projectName: 'awesomeLib',
          projectRoot: 'awesomeLib',
          projectFileName: 'awesomeLib',
          importPath: 'awesomeLib',
        });
      });

      test("should use the project name as package name, if the workspace package json doesn't exist.", () => {
        tree.delete('package.json');

        const result = normalizeProjectOptions(tree, projectOptions);

        expect(result).toEqual({
          projectName: 'awesomeLib',
          projectRoot: 'awesomeLib',
          projectFileName: 'awesomeLib',
          importPath: 'awesomeLib',
        });
      });
    });
  });
});
