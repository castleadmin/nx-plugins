export interface BuildExecutorSchema {
  handlers: {
    name: string;
    path: string;
  }[];
  tsConfig: string;
  outputPath: string;
  rollupConfig?: string;
  // TODO make assets nx conform
  assets: string[];
  deleteOutputPath: boolean;
  externalDependencies: string[];
  outputFileName: string;
  watch: boolean;
}
