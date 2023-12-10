# NxPlugins

Monorepo for Nx plugins

## [nx-serverless-cdk](https://github.com/castleadmin/nx-plugins/tree/main/nx-serverless-cdk/plugin)

[nx-serverless-cdk](https://github.com/castleadmin/nx-plugins/tree/main/nx-serverless-cdk/plugin) is an **Nx plugin** for creating **AWS CDK applications** and **libraries** inside an [**Nx monorepo**](https://nx.dev/concepts/more-concepts/why-monorepos).
It offers the possibility to **test** and **debug** CDK applications as well as AWS Lambda functions **locally**.
The plugin provides the **full flexibility** of the **AWS CDK CLI** and the local **AWS SAM CLI** commands.
It aims to make the **usage** of these tools **as easy as possible** inside an **Nx monorepo**.

## Plugin Commands

### Lint a plugin

To lint a plugin execute

```bash
nx run <PluginName>:lint
```

### Test a plugin

To test a plugin execute

```bash
nx run <PluginName>:test
```

Add the `--codeCoverage` option to enable code coverage.

```bash
nx run <PluginName>:test --codeCoverage
```

### Build a plugin

To build a plugin execute

```bash
nx run <PluginName>:build
```

### Run the pre-commit checks

To run the pre-commit checks execute

```bash
npm run pre:commit
```

### Publish a plugin

To publish a plugin to npm execute

```bash
nx run <PluginName>:publish --ver <PluginVersion> --tag <PluginVersionTag>
```

### Run the Unix E2E tests

To run the Unix E2E tests of a plugin execute

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

To run the Windows E2E tests of a plugin execute

```bash
nx run <PluginName>-windows-e2e:e2e
```

Add the `--codeCoverage` option to enable code coverage.

```bash
nx run <PluginName>-windows-e2e:e2e --codeCoverage
```

> [!NOTE]
> The Windows E2E tests must be executed on a Windows system.
