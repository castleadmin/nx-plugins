export interface ApplyExecutorSchema {
  workspace?: string;
  interactive: boolean;
  args?: string;
  planOutput: string;
  terraformDirectory: string;
  shell?: string;
}
