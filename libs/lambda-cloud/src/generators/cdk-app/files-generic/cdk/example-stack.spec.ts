import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ExampleStack } from './example-stack';

describe('ExampleStack', () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  describe('Given an ExampleStack without properties,', () => {
    let stack: ExampleStack;

    beforeEach(() => {
      stack = new ExampleStack(app, 'TestExampleStack');
    });

    test('the created SQS Queue should have a VisibilityTimeout of 300 seconds.', () => {
      const template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::SQS::Queue', {
        VisibilityTimeout: 300,
      });
    });
  });
});
