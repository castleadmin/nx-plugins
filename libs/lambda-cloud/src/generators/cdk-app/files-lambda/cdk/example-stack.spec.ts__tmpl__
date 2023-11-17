import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { SourceMapMode } from 'aws-cdk-lib/aws-lambda-nodejs';
import { ExampleStack } from './example-stack';

describe('ExampleStack', () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  describe('Given an ExampleStack,', () => {
    let stack: ExampleStack;

    beforeEach(() => {
      stack = new ExampleStack(app, 'TestExampleStack', {
        build: {
          minify: true,
          sourceMapMode: SourceMapMode.EXTERNAL,
          tsconfig: '../tsconfig.app.json',
        },
      });
    });

    test('an example Lambda function should be created.', () => {
      const template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Lambda::Function', {
        Handler: 'example-handler.exampleHandler',
      });
    });
  });
});
