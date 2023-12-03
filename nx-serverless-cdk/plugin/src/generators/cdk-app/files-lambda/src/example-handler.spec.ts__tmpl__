import { Context } from 'aws-lambda';
import { exampleHandler } from './example-handler';
import { ExampleEvent } from './example-handler-types';

describe('example-handler', () => {
  let context: Context;

  beforeEach(() => {
    context = {} as unknown as Context;
  });

  describe('Given an event with 2 numbers,', () => {
    let event: ExampleEvent;

    beforeEach(() => {
      event = {
        a: 4,
        b: 5,
      };
    });

    test('the handler should return the sum of the given numbers.', async () => {
      const result = await exampleHandler(event, context);

      expect(result).toEqual({
        sum: 9,
      });
    });
  });
});
