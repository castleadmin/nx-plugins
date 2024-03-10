import { Duration } from 'aws-cdk-lib';
import { LogFormat, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import {
  Charset,
  OutputFormat,
  SourceMapMode,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Environment } from '../shared/environment';

export const createDefaultLambdaProps = (options: {
  environment: Environment;
  serviceName: string;
  build: {
    minify: boolean;
    sourceMapMode: SourceMapMode;
    tsconfig: string;
  };
}) => {
  const { environment, serviceName, build } = options;
  const { minify, sourceMapMode, tsconfig } = build;

  return {
    bundling: {
      charset: Charset.UTF8,
      format: OutputFormat.ESM,
      minify,
      sourceMap: true,
      sourceMapMode,
      tsconfig,
    },
    environment: {
      ENVIRONMENT: environment,
      POWERTOOLS_SERVICE_NAME: serviceName,
    },
    logFormat: LogFormat.JSON,
    logRetention: RetentionDays.THREE_MONTHS,
    memorySize: 128,
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.seconds(29),
    tracing: Tracing.ACTIVE,
  };
};
