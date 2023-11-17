#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import 'source-map-support/register';
import { ExampleStack } from './example-stack';

export const createApp = (): App => {
  const app = new App();

  createDevEnvironmentStacks(app);
  createStageEnvironmentStacks(app);
  createProdEnvironmentStacks(app);

  return app;
};

/**
 * Create and configure the stacks of the development environment.
 */
const createDevEnvironmentStacks = (app: App) => {
  new ExampleStack(app, 'DevExampleStack', {
    env: {
      region: 'eu-central-1',
    },
  });
};

/**
 * Create and configure the stacks of the staging environment.
 */
const createStageEnvironmentStacks = (app: App) => {
  new ExampleStack(app, 'StageExampleStack', {
    env: {
      region: 'eu-central-1',
    },
  });
};

/**
 * Create and configure the stacks of the production environment.
 */
const createProdEnvironmentStacks = (app: App) => {
  new ExampleStack(app, 'ProdExampleStack', {
    env: {
      region: 'eu-central-1',
    },
  });
};

createApp();
