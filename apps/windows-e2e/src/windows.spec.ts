import { mkdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path/win32';
import { executeCommand } from 'nx-serverless-cdk';

jest.setTimeout(15 * 60 * 1000); // 15 minutes

/**
 * Prerequisite: The test must be executed on Windows.
 */
describe('Windows', () => {
  describe('Given a monorepo for cdk applications,', () => {
    let nxServerlessCdkVersion: string;
    let rootTemporaryResolved: string;
    let workspaceRootResolved: string;

    beforeAll(async () => {
      if (!process.env['TMP']) {
        throw new Error("The 'TMP' environment variable isn't defined.");
      }

      if (!process.env['NX_SERVERLESS_CDK_VERSION']) {
        throw new Error(
          `The 'NX_SERVERLESS_CDK_VERSION' environment variable isn't defined. Please set it via the '.env.e2e' file in the project directory.`,
        );
      }

      const tmp = process.env['TMP'];
      nxServerlessCdkVersion = process.env['NX_SERVERLESS_CDK_VERSION'];
      rootTemporaryResolved = resolve(`${tmp}/nx-serverless-cdk`);
      workspaceRootResolved = join(rootTemporaryResolved, 'generic-workspace');
      await rm(workspaceRootResolved, {
        force: true,
        maxRetries: 3,
        recursive: true,
      });
      await mkdir(rootTemporaryResolved, { recursive: true });

      await executeCommand(
        'npx create-nx-workspace@latest --name "generic-workspace" --preset "apps" --workspaceType "integrated" --no-nxCloud',
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
        projectName = 'Generic*App';

        await executeCommand(
          `npx nx g nx-serverless-cdk:cdk-app ${projectName} --type generic`,
          [],
          { cwd: workspaceRootResolved },
        );
      });

      test('should do something.', async () => {});
    });
  });
});
