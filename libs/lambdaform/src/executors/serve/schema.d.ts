export interface ServeExecutorSchema {
  _: string[] | undefined;
  samConfiguration: string;
  terraformDirectory: string;
  api?: boolean;
  args?: string;
}
