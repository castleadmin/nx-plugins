<p style="text-align: center;">
  <img alt="nx-serverless-cdk" src="https://raw.githubusercontent.com/castleadmin/nx-plugins/main/nx-serverless-cdk/plugin/logo.png">
</p>

[![License](https://img.shields.io/npm/l/nx-serverless-cdk?style=flat)](https://raw.githubusercontent.com/castleadmin/nx-plugins/main/nx-serverless-cdk/plugin/LICENSE)
[![NPM Version](https://badge.fury.io/js/nx-serverless-cdk.svg)](https://badge.fury.io/js/nx-serverless-cdk)
[![Static Badge](https://img.shields.io/badge/code%20coverage-100%25-green?style=flat)](https://castleadmin.github.io/nx-plugins/nx-serverless-cdk/plugin/lcov-report)

# nx-serverless-cdk

nx-serverless-cdk is an Nx plugin for creating AWS CDK applications and libraries inside an [Nx monorepo](https://nx.dev/concepts/more-concepts/why-monorepos).
It offers the possibility to test and debug CDK applications as well as AWS Lambda functions locally.
The plugin provides the full flexibility of the AWS CDK CLI and the local AWS SAM CLI commands.
It aims to make the usage of these tools as easy as possible inside an Nx monorepo.

## Table of Contents

- [Plugin Features](#plugin-features)
- [AWS CDK Features](#aws-cdk-features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
    - [Create a new Nx Monorepo](#create-a-new-nx-monorepo)
  - [Install](#install)
- [CDK Application](#cdk-application)
  - [Create a CDK Application](#create-a-cdk-application)
  - [Environments](#environments)
  - [CDK Application Structure](#cdk-application-structure)
  - [Format the CDK Application](#format-the-cdk-application)
  - [Lint the CDK Application](#lint-the-cdk-application)
  - [Test the CDK Application (with Code Coverage)](#test-the-cdk-application-with-code-coverage)
    - [Watch](#watch)
    - [Debug](#debug)
  - [Synthesize CloudFormation Stacks](#synthesize-cloudformation-stacks)
    - [Debug](#debug-1)
  - [Invoke a Lambda Function Locally](#invoke-a-lambda-function-locally)
    - [Debug](#debug-2)
  - [Start all Lambda Functions Locally](#start-all-lambda-functions-locally)
    - [Debug](#debug-3)
  - [Start an API Gateway Locally](#start-an-api-gateway-locally)
    - [Debug](#debug-4)
  - [Deploy the CDK Application](#deploy-the-cdk-application)
    - [Bootstrap](#bootstrap)
    - [Deploy](#deploy)
    - [Watch](#watch-1)
    - [Deploy the CDK Application and its Dependencies](#deploy-the-cdk-application-and-its-dependencies)
  - [E2E Testing](#e2e-testing)
    - [Testing in the Cloud](#testing-in-the-cloud)
    - [Execute the E2E Tests](#execute-the-e2e-tests)
    - [Watch](#watch-2)
    - [Debug](#debug-5)
  - [Generate an Event](#generate-an-event)
  - [CDK Application Commands Reference](#cdk-application-commands-reference)
    - [lint](#lint)
    - [test](#test)
    - [cdk](#cdk)
    - [deploy](#deploy-1)
    - [deploy-all](#deploy-all)
    - [destroy](#destroy)
    - [diff](#diff)
    - [ls](#ls)
    - [synth](#synth)
    - [watch](#watch)
    - [generate-event](#generate-event)
    - [invoke](#invoke)
    - [start-api](#start-api)
    - [start-lambda](#start-lambda)
  - [E2E Application Commands Reference](#e2e-application-commands-reference)
    - [lint](#lint-1)
    - [e2e](#e2e)
    - [generate-event](#generate-event-1)
- [Construct Library](#construct-library)
  - [Create a Construct Library](#create-a-construct-library)
  - [Construct Library Structure](#construct-library-structure)
  - [Format the Construct Library](#format-the-construct-library)
  - [Lint the Construct Library](#lint-the-construct-library)
  - [Test the Construct Library (with Code Coverage)](#test-the-construct-library-with-code-coverage)
    - [Watch](#watch-3)
    - [Debug](#debug-6)
  - [Use the Construct Library](#use-the-construct-library)
  - [Build the Construct Library](#build-the-construct-library)
  - [Publish to npm](#publish-to-npm)
  - [Construct Library Commands Reference](#construct-library-commands-reference)
    - [lint](#lint-2)
    - [test](#test-1)
    - [build](#build)
    - [build-declarations](#build-declarations)
    - [publish](#publish)
- [TypeScript Library](#typescript-library)
  - [Create a TypeScript Library](#create-a-typescript-library)
  - [Use the TypeScript Library](#use-the-typescript-library)
- [Debug in Chrome](#debug-in-chrome)
- [Generators Reference](#generators-reference)

## Plugin Features

- Define the **infrastructure as code** (IaC)
- The **infrastructure** and **application code** as well as the **configurations** are evolved together [**in one place**](https://docs.aws.amazon.com/cdk/v2/guide/best-practices.html)
- **Test** and **debug** the infrastructure and application code **locally**
  - Test and debug API Gateway routes that are handled by Lambda functions locally
- Use **E2E tests** to verify the correctness of the cloud applications
- Create and share **reusable infrastructure** definitions (Construct Libraries)
  - Publish libraries to npm
- **Generate** test **events** for Lambda functions
  - Use generated events for local and E2E testing
- Write everything in **TypeScript**

## AWS CDK Features

- **High-level constructs** that automatically provide **sensible, secure defaults**
- **Use programming languages** to model your system design
- Employ practices such as code reviews, unit tests, and source control to **make your infrastructure more robust**
- **Connect your AWS resources** together (even across stacks)
- **Grant permissions** using **simple, intent-oriented APIs**
- **Import existing** AWS CloudFormation **templates** to give your resources a CDK API
- Perform **infrastructure deployments** predictably and repeatedly, **with rollback on error**
- Easily **share infrastructure design patterns** among teams within your organization or even with the public

## Getting Started

### Prerequisites

- Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) to authenticate
  - SSO via the AWS IAM Identity Center is currently not handled correctly
    if a separate sso-session section exists in the AWS CLI configuration.
    This issue can be [solved by](https://github.com/aws/aws-cdk/issues/27265) merging the sso-session section into the profile section.
- Install the [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) for local testing and debugging
- Install [Docker](https://www.docker.com/get-started/) to run your Lambda functions locally (Docker Desktop or Docker Engine)
  - Please note, if you want to test Lambda functions locally on a different instruction set architecture than your host machine, [additional steps are necessary](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-docker.html)
- Use an existing Nx monorepo or follow the steps below to create a new Nx monorepo

#### Create a new Nx Monorepo

An empty monorepo can be created with the following command

```bash
npx create-nx-workspace@latest --name <WorkspaceName> --preset "apps" --workspaceType "integrated"
```

The package manager can be chosen freely by using the `--packageManager` option (e.g. choose `pnpm` or `yarn`).
The default is `npm` which is used for the following sections.

Change the working directory to the workspace root of the Nx monorepo

```bash
cd <WorkspaceName>
```

### Install

Run the following command in the workspace root directory to install the `nx-serverless-cdk` plugin

```bash
npm install --save-dev nx-serverless-cdk
```

## CDK Application

A CDK application consists of the infrastructure and application code as well as the configurations
that together form a cloud application.

Constructs are the basic building blocks of a CDK application.
They represent either individual cloud resources or a set of cloud resources
that have been interconnected to fulfill a concrete purpose.
Inside the application, the constructs are combined into deployable units called stacks.

### Create a CDK Application

To create a serverless application run the following command inside the Nx workspace

```bash
nx g nx-serverless-cdk:cdk-app <AppName> --type lambda
```

If the application should only contain infrastructure definitions (generic application) run the following command

```bash
nx g nx-serverless-cdk:cdk-app <AppName> --type generic
```

These commands will create an `<AppName>` directory in the root of the Nx workspace.
Use the `--directory` option to define another directory for the application.
Please note that the created directory is relative to the current working directory.

> **Note:**
> Use `npx nx`, if the `nx` command isn't found or install the `nx` package globally.

### Environments

The generated example code has support for 3 environments

- Dev
  - Test new features and bugfixes during the development
- Stage
  - Quality assurance
  - Test upcoming releases
  - Mimics the production environment
- Prod
  - The production environment
  - Makes the application available to its consumers

These **environments** are **just examples**, the environment names as well as their count can be changed according to the project's needs.

### CDK Application Structure

- `cdk` contains the infrastructure code and tests
  - `main.ts` entry point of the CDK application
  - `app.ts` defines the configurations for all environments
    - Multiple stacks might be deployed per environment (e.g. to cover multiple regions)
- `events` used store generated or manually created events for local and E2E testing
- `shared` contains the shared code which is used by the infrastructure and runtime code
- `src` contains the runtime code and tests (e.g. Lambda function handlers)
  - `example-api-handler.ts`<sup>\*</sup> entry point of the example API Lambda function
  - `example-handler.ts`<sup>\*</sup> entry point of the example Lambda function
- `.env` defines the environment variables for the application commands
  - Used to enable the CDK debug mode
  - Used to define the AWS accounts and regions for the deployment
  - The environment variables can be overridden if needed
- `.env.test` used to activate the debug mode for the Jest testing framework
- `.eslintrc.json` ESLint configuration
- `.gitignore` defines the files that are excluded from version control
- `cdk.json` AWS CDK configuration
- `jest.config.ts` Jest testing framework configuration
- `project.json` Nx application configuration
- `samconfig.toml`<sup>\*</sup> AWS SAM configuration
- `start-cdk.mjs` ignore this script, it is used to make the debugging of CDK applications possible
- `tsconfig.cdk.json` TypeScript infrastructure code configuration
- `tsconfig.json` common TypeScript CDK application configuration
- `tsconfig.spec.json` TypeScript test code configuration
- `tsconfig.src.json` TypeScript runtime code configuration

<sup>\*</sup>Is created for serverless CDK applications

### Format the CDK Application

The projects (applications and libraries) that have been changed since the last commit can be formatted with the help of [nx format](https://nx.dev/nx-api/nx/documents/format-write).

```bash
nx format
```

To format all projects execute

```bash
nx format --all
```

To format only the application execute

```bash
nx format --projects <AppName>
```

### Lint the CDK Application

To lint the application execute

```bash
nx lint <AppName>
```

or

```bash
nx run <AppName>:lint
```

### Test the CDK Application (with Code Coverage)

To test the application execute

```bash
nx test <AppName>
```

or

```bash
nx run <AppName>:test
```

Add the `--codeCoverage` option to enable code coverage.

```bash
nx run <AppName>:test --codeCoverage
```

#### Watch

To automatically rerun the application tests after a file has been changed, execute

```bash
nx run <AppName>:test --watch
```

#### Debug

Add the `debugger;` statement to the code at the location where the debugging session should start.

In the `.env.test` file uncomment the `NODE_OPTIONS` variable.

Execute the test command with the `--runInBand` option

```bash
nx run <AppName>:test --runInBand
```

A message is printed out to the console similar to the one below

```
Debugger listening on ws://127.0.0.1:9229/15755f9f-6e5d-4c5e-917b-d2b8e9dec5d2
```

Any Node.js debugger can be used for debugging. In this example, [the Chrome browser will be used](#debug-in-chrome).

### Synthesize CloudFormation Stacks

To synthesize all Dev environment stacks execute

```bash
nx run <AppName>:cdk synth "Dev/*" --profile <AwsCliDevEnvironmentProfile>
```

or use the shorthand command

```bash
nx run <AppName>:synth -c dev --profile <AwsCliDevEnvironmentProfile>
```

or

```bash
nx run <AppName>:synth:dev --profile <AwsCliDevEnvironmentProfile>
```

Use the `.env` file to define the AWS accounts and regions for the environments.
If the environment variables aren't defined,
the account and region are retrieved from the AWS CLI profile.
Please note that the AWS CLI profile values might vary per user.

The synthesized CloudFormation stacks are stored in `cdk.out`.

> **Note:**
> If SSO is used to authenticate, then it is required to log in before executing this command.

#### Debug

Add the `debugger;` statement to the infrastructure code at the location where the debugging session should start.

In the `.env` file set `CDK_DEBUG` to true.

[Synthesize all Dev environment stacks](#synthesize-cloudformation-stacks).

A message is printed out to the console similar to the one below

```
Debugger listening on ws://127.0.0.1:9229/15755f9f-6e5d-4c5e-917b-d2b8e9dec5d2
```

Any Node.js debugger can be used for debugging. In this example, [the Chrome browser will be used](#debug-in-chrome).

### Invoke a Lambda Function Locally

[Synthesize all Dev environment stacks](#synthesize-cloudformation-stacks).

Open the `cdk.out` directory and search for the Dev environment CloudFormation template,
which should have a file name similar to `DevAdventialsE766A003.template.json`.
Copy the file name.

To invoke the example Lambda function locally with the test event stored in `events/sum/sum7.json` execute

```bash
nx run <AppName>:invoke ExampleFunction -t cdk.out/<DevTemplateJson> -e "events/sum/sum7.json"
```

The Lambda function result `{"sum": 7}` is printed out to the console.
If this command is executed for the first time,
it might take a while since the Lambda Docker image has to be pulled first.

#### Debug

Add the `debugger;` statement to the runtime code at the location where the debugging session should start.

[Synthesize all Dev environment stacks](#synthesize-cloudformation-stacks).

In the `samconfig.toml` file uncomment the `debug_port` variable of the `[default.local_invoke.parameters]` section.

[Invoke a Lambda function locally](#invoke-a-lambda-function-locally).

A message is printed out to the console similar to the one below

```
Debugger listening on ws://127.0.0.1:9229/15755f9f-6e5d-4c5e-917b-d2b8e9dec5d2
```

Any Node.js debugger can be used for debugging. In this example, [the Chrome browser will be used](#debug-in-chrome).

### Start all Lambda Functions Locally

[Synthesize all Dev environment stacks](#synthesize-cloudformation-stacks).

Open the `cdk.out` directory and search for the Dev environment CloudFormation template,
which should have a file name similar to `DevAdventialsE766A003.template.json`.
Copy the file name.

To start all Lambda functions locally execute

```bash
nx run <AppName>:start-lambda -t cdk.out/<DevTemplateJson>
```

If this command is executed for the first time,
it might take a while since the Lambda Docker image has to be pulled first.
The following message is printed out to the console

```
 * Running on http://127.0.0.1:3001
```

Find the example function resource name in the `cdk.out/<DevTemplateJson>`, which should be similar to `ExampleFunctionB28997EC`.

To invoke the example Lambda function execute

```bash
aws lambda invoke response.json --function-name <ExampleFunctionResourceName> --endpoint-url "http://127.0.0.1:3001" --payload "fileb://<AppName>/events/sum/sum7.json" --region <DevRegion> --profile <DevProfile>
```

The Lambda function result `{"sum": 7}` is stored in the `<WorkspaceRoot>/response.json` file.

The [@aws-sdk/client-lambda](https://www.npmjs.com/package/@aws-sdk/client-lambda) package can also be used to invoke a Lambda function

```typescript
import { InvocationType, InvokeCommand, LambdaClient, LogType } from '@aws-sdk/client-lambda';
import { fromSSO } from '@aws-sdk/credential-providers';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const lambdaClient = new LambdaClient({
  credentials: fromSSO({
    profile: '<DevProfile>',
  }),
  region: '<DevRegion>',
  endpoint: 'http://127.0.0.1:3001',
  maxAttempts: 3,
});

const payload = await readFile(resolve(join('<WorkspaceRoot>', '<AppName>', 'events/sum/sum7.json')), { encoding: 'utf-8' });

const response = await lambdaClient.send(
  new InvokeCommand({
    FunctionName: '<ExampleFunctionResourceName>',
    InvocationType: InvocationType.RequestResponse,
    LogType: LogType.None,
    Payload: payload,
  }),
);
```

#### Debug

Add the `debugger;` statement to the runtime code at the location where the debugging session should start.

[Synthesize all Dev environment stacks](#synthesize-cloudformation-stacks).

In the `samconfig.toml` file uncomment the `debug_port` variable of the `[default.local_start_lambda.parameters]` section.

[Start all Lambda functions and invoke an individual Lambda function locally](#start-all-lambda-functions-locally).

A message is printed out to the console similar to the one below

```
Debugger listening on ws://127.0.0.1:9229/15755f9f-6e5d-4c5e-917b-d2b8e9dec5d2
```

Any Node.js debugger can be used for debugging. In this example, [the Chrome browser will be used](#debug-in-chrome).

### Start an API Gateway Locally

[Synthesize all Dev environment stacks](#synthesize-cloudformation-stacks).

Open the `cdk.out` directory and search for the Dev environment CloudFormation template,
which should have a file name similar to `DevAdventialsE766A003.template.json`.
Copy the file name.

To start an API Gateway locally execute

```bash
nx run <AppName>:start-api -t cdk.out/<DevTemplateJson>
```

If this command is executed for the first time,
it might take a while since the Lambda Docker image has to be pulled first.
The following message is printed out to the console

```
 * Running on http://127.0.0.1:3000
```

To call the endpoint `product` execute

```bash
curl -i "http://127.0.0.1:3000/product?a=5&b=7"
```

The result `{"product":35}` is printed out to the console.

#### Debug

Add the `debugger;` statement to the runtime code at the location where the debugging session should start.

[Synthesize all Dev environment stacks](#synthesize-cloudformation-stacks).

In the `samconfig.toml` file uncomment the `debug_port` variable of the `[default.local_start_api.parameters]` section.

[Start an API Gateway locally and call an endpoint](#start-an-api-gateway-locally).

A message is printed out to the console similar to the one below

```
Debugger listening on ws://127.0.0.1:9229/15755f9f-6e5d-4c5e-917b-d2b8e9dec5d2
```

Any Node.js debugger can be used for debugging. In this example, [the Chrome browser will be used](#debug-in-chrome).

### Deploy the CDK Application

#### Bootstrap

The AWS CDK bootstraps an account and region combination by deploying
a predefined bootstrap CloudFormation stack to it.

The bootstrap stack has to be deployed only once before multiple deployments can take place.
If no bootstrap resources are required, an account and region combination doesn't have to be bootstrapped.

Execute the following command for every account and region combination that should be bootstrapped

```bash
nx run <AppName>:cdk bootstrap "<AwsAccountNumber>/<AwsRegion>" --profile <AwsCliEnvironmentProfile>
```

Re-run this command to update the bootstrap CloudFormation stack in place.

#### Deploy

To deploy all Dev environment stacks execute

```bash
nx run <AppName>:cdk deploy "Dev/*" --profile <AwsCliDevEnvironmentProfile>
```

or use the shorthand command

```bash
nx run <AppName>:deploy -c dev --profile <AwsCliDevEnvironmentProfile>
```

or

```bash
nx run <AppName>:deploy:dev --profile <AwsCliDevEnvironmentProfile>
```

To deploy all Stage environment stacks execute

```bash
nx run <AppName>:deploy:stage --profile <AwsCliStageEnvironmentProfile>
```

To deploy all Prod environment stacks execute

```bash
nx run <AppName>:deploy:prod --profile <AwsCliProdEnvironmentProfile>
```

Use the `.env` file to define the AWS accounts and regions for the environments.
If the environment variables aren't defined,
the account and region are retrieved from the AWS CLI profile.
Please note that the AWS CLI profile values might vary per user.

> **Note:**
> If SSO is used to authenticate, then it is required to log in before executing this command.

#### Watch

To automatically rerun the deployment after a file has been changed, execute

```bash
nx run <AppName>:watch:dev --profile <AwsCliDevEnvironmentProfile>
```

The AWS CDK CLI will try to directly update the affected services (hotswap).
By appending the `--hotswap-fallback` option, a CloudFormation deployment
will be performed if a direct service update isn't feasible.

```bash
nx run <AppName>:watch:dev --profile <AwsCliDevEnvironmentProfile> --hotswap-fallback
```

> **Note:**
> The AWS CDK watch mode is meant for development deployments and shouldn't be used to deploy production resources.

#### Deploy the CDK Application and its Dependencies

The situation might arise that a cloud resource is needed by multiple CloudFormation stacks of the same application.
In this case, the cloud resource could be easily shared between the stacks by [introducing a shared stack](https://docs.aws.amazon.com/cdk/v2/guide/resources.html#resource_stack).

If the cloud resource is needed by multiple CDK applications, then it makes sense to introduce a shared application.
The shared application should be deployed before the applications that depend on it.

If multiple applications depend on a shared application, then they have to declare this dependency explicitly.
Every application that depends on the shared application has to set the following property in their `project.json` file

```json
{
  ...
  "implicitDependencies": ["<SharedAppName>"],
  ...
}
```

The dependencies between applications and libraries can be checked via the following command

```bash
nx graph
```

If an application and all the applications it depends on should be deployed to the Dev environment,
then the following command can be executed

```bash
nx run <AppName>:deploy-all:dev --profile <AwsCliDevEnvironmentProfile> --verbose
```

A similar command could be executed for the Stage and Prod environment.
This command uses the Nx dependency graph to determine the deployment order.
The given command-line arguments are used for every application deployment in the dependency chain.

The following command could be used in a CI/CD pipeline to deploy all applications that have been changed and
the applications they depend on

```bash
nx affected -t deploy-all -c dev --profile Dev --verbose --require-approval never --ci
```

Nx determines if an application has changed by a given git commit range.
Please consult the [Nx documentation](https://nx.dev/nx-api/nx/documents/affected) for further details.

> **Note:**
> If SSO is used to authenticate, then it is required to log in before executing this command.

### E2E Testing

#### Testing in the Cloud

[Testing serverless applications in the cloud](https://docs.aws.amazon.com/lambda/latest/dg/testing-guide.html) is the testing technique that is preferred by AWS.
It offers the following benefits

> - You can test every available service.
> - You are always using the most recent service APIs and return values.
> - A cloud test environment closely resembles your production environment.
> - Tests can cover security policies, service quotas, configurations and infrastructure-specific parameters.
> - Every developer can quickly create one or more testing environments in the cloud.
> - Cloud tests increase confidence your code will run correctly in production.

The AWS CDK supports this testing technique with its watch mode.
The AWS CDK watch mode offers direct AWS resource updates and
as a fallback CloudFormation deployments without rollback.
These features significantly speed up the deployment of incremental changes during the development.

> **Note:**
> The AWS CDK watch mode is meant for development deployments and shouldn't be used to deploy production resources.

#### Execute the E2E Tests

This plugin supports testing in the cloud by creating an E2E application for every CDK application.
The E2E tests are used to ensure that the cloud application works as expected.

Please set the environment-specific profile and region in the `.env.e2e` file of the E2E application.
Use the `E2E_ENVIRONMENT` environment variable to specify the environment that should be tested.

[Deploy the application into the specified environment](#deploy).

To run the E2E tests against the specified environment execute

```bash
nx run <AppName>-e2e:e2e
```

Add the `--codeCoverage` option to enable code coverage.

```bash
nx run <AppName>-e2e:e2e --codeCoverage
```

#### Watch

To automatically rerun the E2E tests after a file has been changed, execute

```bash
nx run <AppName>-e2e:e2e --watch
```

#### Debug

Add the `debugger;` statement to the code at the location where the debugging session should start.

In the `.env.e2e` file uncomment the `NODE_OPTIONS` variable.

Execute the E2E test command with the `--runInBand` option

```bash
nx run <AppName>-e2e:e2e --runInBand
```

A message is printed out to the console similar to the one below

```
Debugger listening on ws://127.0.0.1:9229/15755f9f-6e5d-4c5e-917b-d2b8e9dec5d2
```

Any Node.js debugger can be used for debugging. In this example, [the Chrome browser will be used](#debug-in-chrome).

### Generate an Event

Lambda functions are invoked with events.
These events are either AWS service-specific events or custom events.

Mock events are regularly needed for local and E2E testing.
They can be stored inside the `events` directory of the CDK application or E2E application.

The `generate-event` command can be used to create AWS service-specific mock events.
In the following example, a mock event is created
for a Lambda function that is invoked on a regular schedule

```bash
nx run <AppName>:generate-event cloudwatch scheduled-event --region eu-central-1
```

The following command has to be executed for the E2E application

```bash
nx run <AppName>-e2e:generate-event cloudwatch scheduled-event --region eu-central-1
```

The generated event is printed out to the console. It can be copied and stored in a new file inside the `events` directory.

### CDK Application Commands Reference

#### lint

```bash
nx run <AppName>:lint [Options]
```

The [lint](https://nx.dev/nx-api/eslint/executors/lint) command
is used to lint the application with ESLint (see [Lint the CDK Application](#lint-the-cdk-application)).

Options:

- --help
  - Displays the command options

#### test

```bash
nx run <AppName>:test [Options]
```

The [test](https://nx.dev/nx-api/jest/executors/jest) command
is used to execute the test cases with Jest (see [Test the CDK Application (with Code Coverage)](#test-the-cdk-application-with-code-coverage)).

Options:

- --help
  - Displays the command options

#### cdk

```bash
nx run <AppName>:cdk [Options]
```

The [cdk](https://docs.aws.amazon.com/cdk/v2/guide/cli.html) command
is used to interact with the AWS CDK.

Options:

- -h
  - Displays the command options

Configuration Options:

- predefinedArguments
  - Used to predefine arguments that are put at the beginning of the command

#### deploy

```bash
nx run <AppName>:deploy:<EnvironmentConfiguration> [Options]
```

Shorthand command for [cdk deploy](https://docs.aws.amazon.com/cdk/v2/guide/cli.html#cli-deploy).
Deploys one or more specified stacks (see [Deploy the CDK Application](#deploy-the-cdk-application)).

The environment configuration is `dev`, `stage` or `prod` (can be adjusted).

Options:

- -h
  - Displays the command options

#### deploy-all

```bash
nx run <AppName>:deploy-all:<EnvironmentConfiguration> --verbose [Options]
```

Shorthand command for [cdk deploy](https://docs.aws.amazon.com/cdk/v2/guide/cli.html#cli-deploy).
Deploys one or more specified stacks.

The command is executed for the application and
every application in the application's dependency tree.
The individual commands are executed in dependency order
starting with the leaves of the dependency tree (see [Deploy the CDK Application and its Dependencies](#deploy-the-cdk-application-and-its-dependencies)).

The environment configuration is `dev`, `stage` or `prod` (can be adjusted).

Options:

- -h
  - Displays the command options

#### destroy

```bash
nx run <AppName>:destroy:<EnvironmentConfiguration> [Options]
```

Shorthand command for [cdk destroy](https://docs.aws.amazon.com/cdk/v2/guide/cli.html#cli-commands).
Destroys one or more specified stacks.

The environment configuration is `dev`, `stage` or `prod` (can be adjusted).

Options:

- -h
  - Displays the command options

#### diff

```bash
nx run <AppName>:diff:<EnvironmentConfiguration> [Options]
```

Shorthand command for [cdk diff](https://docs.aws.amazon.com/cdk/v2/guide/cli.html#cli-diff).
Compares the specified stacks and its dependencies with the deployed stacks.

The environment configuration is `dev`, `stage` or `prod` (can be adjusted).

Options:

- -h
  - Displays the command options

#### ls

```bash
nx run <AppName>:ls:<EnvironmentConfiguration> [Options]
```

Shorthand command for [cdk ls](https://docs.aws.amazon.com/cdk/v2/guide/cli.html#cli-list).
Lists the IDs of the specified stacks.

The environment configuration is `dev`, `stage` or `prod` (can be adjusted).

Options:

- -h
  - Displays the command options

#### synth

```bash
nx run <AppName>:synth:<EnvironmentConfiguration> [Options]
```

Shorthand command for [cdk synth](https://docs.aws.amazon.com/cdk/v2/guide/cli.html#cli-synth).
Synthesizes the specified stacks into CloudFormation templates (see [Synthesize CloudFormation Stacks](#synthesize-cloudformation-stacks)).

The environment configuration is `dev`, `stage` or `prod` (can be adjusted).

Options:

- -h
  - Displays the command options

#### watch

```bash
nx run <AppName>:watch:<EnvironmentConfiguration> [Options]
```

Shorthand command for [cdk watch](https://docs.aws.amazon.com/cdk/v2/guide/cli.html#cli-deploy).
Continuously monitors the application's source files and assets for changes.
It immediately performs a deployment of the specified stacks when a change is detected.

The environment configuration is `dev`, `stage` or `prod` (can be adjusted).

Options:

- -h
  - Displays the command options

#### generate-event

```bash
nx run <AppName>:generate-event [Options]
```

The [generate-event](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-local-generate-event.html) command
is used to generate AWS service-specific mock events (see [Generate an Event](#generate-an-event)).

Options:

- -h
  - Displays the command options

Configuration Options:

- predefinedArguments
  - Used to predefine arguments that are put at the beginning of the command

#### invoke

```bash
nx run <AppName>:invoke [Options]
```

The [invoke](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-local-invoke.html) command
is used to invoke a Lambda function locally (see [Invoke a Lambda Function Locally](#invoke-a-lambda-function-locally)).

Options:

- -h
  - Displays the command options

Configuration Options:

- predefinedArguments
  - Used to predefine arguments that are put at the beginning of the command

#### start-api

```bash
nx run <AppName>:start-api [Options]
```

The [start-api](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-local-start-api.html) command
is used to start an API Gateway locally (see [Start an API Gateway Locally](#start-an-api-gateway-locally)).

Options:

- -h
  - Displays the command options

Configuration Options:

- predefinedArguments
  - Used to predefine arguments that are put at the beginning of the command

#### start-lambda

```bash
nx run <AppName>:start-lambda [Options]
```

The [start-lambda](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-local-start-lambda.html) command
is used to start all Lambda functions locally (see [Start all Lambda Functions Locally](#start-all-lambda-functions-locally)).

Options:

- -h
  - Displays the command options

Configuration Options:

- predefinedArguments
  - Used to predefine arguments that are put at the beginning of the command

### E2E Application Commands Reference

#### lint

```bash
nx run <AppName>-e2e:lint [Options]
```

The [lint](https://nx.dev/nx-api/eslint/executors/lint) command
is used to lint the application with ESLint.

Options:

- --help
  - Displays the command options

#### e2e

```bash
nx run <AppName>-e2e:e2e [Options]
```

The [e2e](https://nx.dev/nx-api/jest/executors/jest) command
is used to execute the E2E tests with Jest (see [E2E Testing](#e2e-testing)).

Options:

- --help
  - Displays the command options

#### generate-event

```bash
nx run <AppName>-e2e:generate-event [Options]
```

The [generate-event](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-local-generate-event.html) command
is used to generate AWS service-specific mock events (see [Generate an Event](#generate-an-event)).

Options:

- -h
  - Displays the command options

Configuration Options:

- predefinedArguments
  - Used to predefine arguments that are put at the beginning of the command

## Construct Library

Constructs are the basic building blocks of a CDK application.
They represent either individual cloud resources or a set of cloud resources
that have been interconnected to fulfill a concrete purpose.

Constructs can be composed of self-written or third-party constructs.
The [AWS Construct Library](https://docs.aws.amazon.com/cdk/v2/guide/constructs.html#constructs_lib)
contains the constructs for AWS resources. Its constructs can be categorized into 3 levels

- L1 constructs
  - Represent CloudFormation resources
  - Are automatically generated
- L2 constructs
  - Represent AWS resources
  - Intent-based API
- L3 constructs
  - Patterns
  - Often involve multiple resources

A vast collection of third-party open-source
construct libraries can be found on [Construct Hub](https://constructs.dev/).

Constructs are a great way to define organization or project standards.
They can be grouped in a construct library and shared between multiple CDK applications.

### Create a Construct Library

To create a construct library run the following command inside the Nx workspace

```bash
nx g nx-serverless-cdk:cdk-lib <LibName> --importPath <LibPackageName>
```

The `--importPath` option defines the construct library's package name.
The construct library can be imported into other construct libraries or CDK applications
inside the Nx monorepo.

To use the construct library outside the monorepo, it can be published to an npm repository.
Execute the following command to create a publishable construct library that uses the value
of `--importPath` as the npm package name

```bash
nx g nx-serverless-cdk:cdk-lib <LibName> --importPath <LibPackageName> --publishable
```

These commands will create an `<LibName>` directory in the root of the Nx workspace.
Use the `--directory` option to define another directory for the construct library.
Please note that the created directory is relative to the current working directory.

> **Note:**
> Use `npx nx`, if the `nx` command isn't found or install the `nx` package globally.

### Construct Library Structure

- `cdk` contains the infrastructure code and tests
  - `index.ts` entry point of the construct library
- `.env.test` used to activate the debug mode for the Jest testing framework
- `.eslintrc.json` ESLint configuration
- `jest.config.ts` Jest testing framework configuration
- `package.json` npm package configuration
  - Used to configure the construct library's npm package that is published to an npm repository
  - To install dependencies that are used inside the monorepo, use the workspace `package.json` file instead
- `project.json` Nx library configuration
- `README.md` construct library documentation
- `tsconfig.cdk.dts.json` TypeScript infrastructure declarations configuration
- `tsconfig.cdk.json` TypeScript infrastructure code configuration
- `tsconfig.json` common TypeScript construct library configuration
- `tsconfig.spec.json` TypeScript test code configuration

### Format the Construct Library

The projects (applications and libraries) that have been changed since the last commit can be formatted with the help of [nx format](https://nx.dev/nx-api/nx/documents/format-write).

```bash
nx format
```

To format all projects execute

```bash
nx format --all
```

To format only the construct library execute

```bash
nx format --projects <LibName>
```

### Lint the Construct Library

To lint the construct library execute

```bash
nx lint <LibName>
```

or

```bash
nx run <LibName>:lint
```

### Test the Construct Library (with Code Coverage)

To test the construct library execute

```bash
nx test <LibName>
```

or

```bash
nx run <LibName>:test
```

Add the `--codeCoverage` option to enable code coverage.

```bash
nx run <LibName>:test --codeCoverage
```

#### Watch

To automatically rerun the construct library tests after a file has been changed, execute

```bash
nx run <LibName>:test --watch
```

#### Debug

Add the `debugger;` statement to the code at the location where the debugging session should start.

In the `.env.test` file uncomment the `NODE_OPTIONS` variable.

Execute the test command with the `--runInBand` option

```bash
nx run <LibName>:test --runInBand
```

A message is printed out to the console similar to the one below

```
Debugger listening on ws://127.0.0.1:9229/15755f9f-6e5d-4c5e-917b-d2b8e9dec5d2
```

Any Node.js debugger can be used for debugging. In this example, [the Chrome browser will be used](#debug-in-chrome).

### Use the Construct Library

The construct library can be imported into other construct libraries or CDK applications.
Use the following code snippet to import the `ExampleConstruct`

```typescript
import { ExampleConstruct } from '<LibPackageName>';
```

Please note that the construct library doesn't have to be built to be imported by its consumers.

### Build the Construct Library

To build the construct library execute

```bash
nx run <LibName>:build
```

The build output is written to `<WorkspaceRoot>/dist/<LibName>`.

### Publish to npm

To publish the construct library to npm execute

```bash
nx run <LibName>:publish --ver <LibVersion> --tag <LibVersionTag>
```

### Construct Library Commands Reference

#### lint

```bash
nx run <LibName>:lint [Options]
```

The [lint](https://nx.dev/nx-api/eslint/executors/lint) command
is used to lint the construct library with ESLint (see [Lint the Construct Library](#lint-the-construct-library)).

Options:

- --help
  - Displays the command options

#### test

```bash
nx run <LibName>:test [Options]
```

The [test](https://nx.dev/nx-api/jest/executors/jest) command
is used to execute the test cases with Jest (see [Test the Construct Library (with Code Coverage)](#test-the-construct-library-with-code-coverage)).

Options:

- --help
  - Displays the command options

#### build

```bash
nx run <LibName>:build [Options]
```

The [build](https://nx.dev/nx-api/esbuild/executors/esbuild) command
is used to build the construct library with esbuild (see [Build the Construct Library](#build-the-construct-library)).
The build-declarations command is always executed before the build command.

Options:

- --help
  - Displays the command options

#### build-declarations

```bash
nx run <LibName>:build-declarations [Options]
```

The [build-declarations](https://nx.dev/nx-api/js/executors/tsc) command
is used to create the construct library's TypeScript declarations with the TypeScript compiler (see [Build the Construct Library](#build-the-construct-library)).

Options:

- --help
  - Displays the command options

#### publish

```bash
nx run <LibName>:publish [Options]
```

The publish command is used to publish the construct library to an npm repository (see [Publish to npm](#publish-to-npm)).

Options:

- --ver
  - Construct library version
- --tag
  - Tag of the version (e.g. `latest`)

## TypeScript Library

A pure TypeScript library can be created with Nx and shared between construct libraries
and CDK applications.

### Create a TypeScript Library

To [create a TypeScript library](https://nx.dev/nx-api/js/generators/library) run the following command inside the Nx workspace

```bash
nx g @nx/js:library <LibName> --importPath <LibPackageName> --bundler tsc --unitTestRunner jest
```

The `--importPath` option defines the TypeScript library's package name.
The TypeScript library can be imported into construct libraries or CDK applications
inside the Nx monorepo.

To use the TypeScript library outside the monorepo, it can be published to an npm repository.
Execute the following command to create a publishable TypeScript library that uses the value
of `--importPath` as the npm package name

```bash
nx g @nx/js:library <LibName> --importPath <LibPackageName> --publishable --bundler tsc --unitTestRunner jest
```

These commands will create an `<LibName>` directory in the root of the Nx workspace.
Use the `--directory` option to define another directory for the TypeScript library.
Please note that the created directory is relative to the current working directory.

Adjust the TypeScript configurations (`tsconfig*.json`) according to the project standards.

> **Note:**
> Use `npx nx`, if the `nx` command isn't found or install the `nx` package globally.

### Use the TypeScript Library

The TypeScript library can be imported into construct libraries or CDK applications.
Use the following code snippet to import it

```typescript
import { ... } from '<LibPackageName>';
```

Please note that the TypeScript library doesn't have to be built to be imported by its consumers.

## Debug in Chrome

Open a new tab in the Chrome browser and navigate to `chrome://inspect`.

Click on `Open dedicated DevTools for Node` and navigate in the new window to the `Sources` tab.

Wait for the source code to appear and then click on the play button (Resume script execution) in the right panel.

The debugger jumps to the `debugger;` statement that has been added to the source code.
Move from this point onward by using the debugger step commands and additional breakpoints.

## Generators Reference

### cdk-app

```bash
nx g nx-serverless-cdk:cdk-app <AppName> --type <AppType>
```

The cdk-app generator is used to create an AWS CDK application (see [Create a CDK Application](#create-a-cdk-application)).

Options:

- --name _(required)_
  - CDK application name
- --directory
  - The CDK application's directory path relative to the current working directory
- --type _(required)_
  - The CDK application type can be `generic` or `lambda`
  - Choose the type `generic` for general-purpose applications
  - Choose the type `lambda` for serverless applications
- --skipFormat _(default: false)_
  - Skips the formatting after the CDK application has been created

### cdk-lib

```bash
nx g nx-serverless-cdk:cdk-lib <LibName> --importPath <LibPackageName>
```

The cdk-lib generator is used to create an AWS CDK construct library (see [Create a Construct Library](#create-a-construct-library)).

Options:

- --name _(required)_
  - Construct library name
- --directory
  - The construct library's directory path relative to the current working directory
- --importPath
  - Defines the npm package name (e.g. `example-lib` or `@example-org/example-lib`)
- --publishable
  - Creates a construct library that can be published to an npm repository
- --skipFormat _(default: false)_
  - Skips the formatting after the construct library has been created
