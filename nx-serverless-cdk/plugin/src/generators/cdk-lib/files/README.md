# <%= projectName %>

### Table of Contents

- [Construct Library Structure](#construct-library-structure)
- [Format the Construct Library](#format-the-construct-library)
- [Lint the Construct Library](#lint-the-construct-library)
- [Test the Construct Library (with Code Coverage)](#test-the-construct-library-with-code-coverage)
  - [Watch](#watch)
  - [Debug](#debug)
- [Use the Construct Library](#use-the-construct-library)
- [Build the Construct Library](#build-the-construct-library)
- [Publish to npm](#publish-to-npm)
- [Construct Library Commands Reference](#construct-library-commands-reference)
  - [lint](#lint)
  - [test](#test)
  - [build](#build)
  - [build-declarations](#build-declarations)
  - [publish](#publish)
- [Debug in Chrome](#debug-in-chrome)

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
nx format --projects <%= projectName %>
```

### Lint the Construct Library

To lint the construct library execute

```bash
nx lint <%= projectName %>
```

or

```bash
nx run <%= projectName %>:lint
```

### Test the Construct Library (with Code Coverage)

To test the construct library execute

```bash
nx test <%= projectName %>
```

or

```bash
nx run <%= projectName %>:test
```

Add the `--codeCoverage` option to enable code coverage.

```bash
nx run <%= projectName %>:test --codeCoverage
```

#### Watch

To automatically rerun the construct library tests after a file has been changed, execute

```bash
nx run <%= projectName %>:test --watch
```

#### Debug

Add the `debugger;` statement to the code at the location where the debugging session should start.

In the `.env.test` file uncomment the `NODE_OPTIONS` variable.

Execute the test command with the `--runInBand` option

```bash
nx run <%= projectName %>:test --runInBand
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
import { ExampleConstruct } from '<%= importPath %>';
```

Please note that the construct library doesn't have to be built to be imported by its consumers.

### Build the Construct Library

To build the construct library execute

```bash
nx run <%= projectName %>:build
```

The build output is written to `<WorkspaceRoot>/dist/<%= projectName %>`.

### Publish to npm

To publish the construct library to npm execute

```bash
nx run <%= projectName %>:publish --ver <LibVersion> --tag <LibVersionTag>
```

### Construct Library Commands Reference

#### lint

```bash
nx run <%= projectName %>:lint [Options]
```

The [lint](https://nx.dev/nx-api/eslint/executors/lint) command
is used to lint the construct library with ESLint (see [Lint the Construct Library](#lint-the-construct-library)).

Options:

- --help
  - Displays the command options

#### test

```bash
nx run <%= projectName %>:test [Options]
```

The [test](https://nx.dev/nx-api/jest/executors/jest) command
is used to execute the test cases with Jest (see [Test the Construct Library (with Code Coverage)](#test-the-construct-library-with-code-coverage)).

Options:

- --help
  - Displays the command options

#### build

```bash
nx run <%= projectName %>:build [Options]
```

The [build](https://nx.dev/nx-api/esbuild/executors/esbuild) command
is used to build the construct library with esbuild (see [Build the Construct Library](#build-the-construct-library)).
The build-declarations command is always executed before the build command.

Options:

- --help
  - Displays the command options

#### build-declarations

```bash
nx run <%= projectName %>:build-declarations [Options]
```

The [build-declarations](https://nx.dev/nx-api/js/executors/tsc) command
is used to create the construct library's TypeScript declarations with the TypeScript compiler (see [Build the Construct Library](#build-the-construct-library)).

Options:

- --help
  - Displays the command options

#### publish

```bash
nx run <%= projectName %>:publish [Options]
```

The publish command is used to publish the construct library to an npm repository (see [Publish to npm](#publish-to-npm)).

Options:

- --ver
  - Construct library version
- --tag
  - Tag of the version (e.g. `latest`)

### Debug in Chrome

Open a new tab in the Chrome browser and navigate to `chrome://inspect`.

Click on `Open dedicated DevTools for Node` and navigate in the new window to the `Sources` tab.

Wait for the source code to appear and then click on the play button (Resume script execution) in the right panel.

The debugger jumps to the `debugger;` statement that has been added to the source code.
Move from this point onward by using the debugger step commands and additional breakpoints.
