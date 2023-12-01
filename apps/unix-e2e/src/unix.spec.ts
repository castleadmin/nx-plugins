import { mkdir, rm } from 'node:fs/promises';
import { normalize, resolve } from 'node:path/posix';
import { executeCommand } from 'nx-serverless-cdk';

jest.setTimeout(15 * 60 * 1000); // 15 minutes

/**
 * Prerequisite: The test must be executed on a Unix system.
 */
describe('Unix', () => {
  describe('Given a generated generic CDK application,', () => {
    let workspaceRootResolved: string;

    beforeAll(async () => {
      workspaceRootResolved = resolve(
        '/tmp/nx-serverless-cdk/generic-workspace',
      );
      await rm(workspaceRootResolved, {
        force: true,
        maxRetries: 3,
        recursive: true,
      });
      await mkdir(workspaceRootResolved, { recursive: true });

      await executeCommand(
        'npx create-nx-workspace@latest --name "generic-workspace" --preset "apps" --workspaceType "integrated" --no-nxCloud',
        [],
        { cwd: normalize(`${workspaceRootResolved}/..`) },
      );
    });

    test('should do something.', async () => {});
  });
});
