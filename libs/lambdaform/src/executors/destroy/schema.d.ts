export interface DestroyExecutorSchema {
  workspace?: string;
  interactive: boolean;
  args?: string;
  terraformDirectory: string;
  shell?: string;
}
