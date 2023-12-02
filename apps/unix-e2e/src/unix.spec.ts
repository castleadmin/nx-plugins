import { mkdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path/posix';
import { executeCommand } from 'nx-serverless-cdk';

jest.setTimeout(15 * 60 * 1000); // 15 minutes

/**
 * Prerequisite: The test must be executed on a Unix system.
 */
describe('Unix', () => {
  describe('Given a monorepo for cdk applications,', () => {
    let nxServerlessCdkVersion: string;
    let devProfile: string;
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

      nxServerlessCdkVersion = process.env['NX_SERVERLESS_CDK_VERSION'];
      devProfile = process.env['E2E_DEV_PROFILE'];
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
        projectName = 'Generic&App';

        await executeCommand(
          `npx nx g nx-serverless-cdk:cdk-app '${projectName}' --type generic`,
          [],
          { cwd: workspaceRootResolved },
        );
      });

      test('should lint the application.', async () => {
        await executeCommand(`npx nx run '${projectName}':lint`, [], {
          cwd: workspaceRootResolved,
        });
      });

      test('should test the application with code coverage.', async () => {
        await executeCommand(
          `npx nx run '${projectName}':test --codeCoverage`,
          [],
          { cwd: workspaceRootResolved },
        );
      });

      test('should deploy the Dev stacks of the application.', async () => {
        await executeCommand(
          `npx nx run '${projectName}':cdk deploy 'Dev/*' --profile ${devProfile}`,
          [],
          { cwd: workspaceRootResolved },
        );
      });

      test('should run the E2E tests for the Dev environment successfully.', async () => {
        await executeCommand(
          `npx nx run '${projectName}'-e2e:e2e --codeCoverage`,
          [],
          { cwd: workspaceRootResolved },
        );
      });
    });
  });
});
