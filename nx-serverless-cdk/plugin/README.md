# nx-serverless-cdk

**nx-serverless-cdk** is an **Nx plugin** for creating **AWS CDK applications** and **libraries** inside an [**Nx monorepo**](https://nx.dev/concepts/more-concepts/why-monorepos).
It offers the possibility to **test** and **debug** CDK applications as well as AWS Lambda functions **locally**.
The plugin provides the **full flexibility** of the **AWS CDK CLI** and the local **AWS SAM CLI** commands.
It aims to make the **usage** of these tools **as easy as possible** inside an **Nx monorepo**.

## Table of Contents

- [Plugin Features](#plugin-features)
- [AWS CDK Features](#aws-cdk-features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Install](#install)
- [Application](#application)
  - [Create an Application](#create-an-application)
  - [Environments](#environments)
  - [Application Structure](#application-structure)
  - [Format Application](#format-application)
  - [Lint Application](#lint-application)
  - [Test Application (with Code Coverage)](#test-application-with-code-coverage)
  - [Debug Infrastructure Code](#debug-infrastructure-code)
  - [Execute Application Locally Prerequisites](#execute-application-locally-prerequisites)
  - [Invoke a Lambda Function Locally](#invoke-a-lambda-function-locally)
    - [Debug](#debug)
  - [Start Lambda Functions Locally](#start-lambda-functions-locally)
    - [Debug](#debug-1)
  - [Start API Gateway Locally](#start-api-gateway-locally)
    - [Debug](#debug-2)
  - [Deploy Application](#deploy-application)
  - [E2E Testing](#e2e-testing)
- [Construct Library](#construct-library)
  - [Create a Construct Library](#create-a-construct-library)
  - [Construct Library Structure](#construct-library-structure)
  - [Format Construct Library](#format-construct-library)
  - [Lint Construct Library](#lint-construct-library)
  - [Test Construct Library (with Code Coverage)](#test-construct-library-with-code-coverage)
  - [Use Construct Library](#use-construct-library)
  - [Publish to npm](#publish-to-npm)
- [TypeScript Library](#typescript-library)
  - [Create a TypeScript Library](#create-a-typescript-library)
  - [Use TypeScript Library](#use-typescript-library)
- [Generators Reference](#generators-reference)
- [Executors Reference](#executors-reference)

## Plugin Features

- Define your **infrastructure as code** (IaC)
- Put your [**infrastructure, application code, and configuration all in one place**](https://docs.aws.amazon.com/cdk/v2/guide/best-practices.html) and evolve them together
- **Test** and **debug** your infrastructure and application code **locally**
  - Test and debug API Gateway routes that are handled by Lambda functions locally
- Use **E2E tests** to verify the correctness of your cloud applications
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
- Grant permissions using **simple, intent-oriented APIs**
- **Import existing** AWS CloudFormation **templates** to give your resources a CDK API
- Perform **infrastructure deployments** predictably and repeatedly, **with rollback on error**
- Easily **share infrastructure design patterns** among teams within your organization or even with the public

## Getting Started

### Prerequisites

- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) for authentication
  - SSO via the AWS IAM Identity Center is currently not handled correctly
    if a separate sso-session section exists in the AWS CLI configuration.
    This issue can be [solved by](https://github.com/aws/aws-cdk/issues/27265) merging the sso-session section into the profile section.
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) for local testing and debugging
- [Docker](https://www.docker.com/get-started/) to run your Lambda functions locally (Docker Desktop or Docker Engine)

  - Please note, if you want to test Lambda functions locally on a different instruction set architecture than your host machine, [additional steps are necessary](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-docker.html)

- An Nx monorepo
  - An empty monorepo can be created with the following command

```bash
npx create-nx-workspace@latest --preset "apps" --workspaceType "integrated"
```

### Install

Run the following command in the workspace root of the Nx monorepo

```bash
npm install --save-dev nx-serverless-cdk
```

or

```bash
yarn add --dev nx-serverless-cdk
```

## Application

### Create an Application

To create a serverless application run the following command inside the Nx workspace
(Use `npx nx`, if the `nx` command isn't found or install the `nx` package globally)

```bash
nx g nx-serverless-cdk:cdk-app <AppName> --type lambda
```

If the application should only contain infrastructure definitions (generic application) run the following command

```bash
nx g nx-serverless-cdk:cdk-app <AppName> --type generic
```

A generic application can be upgraded to a serverless application at any time by adding the relevant executors to the `project.json` file.

These commands will create an `<AppName>` directory in the root of the Nx workspace.

### Environments

The generated example code has support for 3 environments

- Dev
  - Used to test new features during the development
- Stage
  - Used for quality assurance
  - Test upcoming releases
  - Mimics the production environment
- Prod
  - The Production environment
  - Make the application available to its consumers

These environments are just examples, the environment names as well as their count can be changed according to the project needs.

### Application Structure

- `cdk` contains the infrastructure code and tests
  - `main.ts` entry point of the CDK application
  - `app.ts` defines the configurations for all environments
    - Multiple stacks might be deployed per environment (e.g. to cover multiple regions)
- `events` used store generated or manually created events for local and E2E testing
- `shared` contains the shared code which is used by the infrastructure and runtime code
- `src` contains the runtime code and tests (e.g. Lambda function handlers)
  - `example-api-handler.ts` entry point of the example API Lambda function
  - `example-handler.ts` entry point of the example Lambda function
- `.env.cdk` defines the environment variables for the CDK command
  - Used to enable CDK debug mode
  - Used to determine the AWS accounts and regions for the deployment at synthesizes time
  - As a fallback these values are retrieved from the AWS profile
  - The environment variables can be overridden if needed
- `.eslintrc.json` ESLint project configuration
- `.gitignore` defines the files that are excluded from version control
- `cdk.json` AWS CDK configuration file
- `jest.config.ts` Jest testing framework configuration
- `project.json` Nx application configuration
- `samconfig.toml` AWS SAM configuration
- `start-cdk.mjs` ignore, this script is used to make the debugging of CDK applications possible
- `tsconfig.cdk.json` TypeScript infrastructure code configuration
- `tsconfig.json` shared TypeScript configuration
- `tsconfig.spec.json` TypeScript test code configuration
- `tsconfig.src.json` TypeScript runtime code configuration

### Format Application

The workspace files that have been changed since the last commit can be formatted with the help of [nx format](https://nx.dev/nx-api/nx/documents/format-write).

```bash
nx format
```

To format all workspace files execute

```bash
nx format --all
```

### Lint Application

To lint the application execute

```bash
nx lint <AppName>
```

or

```bash
nx run <AppName>:lint
```

### Test Application (with Code Coverage)

To test the application execute

```bash
nx test <AppName>
```

or

```bash
nx run <AppName>:test
```

Add the `--codeCoverage` argument to enable code coverage.

```bash
nx run <AppName>:test --codeCoverage
```

### Debug Infrastructure Code

Add the `debugger;` statement to the infrastructure code place where you want to start the debugging session.

In the `.env.cdk` file set `CDK_DEBUG` to true.

Execute the following command which synthesizes all Dev environment stacks.
If your profile doesn't specify the account or region,
you can define both via the `.env.cdk` file.
Please note, if you use SSO for authentication, then you have to be logged in before executing this command!

```bash
nx run <AppName>:cdk synth "Dev/*" --profile <AwsCliDevEnvironmentProfile>
```

A message is printed out to the console similar to the one below

```
Debugger listening on ws://127.0.0.1:9229/15755f9f-6e5d-4c5e-917b-d2b8e9dec5d2
```

Any Node.js debugger can be used for debugging. In this example, the Chrome browser will be used.

Open a new tab in the Chrome browser and navigate to `chrome://inspect`.

Click on `Open dedicated DevTools for Node` and navigate in the new window to the `Sources` tab.

Wait for the source code to appear and then click on the play button (Resume script execution) in the right panel.

The debugger jumps to the `debugger;` statement that has been added to the source code,
which represents the start point of the debugging session.

### Execute Application Locally Prerequisites

Execute the following command which synthesizes all Dev environment stacks.
If your profile doesn't specify the account or region,
you can define both via the `.env.cdk` file.
Please note, if you use SSO for authentication, then you have to be logged in before executing this command!

```bash
nx run <AppName>:cdk synth "Dev/*" --profile <AwsCliDevEnvironmentProfile>
```

Open the `<AppName>/cdk.out` directory and search for the Dev environment CloudFormation template,
which should have a file name similar to `DevAdventialsE766A003.template.json`.
Copy the file name.

### Invoke a Lambda Function Locally

Execute all steps in [Execute Application Locally Prerequisites](#local-execution-prerequisites).

To invoke the example Lambda function locally with the test event stored in `<AppName>/events/sum/sum7.json` execute

```bash
nx run <AppName>:invoke ExampleFunction -t cdk.out/<DevTemplateJson> -e "events/sum/sum7.json"
```

The Lambda function result `{"sum": 7}` is printed out to the console.
If this command is executed for the first time,
it may take a while since the Lambda Docker image has to be pulled first.

#### Debug

The debug mode can be started

### Start Lambda Functions Locally

Execute all steps in [Execute Application Locally Prerequisites](#local-execution-prerequisites).

To start all Lambda functions locally execute

```bash
nx run <AppName>:start-lambda -t cdk.out/<DevTemplateJson>
```

If this command is executed for the first time,
it may take a while since the Lambda Docker image has to be pulled first.
The following message is printed out to the console

```
 * Running on http://127.0.0.1:3001
```

Find the example function resource name in the `cdk.out/<DevTemplateJson>`, which should be similar to `ExampleFunctionB28997EC`.

To invoke the example Lambda function execute the following command

```bash
aws lambda invoke response.json --function-name <ExampleFunctionResourceName> --endpoint-url "http://127.0.0.1:3001" --payload "fileb://<AppName>/events/sum/sum7.json" --region <DevRegion> --profile <DevProfile>
```

The Lambda function result `{"sum": 7}` is stored in the `<WorkspaceRoot>/response.json` file.

The [@aws-sdk/client-lambda](https://www.npmjs.com/package/@aws-sdk/client-lambda) package can also be used to invoke a Lambda function

```typescript
 const lambdaClient = new LambdaClient({
  credentials: fromSSO({
    profile: <DevProfile>,
  }),
  region: <DevRegion>,
  endpoint: 'http://127.0.0.1:3001',
  maxAttempts: 3,
});

const payload = await readFile(
  resolve(
    join(
      <WorkspaceRoot>,
      <AppName>,
      'events/sum/sum7.json',
    ),
  ),
  { encoding: 'utf-8' },
);

const response = await lambdaClient.send(
  new InvokeCommand({
    FunctionName: <ExampleFunctionResourceName>,
    InvocationType: InvocationType.RequestResponse,
    LogType: LogType.None,
    Payload: payload,
  }),
);
```

#### Debug

### Start API Gateway Locally

#### Debug

### Deploy Application

### E2E Testing

## Construct Library

### Create a Construct Library

### Construct Library Structure

### Format Construct Library

### Lint Construct Library

### Test Construct Library (with Code Coverage)

### Use Construct Library

### Publish to npm

## TypeScript Library

### Create a TypeScript Library

### Use TypeScript Library

## Generators Reference

## Executors Reference
