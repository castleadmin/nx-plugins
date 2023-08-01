export interface ServeExecutorSchema {
  samConfiguration: string;
  terraformDirectory: string;
  api?: boolean;
  args?: string;
  __unparsed__: string[];
}
