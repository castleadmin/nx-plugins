export const useInferredTasks = (): boolean => {
  return process.env['NX_ADD_PLUGINS'] !== 'false';
};
