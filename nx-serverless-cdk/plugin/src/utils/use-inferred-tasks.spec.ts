import { useInferredTasks } from './use-inferred-tasks';

describe('useInferredTasks', () => {
  test("Given the environment variable NX_ADD_PLUGINS with the value 'true', then inferred tasks should be used.", () => {
    process.env['NX_ADD_PLUGINS'] = 'true';
    expect(useInferredTasks()).toBe(true);
  });

  test("Given the environment variable NX_ADD_PLUGINS with the value 'false', then inferred tasks shouldn't be used.", () => {
    process.env['NX_ADD_PLUGINS'] = 'false';
    expect(useInferredTasks()).toBe(false);
  });

  test("Given the environment variable NX_ADD_PLUGINS hasn't been defined, then inferred tasks should be used.", () => {
    delete process.env['NX_ADD_PLUGINS'];
    expect(useInferredTasks()).toBe(true);
  });
});
