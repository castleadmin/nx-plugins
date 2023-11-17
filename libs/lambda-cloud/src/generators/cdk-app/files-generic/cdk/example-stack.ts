import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export interface ExampleStackProps extends StackProps {
  // Define stack properties here

  queueVisibilityTimeout?: number;
}

export class ExampleStack extends Stack {
  constructor(scope: Construct, id: string, props: ExampleStackProps = {}) {
    super(scope, id, props);

    const { queueVisibilityTimeout } = props;

    // The code that defines your stack goes here

    // Example resource
    new Queue(this, 'ExampleQueue', {
      visibilityTimeout: Duration.seconds(queueVisibilityTimeout ?? 300),
    });
  }
}
