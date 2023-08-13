export interface InvokeExecutorSchema {
  _: string[] | undefined;
  samConfiguration: string;
  terraformDirectory: string;
  args?: string;
  shell?: string;
}
