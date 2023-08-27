import { BuildStrategy } from './build-strategy';

export const executeBuild: BuildStrategy = async (options, context) => {
  console.log(options, context);
  return undefined;
};

export default executeBuild;
