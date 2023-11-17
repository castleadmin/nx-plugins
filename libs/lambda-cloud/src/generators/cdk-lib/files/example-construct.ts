import { Duration } from 'aws-cdk-lib';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export interface ExampleConstructProps {
  // Define construct properties here

  queueVisibilityTimeout?: number;
}

export class ExampleConstruct extends Construct {
  constructor(scope: Construct, id: string, props: ExampleConstructProps = {}) {
    super(scope, id);

    const { queueVisibilityTimeout } = props;

    // Define construct contents here

    // Example resource
    new Queue(this, 'ExampleQueue', {
      visibilityTimeout: Duration.seconds(queueVisibilityTimeout ?? 300),
    });
  }
}
