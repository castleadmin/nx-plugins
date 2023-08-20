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
        executor: 'lambdaform:build',
        outputs: ['{options.outputPath}'],
        defaultConfiguration: 'test',
        options: {
          handlers: [],
          tsConfig: joinPathFragments(projectRoot, 'tsconfig.app.json'),
          outputPath: joinPathFragments('dist', projectRoot),
          outputFileName: 'index.mjs',
          outputChunkNames: 'lib/[name].mjs',
          excludeZipRegExp: '\\.[cm]?js\\.map$',
          format: 'module',
          packageJsonType: 'commonjs',
          sourcemap: 'hidden',
          treeshake: 'smallest',
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
        executor: 'lambdaform:serve',
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
        executor: 'lambdaform:invoke',
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
        executor: 'lambdaform:event',
        options: {
          eventsDirectory: eventsDirectoryPath,
        },
      },
      'format-project': {
        executor: 'lambdaform:format',
        options: {
          terraformDirectory: terraformDirectoryPath,
        },
      },
      'init-project': {
        executor: 'lambdaform:init',
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
            target: 'init-project',
            params: 'ignore',
          },
        ],
      },
      apply: {
        executor: 'lambdaform:apply',
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
        executor: 'lambdaform:plan',
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
            target: 'init-project',
            params: 'ignore',
          },
        ],
      },
      'apply-all': {
        executor: 'lambdaform:apply',
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
        executor: 'lambdaform:destroy',
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
    tags: [`app:${options.serviceName}`, 'lambdaform:service'],
  };
};
