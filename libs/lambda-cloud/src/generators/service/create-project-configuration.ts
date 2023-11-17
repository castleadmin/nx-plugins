import { joinPathFragments, ProjectConfiguration } from '@nx/devkit';
import { toTerraformName } from '../../utils/to-terraform-name';
import { ServiceGeneratorSchema } from './schema';

export const createProjectConfiguration = (
  projectRoot: string,
  options: ServiceGeneratorSchema
): ProjectConfiguration => {
  const serviceNameTf = toTerraformName(options.serviceName);
  const terraformDirectoryPath = joinPathFragments(projectRoot, 'terraform');
  const samConfigurationPath = joinPathFragments(projectRoot, 'samconfig.toml');
  const eventsDirectoryPath = joinPathFragments(projectRoot, 'events');
  const workspaceTest = `${serviceNameTf}_test`;
  const workspaceStaging = `${serviceNameTf}_staging`;
  const workspaceProduction = `${serviceNameTf}_production`;

  return {
    root: projectRoot,
    sourceRoot: joinPathFragments(projectRoot, 'src'),
    projectType: 'application',
    implicitDependencies: [],
    targets: {
      build: {
        executor: 'lambda-cloud:build',
        outputs: ['{options.outputPath}'],
        defaultConfiguration: 'test',
        options: {
          handlers: [],
          tsConfig: joinPathFragments(projectRoot, 'tsconfig.app.json'),
          format: 'module',
          packageJsonType: 'commonjs',
          outputPath: joinPathFragments('dist', projectRoot),
          entryFileNames: '[name].mjs',
          chunkFileNames: 'chunks/[name].mjs',
          sourceMap: 'hidden',
          treeshake: 'smallest',
          externalDependencies: 'none',
          excludeAwsSdk: true,
        },
        configurations: {
          test: {
            minify: false,
          },
          staging: {
            minify: true,
          },
          production: {
            minify: true,
          },
        },
      },
      serve: {
        executor: 'lambda-cloud:serve',
        options: {
          terraformDirectory: terraformDirectoryPath,
          samConfiguration: samConfigurationPath,
          api: false,
        },
        dependsOn: [
          {
            target: 'build',
            params: 'ignore',
          },
        ],
      },
      invoke: {
        executor: 'lambda-cloud:invoke',
        options: {
          terraformDirectory: terraformDirectoryPath,
          samConfiguration: samConfigurationPath,
        },
        dependsOn: [
          {
            target: 'build',
            params: 'ignore',
          },
        ],
      },
      event: {
        executor: 'lambda-cloud:event',
        options: {
          eventsDirectory: eventsDirectoryPath,
        },
      },
      fmt: {
        executor: 'lambda-cloud:format',
        options: {
          terraformDirectory: terraformDirectoryPath,
        },
      },
      'tf-init': {
        executor: 'lambda-cloud:init',
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
        executor: 'lambda-cloud:plan',
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
            target: 'build',
            params: 'ignore',
          },
          {
            target: 'tf-init',
            params: 'ignore',
          },
        ],
      },
      apply: {
        executor: 'lambda-cloud:apply',
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
        executor: 'lambda-cloud:plan',
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
            target: 'build',
            params: 'ignore',
          },
          {
            target: 'tf-init',
            params: 'ignore',
          },
        ],
      },
      'apply-all': {
        executor: 'lambda-cloud:apply',
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
        executor: 'lambda-cloud:destroy',
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
    tags: [`app:${options.serviceName}`, 'lambda-cloud:service'],
  };
};
