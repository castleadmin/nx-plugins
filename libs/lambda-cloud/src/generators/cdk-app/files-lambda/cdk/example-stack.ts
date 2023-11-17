import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { LogFormat, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import {
  Charset,
  NodejsFunction,
  OutputFormat,
  SourceMapMode,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { resolve } from 'node:path';

export interface ExampleStackProps extends StackProps {
  // Define stack properties here

  build: {
    minify: boolean;
    sourceMapMode: SourceMapMode;
    tsconfig: string;
  };
}

export class ExampleStack extends Stack {
  constructor(scope: Construct, id: string, props: ExampleStackProps) {
    super(scope, id, props);

    const { minify, sourceMapMode, tsconfig } = props.build;

    // The code that defines your stack goes here

    // Example resource
    new NodejsFunction(this, 'ExampleFunction', {
      bundling: {
        charset: Charset.UTF8,
        format: OutputFormat.ESM,
        minify,
        sourceMap: true,
        sourceMapMode,
        tsconfig,
      },
      description: 'An example Lambda function.',
      entry: resolve(__dirname, '../src/example-handler.ts'),
      environment: {
        EXAMPLE_VARIABLE: 'example value',
      },
      handler: 'example-handler.exampleHandler',
      logFormat: LogFormat.JSON,
      logRetention: RetentionDays.THREE_MONTHS,
      memorySize: 128,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(29),
      tracing: Tracing.ACTIVE,
    });
  }
}
