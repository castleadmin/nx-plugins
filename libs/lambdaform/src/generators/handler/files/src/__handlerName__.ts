import { Context, Handler } from 'aws-lambda';

// TODO define event type
export type Event = unknown;
// TODO define result type
export type Result = unknown;

export const handler: Handler<Event, Result> = async (
  event: Event,
  context: Context
): Promise<Result> => {
  console.log('event', JSON.stringify(event, null, 2));
  console.log('context', JSON.stringify(context, null, 2));

  return undefined;
};
