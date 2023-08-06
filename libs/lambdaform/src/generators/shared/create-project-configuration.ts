import { joinPathFragments, ProjectConfiguration } from '@nx/devkit';
import { SharedGeneratorSchema } from './schema';
import { toTerraformName } from '../../utils/to-terraform-name';

export const createProjectConfiguration = (
  projectRoot: string,
  options: SharedGeneratorSchema
): ProjectConfiguration => {
  const sharedResourcesNameTf = toTerraformName(options.sharedResourcesName);
  const terraformDirectoryPath = joinPathFragments(projectRoot, 'terraform');
  const workspaceTest = `${sharedResourcesNameTf}_test`;
  const workspaceStaging = `${sharedResourcesNameTf}_staging`;
  const workspaceProduction = `${sharedResourcesNameTf}_production`;

  return {
    root: projectRoot,
    sourceRoot: joinPathFragments(projectRoot, 'src'),
    projectType: 'application',
    targets: {
      'format-project': {
        executor: 'lambdaform:format',
        outputs: [],
        options: {
          terraformDirectory: terraformDirectoryPath,
        },
      },
      'init-project': {
        executor: 'lambdaform:init',
        outputs: [],
        defaultConfiguration: 'test',
        options: {
          createWorkspace: true,
          interactive: false,
          upgrade: false,
          terraformDirectory: terraformDirectoryPath,
        },
        configurations: {
          test: {
            workspace: workspaceTest,
          },
          staging: {
            workspace: workspaceStaging,
          },
          production: {
            workspace: workspaceProduction,
          },
        },
      },
      plan: {
        executor: 'lambdaform:plan',
        outputs: [],
        defaultConfiguration: 'test',
        options: {
          interactive: false,
          planOutput: 'tfplan',
          terraformDirectory: terraformDirectoryPath,
        },
        configurations: {
          test: {
            workspace: workspaceTest,
          },
          staging: {
            workspace: workspaceStaging,
          },
          production: {
            workspace: workspaceProduction,
          },
        },
        dependsOn: [
          {
            target: 'init-project',
            params: 'ignore',
          },
        ],
      },
      apply: {
        executor: 'lambdaform:apply',
        outputs: [],
        defaultConfiguration: 'test',
        options: {
          interactive: false,
          planOutput: 'tfplan',
          terraformDirectory: terraformDirectoryPath,
        },
        configurations: {
          test: {
            workspace: workspaceTest,
          },
          staging: {
            workspace: workspaceStaging,
          },
          production: {
            workspace: workspaceProduction,
          },
        },
      },
      'apply-all': {
        executor: 'lambdaform:apply',
        outputs: [],
        defaultConfiguration: 'test',
        options: {
          interactive: false,
          planOutput: 'tfplan',
          terraformDirectory: terraformDirectoryPath,
        },
        configurations: {
          test: {
            workspace: workspaceTest,
          },
          staging: {
            workspace: workspaceStaging,
          },
          production: {
            workspace: workspaceProduction,
          },
        },
        dependsOn: [
          {
            target: 'plan',
            params: 'ignore',
          },
          {
            projects: [],
            target: '^apply-all',
            params: 'ignore',
          },
        ],
      },
      destroy: {
        executor: 'lambdaform:destroy',
        outputs: [],
        defaultConfiguration: 'test',
        options: {
          interactive: false,
          terraformDirectory: terraformDirectoryPath,
        },
        configurations: {
          test: {
            workspace: workspaceTest,
          },
          staging: {
            workspace: workspaceStaging,
          },
          production: {
            workspace: workspaceProduction,
          },
        },
      },
    },
    tags: [`app:${options.sharedResourcesName}`, 'lambdaform:shared'],
  };
};
