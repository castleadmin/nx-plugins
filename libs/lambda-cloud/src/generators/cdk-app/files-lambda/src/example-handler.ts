import { Context } from 'aws-lambda';
import { ExampleEvent } from './example-event';
import { ExampleResult } from './example-result';

/**
 * The entry point of the example Lambda function.
 */
export const exampleHandler = async (
  event: ExampleEvent,
  context: Context
): Promise<ExampleResult> => {
  console.log('event', '\n', JSON.stringify(event));
  console.log('context', '\n', JSON.stringify(context));

  return {
    sum: event.a + event.b,
  };
};
