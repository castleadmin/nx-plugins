# NxPlugins

Monorepo for Nx plugins

## [nx-serverless-cdk](https://github.com/castleadmin/nx-plugins/tree/main/nx-serverless-cdk/plugin)

[nx-serverless-cdk](https://github.com/castleadmin/nx-plugins/tree/main/nx-serverless-cdk/plugin) is an **Nx plugin** for creating **AWS CDK applications** and **libraries** inside an [**Nx monorepo**](https://nx.dev/concepts/more-concepts/why-monorepos).
It offers the possibility to **test** and **debug** CDK applications as well as AWS Lambda functions **locally**.
The plugin provides the **full flexibility** of the **AWS CDK CLI** and the local **AWS SAM CLI** commands.
It aims to make the **usage** of these tools **as easy as possible** inside an **Nx monorepo**.

## Plugin Commands

### Lint a plugin

The [lint](https://nx.dev/nx-api/eslint/executors/lint) command
is used to lint a plugin with ESLint.

```bash
nx run <PluginName>:lint
```

### Test a plugin

The [test](https://nx.dev/nx-api/jest/executors/jest) command
is used to execute the test cases with Jest.

```bash
nx run <PluginName>:test
```

Add the `--codeCoverage` option to enable code coverage.

```bash
nx run <PluginName>:test --codeCoverage
```

### Build a plugin

The [build](https://nx.dev/nx-api/js/executors/tsc) command
is used to build a plugin with the TypeScript compiler.

```bash
nx run <PluginName>:build
```

### Run the pre-commit checks

To run the pre-commit checks execute

```bash
npm run pre:commit
```

### Publish a plugin

The publish command is used to publish a plugin to npm.

```bash
nx run <PluginName>:publish --ver <PluginVersion> --tag <PluginVersionTag>
```

Options:

- --ver
  - Plugin version
- --tag
  - Tag of the version (e.g. `latest`)

### Run the Unix E2E tests

The [e2e](https://nx.dev/nx-api/jest/executors/jest) command
is used to execute the Unix E2E tests with Jest.

```bash
nx run <PluginName>-unix-e2e:e2e
```

Add the `--codeCoverage` option to enable code coverage.

```bash
nx run <PluginName>-unix-e2e:e2e --codeCoverage
```

> [!NOTE]
> The Unix E2E tests must be executed on a Unix system.

### Run the Windows E2E tests

The [e2e](https://nx.dev/nx-api/jest/executors/jest) command
is used to execute the Windows E2E tests with Jest.

```bash
nx run <PluginName>-windows-e2e:e2e
```

Add the `--codeCoverage` option to enable code coverage.

```bash
nx run <PluginName>-windows-e2e:e2e --codeCoverage
```

> [!NOTE]
> The Windows E2E tests must be executed on a Windows system.
