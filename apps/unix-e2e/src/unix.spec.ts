import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path/posix';
import { executeCommand } from './execute-command';

jest.setTimeout(15 * 60 * 1000); // 15 minutes

/**
 * Prerequisite: The test must be executed on a Unix system.
 */
describe('Unix', () => {
  describe('Given a monorepo for cdk applications,', () => {
    let nxServerlessCdkVersion: string;
    let devProfile: string;
    let stageProfile: string;
    let prodProfile: string;
    let rootTemporaryResolved: string;
    let workspaceRootResolved: string;

    beforeAll(async () => {
      if (!process.env['NX_SERVERLESS_CDK_VERSION']) {
        throw new Error(
          `The 'NX_SERVERLESS_CDK_VERSION' environment variable isn't defined. Please set it via the '.env.e2e' file in the project directory.`,
        );
      }

      if (!process.env['CDK_DEV_REGION']) {
        throw new Error(
          `The 'CDK_DEV_REGION' environment variable isn't defined. Please set it via the '.env.e2e' file in the project directory.`,
        );
      }

      if (!process.env['E2E_DEV_PROFILE']) {
        throw new Error(
          `The 'E2E_DEV_PROFILE' environment variable isn't defined. Please set it via the '.env.e2e' file in the project directory.`,
        );
      }

      if (!process.env['E2E_DEV_REGION']) {
        throw new Error(
          `The 'E2E_DEV_REGION' environment variable isn't defined. Please set it via the '.env.e2e' file in the project directory.`,
        );
      }

      if (!process.env['CDK_STAGE_REGION']) {
        throw new Error(
          `The 'CDK_STAGE_REGION' environment variable isn't defined. Please set it via the '.env.e2e' file in the project directory.`,
        );
      }

      if (!process.env['E2E_STAGE_PROFILE']) {
        throw new Error(
          `The 'E2E_STAGE_PROFILE' environment variable isn't defined. Please set it via the '.env.e2e' file in the project directory.`,
        );
      }

      if (!process.env['E2E_STAGE_REGION']) {
        throw new Error(
          `The 'E2E_STAGE_REGION' environment variable isn't defined. Please set it via the '.env.e2e' file in the project directory.`,
        );
      }

      if (!process.env['CDK_PROD_REGION']) {
        throw new Error(
          `The 'CDK_PROD_REGION' environment variable isn't defined. Please set it via the '.env.e2e' file in the project directory.`,
        );
      }

      if (!process.env['E2E_PROD_PROFILE']) {
        throw new Error(
          `The 'E2E_PROD_PROFILE' environment variable isn't defined. Please set it via the '.env.e2e' file in the project directory.`,
        );
      }

      if (!process.env['E2E_PROD_REGION']) {
        throw new Error(
          `The 'E2E_PROD_REGION' environment variable isn't defined. Please set it via the '.env.e2e' file in the project directory.`,
        );
      }

      nxServerlessCdkVersion = process.env['NX_SERVERLESS_CDK_VERSION'];
      devProfile = process.env['E2E_DEV_PROFILE'];
      stageProfile = process.env['E2E_STAGE_PROFILE'];
      prodProfile = process.env['E2E_PROD_PROFILE'];
      rootTemporaryResolved = resolve('/tmp/nx-serverless-cdk');
      workspaceRootResolved = join(rootTemporaryResolved, 'workspace-e2e');
      await rm(workspaceRootResolved, {
        force: true,
        maxRetries: 3,
        recursive: true,
      });
      await mkdir(rootTemporaryResolved, { recursive: true });

      await executeCommand(
        'npx create-nx-workspace@latest --name "workspace-e2e" --preset "apps" --workspaceType "integrated" --no-nxCloud',
        [],
        { cwd: rootTemporaryResolved },
      );

      await executeCommand(
        `npm install --save-dev nx-serverless-cdk@${nxServerlessCdkVersion}`,
        [],
        { cwd: workspaceRootResolved },
      );
    });

    describe('and a generated generic CDK application without a given directory,', () => {
      let projectName: string;

      beforeAll(async () => {
        projectName = 'Generic.App~1-2_3';

        await executeCommand(
          `npx nx g nx-serverless-cdk:cdk-app '${projectName}' --type generic`,
          [],
          { cwd: workspaceRootResolved },
        );
      });

      test('should lint the application successfully.', async () => {
        await executeCommand(`npx nx run '${projectName}':lint`, [], {
          cwd: workspaceRootResolved,
        });
      });

      test('should test the application with code coverage successfully.', async () => {
        await executeCommand(
          `npx nx run '${projectName}':test --codeCoverage`,
          [],
          { cwd: workspaceRootResolved },
        );
      });

      describe('and deployed Dev stacks,', () => {
        beforeAll(async () => {
          await executeCommand(
            `npx nx run '${projectName}':cdk deploy 'Dev/*' --profile ${devProfile}`,
            [],
            { cwd: workspaceRootResolved },
          );
        });

        test('should run the E2E tests for the Dev environment successfully.', async () => {
          await executeCommand(
            `E2E_ENVIRONMENT=Dev npx nx run '${projectName}'-e2e:e2e --codeCoverage`,
            [],
            { cwd: workspaceRootResolved },
          );
        });
      });

      describe('and deployed Stage stacks,', () => {
        beforeAll(async () => {
          await executeCommand(
            `npx nx run '${projectName}':cdk deploy 'Stage/*' --profile ${stageProfile}`,
            [],
            { cwd: workspaceRootResolved },
          );
        });

        test('should run the E2E tests for the Stage environment successfully.', async () => {
          await executeCommand(
            `E2E_ENVIRONMENT=Stage npx nx run '${projectName}'-e2e:e2e --codeCoverage`,
            [],
            { cwd: workspaceRootResolved },
          );
        });
      });

      describe('and deployed Prod stacks,', () => {
        beforeAll(async () => {
          await executeCommand(
            `npx nx run '${projectName}':cdk deploy 'Prod/*' --profile ${prodProfile}`,
            [],
            { cwd: workspaceRootResolved },
          );
        });

        test('should run the E2E tests for the Prod environment successfully.', async () => {
          await executeCommand(
            `E2E_ENVIRONMENT=Prod npx nx run '${projectName}'-e2e:e2e --codeCoverage`,
            [],
            { cwd: workspaceRootResolved },
          );
        });
      });
    });

    describe('and a generated generic CDK application with a given directory,', () => {
      let projectName: string;

      beforeAll(async () => {
        projectName = 'dir-Generic.App~1-2_3';

        await executeCommand(
          `npx nx g nx-serverless-cdk:cdk-app '${projectName}' --type generic --directory 'generic/app'`,
          [],
          { cwd: workspaceRootResolved },
        );
      });

      test('should lint the application successfully.', async () => {
        await executeCommand(`npx nx run '${projectName}':lint`, [], {
          cwd: workspaceRootResolved,
        });
      });

      test('should test the application with code coverage successfully.', async () => {
        await executeCommand(
          `npx nx run '${projectName}':test --codeCoverage`,
          [],
          { cwd: workspaceRootResolved },
        );
      });

      describe('and deployed Dev stacks,', () => {
        beforeAll(async () => {
          await executeCommand(
            `npx nx run '${projectName}':cdk deploy 'Dev/*' --profile ${devProfile}`,
            [],
            { cwd: workspaceRootResolved },
          );
        });

        test('should run the E2E tests for the Dev environment successfully.', async () => {
          await executeCommand(
            `E2E_ENVIRONMENT=Dev npx nx run '${projectName}'-e2e:e2e --codeCoverage`,
            [],
            { cwd: workspaceRootResolved },
          );
        });
      });

      describe('and deployed Stage stacks,', () => {
        beforeAll(async () => {
          await executeCommand(
            `npx nx run '${projectName}':cdk deploy 'Stage/*' --profile ${stageProfile}`,
            [],
            { cwd: workspaceRootResolved },
          );
        });

        test('should run the E2E tests for the Stage environment successfully.', async () => {
          await executeCommand(
            `E2E_ENVIRONMENT=Stage npx nx run '${projectName}'-e2e:e2e --codeCoverage`,
            [],
            { cwd: workspaceRootResolved },
          );
        });
      });

      describe('and deployed Prod stacks,', () => {
        beforeAll(async () => {
          await executeCommand(
            `npx nx run '${projectName}':cdk deploy 'Prod/*' --profile ${prodProfile}`,
            [],
            { cwd: workspaceRootResolved },
          );
        });

        test('should run the E2E tests for the Prod environment successfully.', async () => {
          await executeCommand(
            `E2E_ENVIRONMENT=Prod npx nx run '${projectName}'-e2e:e2e --codeCoverage`,
            [],
            { cwd: workspaceRootResolved },
          );
        });
      });
    });

    describe('and a generated generic CDK application with a npm scope in its name,', () => {
      let projectName: string;

      beforeAll(async () => {
        projectName = '@org/ScopeGeneric.App~1-2_3';

        await executeCommand(
          `npx nx g nx-serverless-cdk:cdk-app '${projectName}' --type generic`,
          [],
          { cwd: workspaceRootResolved },
        );
      });

      test('should lint the application successfully.', async () => {
        await executeCommand(`npx nx run '${projectName}':lint`, [], {
          cwd: workspaceRootResolved,
        });
      });

      test('should test the application with code coverage successfully.', async () => {
        await executeCommand(
          `npx nx run '${projectName}':test --codeCoverage`,
          [],
          { cwd: workspaceRootResolved },
        );
      });

      describe('and deployed Dev stacks,', () => {
        beforeAll(async () => {
          await executeCommand(
            `npx nx run '${projectName}':cdk deploy 'Dev/*' --profile ${devProfile}`,
            [],
            { cwd: workspaceRootResolved },
          );
        });

        test('should run the E2E tests for the Dev environment successfully.', async () => {
          await executeCommand(
            `E2E_ENVIRONMENT=Dev npx nx run '${projectName}'-e2e:e2e --codeCoverage`,
            [],
            { cwd: workspaceRootResolved },
          );
        });
      });

      describe('and deployed Stage stacks,', () => {
        beforeAll(async () => {
          await executeCommand(
            `npx nx run '${projectName}':cdk deploy 'Stage/*' --profile ${stageProfile}`,
            [],
            { cwd: workspaceRootResolved },
          );
        });

        test('should run the E2E tests for the Stage environment successfully.', async () => {
          await executeCommand(
            `E2E_ENVIRONMENT=Stage npx nx run '${projectName}'-e2e:e2e --codeCoverage`,
            [],
            { cwd: workspaceRootResolved },
          );
        });
      });

      describe('and deployed Prod stacks,', () => {
        beforeAll(async () => {
          await executeCommand(
            `npx nx run '${projectName}':cdk deploy 'Prod/*' --profile ${prodProfile}`,
            [],
            { cwd: workspaceRootResolved },
          );
        });

        test('should run the E2E tests for the Prod environment successfully.', async () => {
          await executeCommand(
            `E2E_ENVIRONMENT=Prod npx nx run '${projectName}'-e2e:e2e --codeCoverage`,
            [],
            { cwd: workspaceRootResolved },
          );
        });
      });
    });

    describe('and a generated generic CDK application that uses a generated construct library,', () => {
      let projectName: string;
      let libName: string;

      beforeAll(async () => {
        projectName = 'Generic.App+Lib~1-2_3';
        libName = '@Test~123/ScopeGeneric.Lib~4-5_6';

        await executeCommand(
          `npx nx g nx-serverless-cdk:cdk-app '${projectName}' --type generic`,
          [],
          { cwd: workspaceRootResolved },
        );

        await executeCommand(
          `npx nx g nx-serverless-cdk:cdk-lib '${libName}' --publishable`,
          [],
          { cwd: workspaceRootResolved },
        );

        const exampleStackPathResolved = resolve(
          workspaceRootResolved,
          `${projectName}/cdk/example-stack.ts`,
        );
        const exampleStackFile = await readFile(exampleStackPathResolved, {
          encoding: 'utf-8',
        });
        const lines = exampleStackFile.split('\n');
        lines.pop();
        lines.pop();
        lines.pop();
        const extendedExampleStackFile =
          `import { ExampleConstruct } from '${libName}';
        ` +
          lines.join('\n') +
          `

            new ExampleConstruct(this, 'ExampleConstruct', {
              queueVisibilityTimeout: Duration.seconds(100),
            });
          }
        }
        `;
        await writeFile(exampleStackPathResolved, extendedExampleStackFile, {
          encoding: 'utf-8',
        });

        await executeCommand(`npx nx format`, [], {
          cwd: workspaceRootResolved,
        });
      });

      test('should lint the application successfully.', async () => {
        await executeCommand(`npx nx run '${projectName}':lint`, [], {
          cwd: workspaceRootResolved,
        });
      });

      test('should test the application with code coverage successfully.', async () => {
        await executeCommand(
          `npx nx run '${projectName}':test --codeCoverage`,
          [],
          { cwd: workspaceRootResolved },
        );
      });

      describe('and deployed Dev stacks,', () => {
        beforeAll(async () => {
          await executeCommand(
            `npx nx run '${projectName}':cdk deploy 'Dev/*' --profile ${devProfile}`,
            [],
            { cwd: workspaceRootResolved },
          );
        });

        test('should run the E2E tests for the Dev environment successfully.', async () => {
          await executeCommand(
            `E2E_ENVIRONMENT=Dev npx nx run '${projectName}'-e2e:e2e --codeCoverage`,
            [],
            { cwd: workspaceRootResolved },
          );
        });
      });

      describe('and deployed Stage stacks,', () => {
        beforeAll(async () => {
          await executeCommand(
            `npx nx run '${projectName}':cdk deploy 'Stage/*' --profile ${stageProfile}`,
            [],
            { cwd: workspaceRootResolved },
          );
        });

        test('should run the E2E tests for the Stage environment successfully.', async () => {
          await executeCommand(
            `E2E_ENVIRONMENT=Stage npx nx run '${projectName}'-e2e:e2e --codeCoverage`,
            [],
            { cwd: workspaceRootResolved },
          );
        });
      });

      describe('and deployed Prod stacks,', () => {
        beforeAll(async () => {
          await executeCommand(
            `npx nx run '${projectName}':cdk deploy 'Prod/*' --profile ${prodProfile}`,
            [],
            { cwd: workspaceRootResolved },
          );
        });

        test('should run the E2E tests for the Prod environment successfully.', async () => {
          await executeCommand(
            `E2E_ENVIRONMENT=Prod npx nx run '${projectName}'-e2e:e2e --codeCoverage`,
            [],
            { cwd: workspaceRootResolved },
          );
        });
      });
    });
  });
});
