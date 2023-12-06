# nx-serverless-cdk

**nx-serverless-cdk** is an **Nx plugin** for creating **AWS CDK applications** and **libraries** inside an [**Nx monorepo**](https://nx.dev/concepts/more-concepts/why-monorepos).
It offers the possibility to **test** and **debug** CDK applications as well as AWS Lambda functions **locally**.
The plugin provides the **full flexibility** of the **AWS CDK CLI** and the local **AWS SAM CLI** commands.
It aims to make the **usage** of these tools **as easy as possible** inside an **Nx monorepo**.

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
- Define everything in **TypeScript**

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

## Create an Application

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
- `tsconfig.app.json` TypeScript runtime code configuration
- `tsconfig.cdk.json` TypeScript infrastructure code configuration
- `tsconfig.json` shared TypeScript configuration
- `tsconfig.spec.json` TypeScript test code configuration

### Linting

### Testing (with Code Coverage)

### Debug Infrastructure Code

### Invoke a Lambda Function Locally

#### Debugging

### Start Lambda Functions Locally

#### Debugging

### Start API Gateway Locally

#### Debugging

### Deploy Application

### E2E Testing

## Create a CDK Construct Library

### Library Structure

### Linting

### Testing (with Code Coverage)

### Use inside an Application

### Publish to npm

## Create a TypeScript Library

## Generators Reference

## Executors Reference
