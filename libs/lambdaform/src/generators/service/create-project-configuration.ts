import { joinPathFragments, ProjectConfiguration } from '@nx/devkit';
import { ServiceGeneratorSchema } from './schema';
import { toTerraformName } from '../../utils/to-terraform-name';

export const createProjectConfiguration = (
  projectRoot: string,
  options: ServiceGeneratorSchema
): ProjectConfiguration => {
  const serviceNameTf = toTerraformName(options.serviceName);

  return {
    root: projectRoot,
    sourceRoot: joinPathFragments(projectRoot, 'src'),
    projectType: 'application',
    targets: {
      build: {
        executor: 'lambdaform:build',
        outputs: ['{options.outputPath}'],
        defaultConfiguration: 'test',
        options: {
          handlers: [],
          tsConfig: `${projectRoot}/tsconfig.app.json`,
          outputPath: `dist/${projectRoot}`,
        },
      },
      'format-project': {
        executor: 'lambdaform:format',
        outputs: [],
        options: {
          terraformDirectory: `${projectRoot}/terraform`,
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
          terraformDirectory: `${projectRoot}/terraform`,
        },
        configurations: {
          test: {
            workspace: `${serviceNameTf}_test`,
          },
          staging: {
            workspace: `${serviceNameTf}_staging`,
          },
          production: {
            workspace: `${serviceNameTf}_production`,
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
          terraformDirectory: `${projectRoot}/terraform`,
        },
        configurations: {
          test: {
            workspace: `${serviceNameTf}_test`,
          },
          staging: {
            workspace: `${serviceNameTf}_staging`,
          },
          production: {
            workspace: `${serviceNameTf}_production`,
          },
        },
      },
      apply: {
        executor: 'lambdaform:apply',
        outputs: [],
        defaultConfiguration: 'test',
        options: {
          interactive: false,
          planOutput: 'tfplan',
          terraformDirectory: `${projectRoot}/terraform`,
        },
        configurations: {
          test: {
            workspace: `${serviceNameTf}_test`,
          },
          staging: {
            workspace: `${serviceNameTf}_staging`,
          },
          production: {
            workspace: `${serviceNameTf}_production`,
          },
        },
      },
      event: {
        executor: 'lambdaform:event',
        outputs: [],
        options: {},
      },
    },
    tags: [`app:${options.serviceName}`, 'lambdaform:service'],
  };
};
