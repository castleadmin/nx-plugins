import { Context } from 'aws-lambda';
import { createHash } from 'node:crypto';
import { exampleApiHandler } from './example-api-handler';
import { ExampleApiEvent } from './example-api-handler-types';

describe('example-api-handler', () => {
  let context: Context;

  beforeEach(() => {
    context = {} as unknown as Context;
  });

  describe('Given an event with 2 numbers,', () => {
    let event: Partial<ExampleApiEvent>;

    beforeEach(() => {
      event = {
        queryStringParameters: {
          a: '4',
          b: '5',
        },
      };
    });

    test('the handler should return the product of the given numbers.', async () => {
      const expectedResultBodyString = JSON.stringify({
        product: 20,
      });

      const result = await exampleApiHandler(event as ExampleApiEvent, context);

      expect(result).toEqual({
        statusCode: 200,
        headers: {
          'Cache-Control': 'public, max-age=60',
          ETag: createHash('sha512')
            .update(expectedResultBodyString)
            .digest('base64url'),
        },
        body: expectedResultBodyString,
      });
    });
  });
});
