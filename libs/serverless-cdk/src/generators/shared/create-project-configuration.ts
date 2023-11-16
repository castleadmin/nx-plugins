import { joinPathFragments, ProjectConfiguration } from '@nx/devkit';
import { toTerraformName } from '../../utils/to-terraform-name';
import { SharedGeneratorSchema } from './schema';

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
    implicitDependencies: [],
    targets: {
      fmt: {
        executor: 'serverless-cdk:format',
        options: {
          terraformDirectory: terraformDirectoryPath,
        },
      },
      'tf-init': {
        executor: 'serverless-cdk:init',
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
        executor: 'serverless-cdk:plan',
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
            target: 'tf-init',
            params: 'ignore',
          },
        ],
      },
      apply: {
        executor: 'serverless-cdk:apply',
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
      'plan-all': {
        executor: 'serverless-cdk:plan',
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
            dependencies: true,
            target: 'apply-all',
            params: 'ignore',
          },
          {
            target: 'tf-init',
            params: 'ignore',
          },
        ],
      },
      'apply-all': {
        executor: 'serverless-cdk:apply',
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
            dependencies: true,
            target: 'apply-all',
            params: 'ignore',
          },
          {
            target: 'plan-all',
            params: 'ignore',
          },
        ],
      },
      destroy: {
        executor: 'serverless-cdk:destroy',
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
    tags: [`app:${options.sharedResourcesName}`, 'serverless-cdk:shared'],
  };
};
