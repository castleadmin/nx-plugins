import { App } from 'aws-cdk-lib';
import { createApp } from './app';

describe('App', () => {
  describe('Given an app,', () => {
    let app: App;

    beforeEach(() => {
      app = createApp();
    });

    test('the app should contain all stacks of all environments.', () => {
      const children = app.node.children;

      expect(children.map((stack) => stack.node.id)).toEqual([
        'DevExampleStack',
        'StageExampleStack',
        'ProdExampleStack',
      ]);
    });
  });
});
