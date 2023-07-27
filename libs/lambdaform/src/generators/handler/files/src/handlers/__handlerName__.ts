import { Context, Handler } from 'aws-lambda';

export const handler: Handler<unknown, unknown> = async (
  event: unknown,
  context: Context
): Promise<unknown> => {
  console.log('event', JSON.stringify(event, null, 2));
  console.log('context', JSON.stringify(context, null, 2));

  return undefined;
};
