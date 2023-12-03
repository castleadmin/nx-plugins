import {
  InvocationType,
  InvokeCommand,
  InvokeCommandOutput,
  LambdaClient,
  LogType,
} from '@aws-sdk/client-lambda';
import { fromSSO } from '@aws-sdk/credential-providers';
import { ChildProcess } from 'node:child_process';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path/posix';
import { executeCommand } from './execute-command';
import { killLeafProcesses } from './kill-leaf-processes';

jest.setTimeout(15 * 60 * 1000); // 15 minutes

/**
 * Prerequisite: The tests must be executed on a Unix system.
 */
describe('Unix', () => {
  describe('Given a monorepo for cdk applications,', () => {
    let nxVersion: string;
    let nxServerlessCdkVersion: string;
    let devProfile: string;
    let devRegion: string;
    let stageProfile: string;
    let prodProfile: string;
    let rootTemporaryResolved: string;
    let workspaceRootResolved: string;

    beforeAll(async () => {
      if (!process.env['NX_VERSION']) {
        throw new Error(
          `The 'NX_VERSION' environment variable isn't defined. Please set it via the '.env.e2e' file in the project directory.`,
        );
      }

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

      nxVersion = process.env['NX_VERSION'];
      nxServerlessCdkVersion = process.env['NX_SERVERLESS_CDK_VERSION'];
      devProfile = process.env['E2E_DEV_PROFILE'];
      devRegion = process.env['CDK_DEV_REGION'];
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
        `npx create-nx-workspace@${nxVersion} --name 'workspace-e2e' --preset 'apps' --workspaceType 'integrated' --no-nxCloud`,
        [],
        { cwd: rootTemporaryResolved },
      );

      await executeCommand(
        `npm install --save-dev 'nx-serverless-cdk@${nxServerlessCdkVersion}'`,
        [],
        { cwd: workspaceRootResolved },
      );
    });

    describe.each([
      {
        description:
          'and a generated generic CDK application without a given directory,',
        name: 'Generic.App~1-2_3',
        directory: undefined,
      },
      {
        description:
          'and a generated generic CDK application with a given directory,',
        name: 'dir-Generic.App~1-2_3',
        directory: 'generic/app',
      },
      {
        description:
          'and a generated generic CDK application with a npm scope in its name,',
        name: '@org/ScopeGeneric.App~1-2_3',
        directory: undefined,
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ])('$description', ({ description: _description, name, directory }) => {
      let projectName: string;

      beforeAll(async () => {
        projectName = name;

        await executeCommand(
          `npx nx g nx-serverless-cdk:cdk-app '${projectName}' --type generic${
            directory ? ` --directory '${directory}'` : ''
          }`,
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
            `npx nx run '${projectName}':cdk deploy 'Dev/*' --profile '${devProfile}'`,
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
            `npx nx run '${projectName}':cdk deploy 'Stage/*' --profile '${stageProfile}'`,
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
            `npx nx run '${projectName}':cdk deploy 'Prod/*' --profile '${prodProfile}'`,
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
            `npx nx run '${projectName}':cdk deploy 'Dev/*' --profile '${devProfile}'`,
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
            `npx nx run '${projectName}':cdk deploy 'Stage/*' --profile '${stageProfile}'`,
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
            `npx nx run '${projectName}':cdk deploy 'Prod/*' --profile '${prodProfile}'`,
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

    describe.each([
      {
        description:
          'and a generated lambda CDK application without a given directory,',
        name: 'Lambda.App~1-2_3',
        directory: undefined,
      },
      {
        description:
          'and a generated lambda CDK application with a given directory,',
        name: 'dir-Lambda.App~1-2_3',
        directory: 'lambda/app',
      },
      {
        description:
          'and a generated lambda CDK application with a npm scope in its name,',
        name: '@org/ScopeLambda.App~1-2_3',
        directory: undefined,
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ])('$description', ({ description: _description, name, directory }) => {
      let projectName: string;

      beforeAll(async () => {
        projectName = name;

        await executeCommand(
          `npx nx g nx-serverless-cdk:cdk-app '${projectName}' --type lambda${
            directory ? ` --directory '${directory}'` : ''
          }`,
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

      test('should generate an event successfully.', async () => {
        let output: string = '';
        const appendToOutput = (data: string): void => {
          output += data;
        };

        await executeCommand(
          `npx nx run '${projectName}':generate-event cloudwatch scheduled-event --region eu-central-1`,
          [],
          { cwd: workspaceRootResolved, stdout: appendToOutput },
        );

        expect(
          output.includes(`{
  "id": "cdc73f9d-aea9-11e3-9d5a-835b769c0d9c",
  "detail-type": "Scheduled Event",
  "source": "aws.events",
  "account": "123456789012",
  "time": "1970-01-01T00:00:00Z",
  "region": "eu-central-1",
  "resources": [
    "arn:aws:events:eu-central-1:123456789012:rule/ExampleRule"
  ],
  "detail": {}
}
`),
        ).toBe(true);
      });

      describe('and synthesized Dev stacks,', () => {
        let templateRelativeToProject: string;

        beforeAll(async () => {
          await executeCommand(
            `npx nx run '${projectName}':cdk synth 'Dev/*' --profile '${devProfile}'`,
            [],
            { cwd: workspaceRootResolved },
          );

          const outputFiles = await readdir(
            join(
              workspaceRootResolved,
              directory ? directory : projectName,
              'cdk.out',
            ),
            { encoding: 'utf-8' },
          );
          const templateFileName = outputFiles.find(
            (fileName) =>
              fileName.startsWith('Dev') && fileName.endsWith('.template.json'),
          );

          if (!templateFileName) {
            throw new Error(
              `The Dev template file name couldn't be found for the project '${projectName}'.`,
            );
          }

          templateRelativeToProject = `cdk.out/${templateFileName}`;
        });

        test('should invoke the Dev ExampleFunction locally.', async () => {
          let hasPrintedResult = false;
          const hasResult = (data: string): void => {
            if (data.includes('{"sum": 7}')) {
              hasPrintedResult = true;
            }
          };

          await executeCommand(
            `npx nx run '${projectName}':invoke -t '${templateRelativeToProject}' ExampleFunction --event events/sum/sum7.json`,
            [],
            {
              cwd: workspaceRootResolved,
              stdout: hasResult,
              stderr: hasResult,
            },
          );

          expect(hasPrintedResult).toBe(true);
        });

        test('should test the Dev ExampleFunction locally.', async () => {
          const payload = await readFile(
            resolve(
              join(
                workspaceRootResolved,
                directory ? directory : projectName,
                'events/sum/sum7.json',
              ),
            ),
            { encoding: 'utf-8' },
          );
          const templateJson = JSON.parse(
            await readFile(
              resolve(
                join(
                  workspaceRootResolved,
                  directory ? directory : projectName,
                  templateRelativeToProject,
                ),
              ),
              { encoding: 'utf-8' },
            ),
          );
          const functionName = Object.keys(templateJson.Resources).find(
            (resource) =>
              resource.startsWith('ExampleFunction') &&
              templateJson.Resources[resource].Type === 'AWS::Lambda::Function',
          );

          if (!functionName) {
            throw new Error(
              `Couldn't find the ExampleFunction name in the Dev template file of the project '${projectName}'.`,
            );
          }

          let response: InvokeCommandOutput | undefined;
          const hasStarted = async (
            data: string,
            serverProcess: ChildProcess,
          ): Promise<void> => {
            if (data.includes('Running on http://127.0.0.1:3001')) {
              const lambdaClient = new LambdaClient({
                credentials: fromSSO({
                  profile: devProfile,
                }),
                region: devRegion,
                endpoint: 'http://127.0.0.1:3001',
                maxAttempts: 3,
              });

              try {
                response = await lambdaClient.send(
                  new InvokeCommand({
                    FunctionName: functionName,
                    InvocationType: InvocationType.RequestResponse,
                    LogType: LogType.None,
                    Payload: payload,
                  }),
                );
              } catch (error) {
                console.error(error);

                throw error;
              } finally {
                await killLeafProcesses(serverProcess.pid);
              }
            }
          };
          await executeCommand(
            `npx nx run '${projectName}':start-lambda -t '${templateRelativeToProject}'`,
            [],
            {
              cwd: workspaceRootResolved,
              stdout: hasStarted,
              stderr: hasStarted,
            },
          ).catch((error) => console.log(error));

          expect(response?.StatusCode).toBe(200);
          expect(response?.FunctionError).toBeFalsy();
          expect(
            JSON.parse(Buffer.from(response?.Payload ?? '').toString()),
          ).toEqual({
            sum: 7,
          });
        });

        test('should test the Dev ExampleApiFunction locally.', async () => {
          let response: Response | undefined;
          const hasStarted = async (
            data: string,
            serverProcess: ChildProcess,
          ): Promise<void> => {
            if (data.includes('Running on http://127.0.0.1:3000')) {
              try {
                response = await fetch('http://127.0.0.1:3000/product?a=4&b=5');
              } catch (error) {
                console.error(error);

                throw error;
              } finally {
                await killLeafProcesses(serverProcess.pid);
              }
            }
          };
          await executeCommand(
            `npx nx run '${projectName}':start-api -t '${templateRelativeToProject}'`,
            [],
            {
              cwd: workspaceRootResolved,
              stdout: hasStarted,
              stderr: hasStarted,
            },
          ).catch((error) => console.log(error));

          expect(response?.ok).toBe(true);
          expect(await response?.json()).toEqual({
            product: 20,
          });
        });
      });

      describe('and deployed Dev stacks,', () => {
        beforeAll(async () => {
          await executeCommand(
            `npx nx run '${projectName}':cdk deploy 'Dev/*' --profile '${devProfile}' --require-approval never`,
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
            `npx nx run '${projectName}':cdk deploy 'Stage/*' --profile '${stageProfile}' --require-approval never`,
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
            `npx nx run '${projectName}':cdk deploy 'Prod/*' --profile '${prodProfile}' --require-approval never`,
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
