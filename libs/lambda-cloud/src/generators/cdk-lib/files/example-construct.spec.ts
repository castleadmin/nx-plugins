import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ExampleConstruct } from './example-construct';

describe('ExampleConstruct', () => {
  let app: App;
  let stack: Stack;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestStack');
  });

  describe('Given an ExampleConstruct without properties,', () => {
    beforeEach(() => {
      new ExampleConstruct(stack, 'TestExampleConstruct');
    });

    test('the created SQS Queue should have a VisibilityTimeout of 300 seconds.', () => {
      const template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::SQS::Queue', {
        VisibilityTimeout: 300,
      });
    });
  });
});
